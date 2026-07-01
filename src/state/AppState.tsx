import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { calcSessionPackTotal, calcNewMembershipExpiry } from '../lib/pricing';
import { isExpiryValid, countClassesBookedThisWeek, classesRemaining, trialDaysRemaining } from '../lib/membership';
import { allDocsApproved, resolveAccessView } from '../lib/access';
import type {
  Member,
  CurrentUser,
  Class,
  MembershipType,
  NewClassForm,
  NewMemberForm,
  NewMembershipTypeForm,
  PaymentTransaction,
  PaymentMethodType,
  PersonalSession,
  SessionStatus,
  FeedPost,
  SessionPack,
  NewSessionPackForm,
  MembershipHistoryEntry,
} from '../types';

interface AppStateContextType {
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  authLoading: boolean;
  magicLinkSent: boolean;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  membershipTypes: MembershipType[];
  setMembershipTypes: React.Dispatch<React.SetStateAction<MembershipType[]>>;
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  newClass: NewClassForm;
  setNewClass: React.Dispatch<React.SetStateAction<NewClassForm>>;
  newMember: NewMemberForm;
  setNewMember: React.Dispatch<React.SetStateAction<NewMemberForm>>;
  newMembershipType: NewMembershipTypeForm;
  setNewMembershipType: React.Dispatch<React.SetStateAction<NewMembershipTypeForm>>;
  adminTab: string;
  setAdminTab: React.Dispatch<React.SetStateAction<string>>;
  editingMember: Member | null;
  setEditingMember: React.Dispatch<React.SetStateAction<Member | null>>;
  days: string[];
  isMembershipValid: (memberId: string) => boolean;
  getClassesRemaining: () => number;
  getTrialDaysRemaining: () => number | null;
  getAvailableSpots: (c: Class) => number;
  isSignedUp: (classId: number) => boolean;
  handlePasswordLogin: (email: string, password: string) => Promise<void>;
  handleForgotPassword: (email: string) => Promise<void>;
  handleMagicLink: (email: string) => Promise<void>;
  handleCreateMemberProfile: (name: string, password?: string) => Promise<void>;
  checkAccessStatus: () => Promise<void>;
  handleAddClass: () => void;
  handleDeleteClass: (id: number) => void;
  handleAddMember: () => void;
  handleAddMembershipType: () => void;
  handleEditMember: (m: Member) => void;
  handleSaveMember: () => void;
  handleAddCredit: (memberId: string) => void;
  handleSignUp: (classId: number, useCredit?: boolean) => void;
  handleCancel: (classId: number) => void;
  logout: () => Promise<void>;
  sessionPacks: SessionPack[];
  setSessionPacks: React.Dispatch<React.SetStateAction<SessionPack[]>>;
  newSessionPack: NewSessionPackForm;
  setNewSessionPack: React.Dispatch<React.SetStateAction<NewSessionPackForm>>;
  handleAddSessionPack: () => void;
  handleDeleteSessionPack: (id: number) => void;
  payments: PaymentTransaction[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
  handleRecordPayment: (memberId: string, productType: 'membership' | 'pack', productId: string, method: PaymentMethodType, reference: string, date: string) => void;
  personalSessions: PersonalSession[];
  setPersonalSessions: React.Dispatch<React.SetStateAction<PersonalSession[]>>;
  handleBookSession: (date: string, time: string, duration: number, notes: string) => void;
  handleUpdateSessionStatus: (id: number, status: SessionStatus) => void;
  feedPosts: FeedPost[];
  handleCreatePost: (content: string) => void;
  handleDeletePost: (id: number) => void;
  handleLikePost: (postId: number) => void;
  handleAddComment: (postId: number, text: string) => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export const useAppState = (): AppStateContextType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};

const isMember = (user: CurrentUser | null): user is Member =>
  !!user && 'email' in user;

// ── DB row shapes (snake_case) → app types (camelCase) ──────────────────────
interface ClassRow { id: number; name: string; day: string; time: string; instructor: string; location: string; capacity: number; }
interface SignupRow { class_id: number; member_id: string; }
interface MembershipTypeRow { id: string; name: string; price: number; classes_per_week: number; duration_days: number | null; }
interface SessionPackRow { id: number; name: string; price: number; credits: number; price_per_session: number | null; session_duration: number | null; sales_tax: number | null; }
interface MemberRow { id: string; name: string; email: string; membership_type: string | null; membership_expiry: string | null; class_credits: number | null; google_calendar_enabled: boolean | null; trial_used: boolean | null; membership_history: MembershipHistoryEntry[] | null; }
interface PaymentRow { id: number; member_id: string; member_name: string; amount: number; method: PaymentMethodType; reference: string; date: string; membership_type_id: string | null; }
interface SessionRow { id: number; member_id: string; member_name: string; date: string; time: string; duration: number; status: SessionStatus; notes: string; }
interface PostRow { id: number; content: string; created_at: string; }
interface CommentRow { id: number; post_id: number; member_id: string; member_name: string; text: string; created_at: string; }
interface LikeRow { post_id: number; member_id: string; }

const mapMembershipType = (r: MembershipTypeRow): MembershipType => ({
  id: r.id, name: r.name, price: Number(r.price), classesPerWeek: r.classes_per_week,
  ...(r.duration_days != null ? { durationDays: r.duration_days } : {}),
});
const mapSessionPack = (r: SessionPackRow): SessionPack => ({
  id: r.id, name: r.name, price: Number(r.price), credits: r.credits,
  pricePerSession: r.price_per_session != null ? Number(r.price_per_session) : undefined,
  sessionDuration: r.session_duration ?? undefined,
  salesTax: r.sales_tax != null ? Number(r.sales_tax) : null,
});
const mapMember = (r: MemberRow): Member => ({
  id: r.id, name: r.name, email: r.email,
  membershipType: r.membership_type ?? '', membershipExpiry: r.membership_expiry ?? '',
  classCredits: r.class_credits ?? 0, googleCalendarEnabled: r.google_calendar_enabled ?? false,
  trialUsed: r.trial_used ?? false, membershipHistory: r.membership_history ?? [],
});
const mapPayment = (r: PaymentRow): PaymentTransaction => ({
  id: r.id, memberId: r.member_id, memberName: r.member_name, amount: Number(r.amount),
  method: r.method, reference: r.reference, date: r.date, membershipTypeId: r.membership_type_id ?? '',
});
const mapSession = (r: SessionRow): PersonalSession => ({
  id: r.id, memberId: r.member_id, memberName: r.member_name, date: r.date,
  time: r.time, duration: r.duration, status: r.status, notes: r.notes,
});

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClass, setNewClass] = useState<NewClassForm>({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
  const [newMember, setNewMember] = useState<NewMemberForm>({ name: '', email: '', membershipExpiry: '', membershipType: '1x/week', classCredits: 0 });
  const [newMembershipType, setNewMembershipType] = useState<NewMembershipTypeForm>({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [personalSessions, setPersonalSessions] = useState<PersonalSession[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [sessionPacks, setSessionPacks] = useState<SessionPack[]>([]);
  const [newSessionPack, setNewSessionPack] = useState<NewSessionPackForm>({ name: '', credits: '', pricePerSession: '', sessionDuration: '60', customDuration: '', addSalesTax: false, salesTax: '' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // ── Auth ─────────────────────────────────────────────────────────
  const authResolved = useRef(false);
  const inPasswordRecovery = useRef(false);

  useEffect(() => {
    const handleAuthUser = async (user: User) => {
      if (!authResolved.current) setAuthLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .single();

      // A PASSWORD_RECOVERY event may have started while we were awaiting; if so,
      // bail out so we don't override the reset-password view and push into the app.
      if (inPasswordRecovery.current) { setAuthLoading(false); return; }

      if (profile?.role === 'trainer') {
        setCurrentUser({ id: 'trainer', name: profile.name || 'Trainer', role: 'trainer' });
        setView('trainerDashboard');
        authResolved.current = true;
        setAuthLoading(false);
        return;
      }

      if (profile?.role === 'member') {
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single();

        if (inPasswordRecovery.current) { setAuthLoading(false); return; }

        if (member) {
          setCurrentUser({
            id: user.id,
            name: member.name,
            email: user.email ?? '',
            membershipType: member.membership_type ?? '',
            membershipExpiry: member.membership_expiry ?? '',
            classCredits: member.class_credits ?? 0,
            googleCalendarEnabled: member.google_calendar_enabled ?? false,
            trialUsed: member.trial_used ?? false,
          });

          const [{ data: requiredDocs }, { data: approvedDocs }] = await Promise.all([
            supabase.from('documents').select('id').eq('required', true),
            supabase.from('member_documents').select('document_id').eq('member_id', user.id).eq('status', 'approved'),
          ]);

          if (inPasswordRecovery.current) { setAuthLoading(false); return; }

          setView(resolveAccessView({
            docsApproved: allDocsApproved(
              (requiredDocs ?? []).map(d => d.id),
              (approvedDocs ?? []).map(a => a.document_id),
            ),
            trialUsed: !!member.trial_used,
            membershipExpiry: member.membership_expiry,
            classCredits: member.class_credits ?? 0,
          }));

          authResolved.current = true;
          setAuthLoading(false);
          return;
        }
      }

      // No profile yet — new client
      setView('onboarding');
      authResolved.current = true;
      setAuthLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        inPasswordRecovery.current = true;
        authResolved.current = true;
        setCurrentUser(null);
        setView('resetPassword');
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        // Handled before the recovery-ignore branch so completing a password
        // reset (which signs out) still routes back to login.
        inPasswordRecovery.current = false;
        authResolved.current = false;
        setCurrentUser(null);
        setView('login');
        setMagicLinkSent(false);
        setAuthLoading(false);
      } else if (inPasswordRecovery.current) {
        // Ignore SIGNED_IN / TOKEN_REFRESHED that fire alongside PASSWORD_RECOVERY
      } else if (session?.user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        handleAuthUser(session.user);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Data load ────────────────────────────────────────────────────
  // Pulls all shared + own data once a user is authenticated. RLS scopes
  // what each role can actually read.
  const loadData = async () => {
    const [
      { data: classRows },
      { data: signupRows },
      { data: typeRows },
      { data: memberRows },
      { data: paymentRows },
      { data: sessionRows },
      { data: postRows },
      { data: commentRows },
      { data: likeRows },
      { data: packRows },
    ] = await Promise.all([
      supabase.from('classes').select('*').order('id'),
      supabase.from('class_signups').select('class_id, member_id'),
      supabase.from('membership_types').select('*').order('price'),
      supabase.from('members').select('*'),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('personal_sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('feed_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('feed_comments').select('*').order('created_at'),
      supabase.from('feed_likes').select('post_id, member_id'),
      supabase.from('session_packs').select('*').order('price'),
    ]);

    const signups = (signupRows ?? []) as SignupRow[];
    setClasses(((classRows ?? []) as ClassRow[]).map(c => ({
      ...c,
      signups: signups.filter(s => s.class_id === c.id).map(s => s.member_id),
    })));
    setMembershipTypes(((typeRows ?? []) as MembershipTypeRow[]).map(mapMembershipType));
    setSessionPacks(((packRows ?? []) as SessionPackRow[]).map(mapSessionPack));
    setMembers(((memberRows ?? []) as MemberRow[]).map(mapMember));
    setPayments(((paymentRows ?? []) as PaymentRow[]).map(mapPayment));
    setPersonalSessions(((sessionRows ?? []) as SessionRow[]).map(mapSession));

    const comments = (commentRows ?? []) as CommentRow[];
    const likes = (likeRows ?? []) as LikeRow[];
    setFeedPosts(((postRows ?? []) as PostRow[]).map(p => ({
      id: p.id,
      content: p.content,
      createdAt: p.created_at,
      likes: likes.filter(l => l.post_id === p.id).map(l => l.member_id),
      comments: comments.filter(c => c.post_id === p.id).map(c => ({
        id: c.id, memberId: c.member_id, memberName: c.member_name, text: c.text, createdAt: c.created_at,
      })),
    })));
  };

  useEffect(() => {
    if (currentUser) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handlePasswordLogin = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleForgotPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  const handleMagicLink = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    setMagicLinkSent(true);
  };

  const handleCreateMemberProfile = async (name: string, password?: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;

    // Optional: let the client set a password now so they can log in without a
    // magic link next time. They can also skip this and set one later.
    if (password) {
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) alert(`Profile saved, but setting your password failed: ${pwError.message}`);
    }

    await supabase.from('profiles').insert({ id: user.id, role: 'member', name: name.trim() });
    await supabase.from('members').insert({
      id: user.id,
      name: name.trim(),
      email: user.email,
      trial_used: false,
    });

    setCurrentUser({
      id: user.id,
      name: name.trim(),
      email: user.email ?? '',
      membershipType: '',
      membershipExpiry: '',
      classCredits: 0,
      googleCalendarEnabled: false,
      trialUsed: false,
    });
  };

  const checkAccessStatus = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: requiredDocs }, { data: approvedDocs }, { data: member }] = await Promise.all([
      supabase.from('documents').select('id').eq('required', true),
      supabase.from('member_documents').select('document_id').eq('member_id', user.id).eq('status', 'approved'),
      supabase.from('members').select('trial_used, membership_expiry, class_credits').eq('id', user.id).single(),
    ]);

    setView(resolveAccessView({
      docsApproved: allDocsApproved(
        (requiredDocs ?? []).map(d => d.id),
        (approvedDocs ?? []).map(a => a.document_id),
      ),
      trialUsed: !!member?.trial_used,
      membershipExpiry: member?.membership_expiry,
      classCredits: member?.class_credits ?? 0,
    }));
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  // ── Membership ───────────────────────────────────────────────────
  const isMembershipValid = (memberId: string): boolean => {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;
    return isExpiryValid(member.membershipExpiry);
  };

  const getClassesRemaining = (): number => {
    if (!isMember(currentUser)) return 0;
    const memberType = membershipTypes.find(m => m.id === currentUser.membershipType);
    const booked = countClassesBookedThisWeek(classes, currentUser.id);
    return classesRemaining(currentUser.membershipExpiry, memberType?.classesPerWeek ?? null, booked);
  };

  const getTrialDaysRemaining = (): number | null => {
    if (!isMember(currentUser)) return null;
    return trialDaysRemaining(currentUser.membershipType, currentUser.membershipExpiry);
  };

  const getAvailableSpots = (c: Class): number => c.capacity - c.signups.length;

  const isSignedUp = (classId: number): boolean => {
    if (!isMember(currentUser)) return false;
    return classes.find(c => c.id === classId)?.signups.includes(currentUser.id) ?? false;
  };

  // ── Classes ──────────────────────────────────────────────────────
  const handleAddClass = async () => {
    if (newClass.name && newClass.day && newClass.time) {
      const { data, error } = await supabase.from('classes').insert({
        name: newClass.name,
        day: newClass.day,
        time: newClass.time,
        instructor: newClass.instructor,
        location: newClass.location,
        capacity: parseInt(String(newClass.capacity)) || 10,
      }).select().single();
      if (error || !data) return;
      setClasses(prev => [...prev, { ...(data as ClassRow), signups: [] }]);
      setNewClass({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
    }
  };

  const handleDeleteClass = async (id: number) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) return;
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // ── Members ──────────────────────────────────────────────────────
  // Clients self-register through the magic-link login + onboarding flow,
  // which creates their auth user and members row. A trainer can't mint a
  // member row manually (members.id is a FK to auth.users). Surfacing this
  // until an invite-based flow is built.
  const handleAddMember = () => {
    alert('Clients now register themselves via the login link on the sign-in page. Manual member creation will return as an email invite flow.');
  };

  const handleAddMembershipType = async () => {
    if (!newMembershipType.name || newMembershipType.price === '' || newMembershipType.classesPerWeek === '') return;
    const id = newMembershipType.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const row = {
      id,
      name: newMembershipType.name,
      price: parseInt(newMembershipType.price) || 0,
      classes_per_week: parseInt(newMembershipType.classesPerWeek) || 1,
      duration_days: newMembershipType.durationDays ? parseInt(newMembershipType.durationDays) : null,
    };
    const { error } = await supabase.from('membership_types').insert(row);
    if (error) return;
    setMembershipTypes(prev => [...prev, mapMembershipType(row as MembershipTypeRow)]);
    setNewMembershipType({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  };

  // ── Session packs ────────────────────────────────────────────────
  const handleAddSessionPack = async () => {
    const sessions = parseInt(newSessionPack.credits) || 0;
    const perSession = parseFloat(newSessionPack.pricePerSession) || 0;
    if (!newSessionPack.name || sessions <= 0 || perSession <= 0) return;

    const duration = newSessionPack.sessionDuration === 'custom'
      ? (parseInt(newSessionPack.customDuration) || 0)
      : parseInt(newSessionPack.sessionDuration);
    const taxRate = newSessionPack.addSalesTax ? (parseFloat(newSessionPack.salesTax) || 0) : null;
    const price = calcSessionPackTotal(sessions, perSession, taxRate);

    const { data, error } = await supabase.from('session_packs').insert({
      name: newSessionPack.name,
      credits: sessions,
      price,
      price_per_session: perSession,
      session_duration: duration,
      sales_tax: taxRate,
    }).select().single();
    if (error || !data) return;
    setSessionPacks(prev => [...prev, mapSessionPack(data as SessionPackRow)]);
    setNewSessionPack({ name: '', credits: '', pricePerSession: '', sessionDuration: '60', customDuration: '', addSalesTax: false, salesTax: '' });
  };

  const handleDeleteSessionPack = async (id: number) => {
    const { error } = await supabase.from('session_packs').delete().eq('id', id);
    if (error) return;
    setSessionPacks(prev => prev.filter(p => p.id !== id));
  };

  const handleEditMember = (m: Member) => setEditingMember({ ...m });

  const handleSaveMember = async () => {
    if (!editingMember) return;
    const { error } = await supabase.from('members').update({
      name: editingMember.name,
      email: editingMember.email,
      membership_type: editingMember.membershipType,
      membership_expiry: editingMember.membershipExpiry || null,
    }).eq('id', editingMember.id);
    if (error) return;
    setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const handleAddCredit = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const next = (parseInt(String(member.classCredits)) || 0) + 1;
    const { error } = await supabase.from('members').update({ class_credits: next }).eq('id', memberId);
    if (error) return;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, classCredits: next } : m));
  };

  const handleSignUp = async (classId: number, useCredit = false) => {
    const remaining = getClassesRemaining();
    if (remaining <= 0 && !useCredit) {
      alert("You've reached your weekly booking limit. Use a class credit or upgrade your membership.");
      return;
    }
    if (useCredit && isMember(currentUser) && currentUser.classCredits <= 0) {
      alert('No class credits available.');
      return;
    }
    if (!isMember(currentUser)) return;
    const cls = classes.find(c => c.id === classId);
    if (!cls || cls.signups.length >= cls.capacity) return;

    const { error } = await supabase.from('class_signups').insert({
      class_id: classId, member_id: currentUser.id, used_credit: useCredit,
    });
    if (error) {
      alert(`Could not sign up: ${error.message}`);
      return;
    }

    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, signups: [...c.signups, currentUser.id] } : c
    ));

    if (useCredit) {
      const nextCredits = currentUser.classCredits - 1;
      await supabase.from('members').update({ class_credits: nextCredits }).eq('id', currentUser.id);
      setCurrentUser(prev => isMember(prev) ? { ...prev, classCredits: nextCredits } : prev);
      setMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, classCredits: nextCredits } : m));
    }
  };

  const handleCancel = async (classId: number) => {
    if (!isMember(currentUser)) return;
    const { error } = await supabase.from('class_signups')
      .delete().eq('class_id', classId).eq('member_id', currentUser.id);
    if (error) return;
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, signups: c.signups.filter(id => id !== currentUser.id) } : c
    ));
  };

  // ── Payments ─────────────────────────────────────────────────────
  // Trainer records a payment by selecting a product (a membership tier or a
  // session pack); the price comes from the product. A membership sets the
  // member's tier and extends expiry; a pack adds class credits. Every purchase
  // is appended to the member's membership_history.
  const handleRecordPayment = async (
    memberId: string,
    productType: 'membership' | 'pack',
    productId: string,
    method: PaymentMethodType,
    reference: string,
    date: string,
  ) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    let amount: number;
    let paymentType: 'membership' | 'credits';
    let membershipTypeId: string | null = null;
    let historyEntry: MembershipHistoryEntry;
    const memberUpdate: Record<string, unknown> = {};

    if (productType === 'membership') {
      const tier = membershipTypes.find(t => t.id === productId);
      if (!tier) return;
      amount = tier.price;
      paymentType = 'membership';
      membershipTypeId = tier.id;

      const newExpiry = calcNewMembershipExpiry(date, member.membershipExpiry, tier.durationDays);

      memberUpdate.membership_type = tier.id;
      memberUpdate.membership_expiry = newExpiry;
      historyEntry = { type: 'membership', productId: tier.id, productName: tier.name, amount, date, newExpiry };
    } else {
      const pack = sessionPacks.find(p => String(p.id) === productId);
      if (!pack) return;
      amount = pack.price;
      paymentType = 'credits';

      memberUpdate.class_credits = (member.classCredits || 0) + pack.credits;
      historyEntry = { type: 'pack', productId: String(pack.id), productName: pack.name, amount, date, creditsAdded: pack.credits };
    }

    const newHistory = [historyEntry, ...(member.membershipHistory ?? [])];
    memberUpdate.membership_history = newHistory;

    const { data, error } = await supabase.from('payments').insert({
      member_id: memberId,
      member_name: member.name,
      amount,
      method,
      reference,
      date,
      membership_type_id: membershipTypeId,
      type: paymentType,
    }).select().single();
    if (error || !data) {
      alert(`Could not record payment: ${error?.message ?? 'unknown error'}`);
      return;
    }

    const { error: updateError } = await supabase.from('members').update(memberUpdate).eq('id', memberId);
    if (updateError) alert(`Payment saved, but updating the member failed: ${updateError.message}`);

    setPayments(prev => [mapPayment(data as PaymentRow), ...prev]);
    setMembers(prev => prev.map(m => m.id === memberId ? {
      ...m,
      ...(productType === 'membership'
        ? { membershipType: historyEntry.productId, membershipExpiry: historyEntry.newExpiry ?? m.membershipExpiry }
        : { classCredits: (m.classCredits || 0) + (historyEntry.creditsAdded ?? 0) }),
      membershipHistory: newHistory,
    } : m));
  };

  // ── Sessions ─────────────────────────────────────────────────────
  const handleBookSession = async (date: string, time: string, duration: number, notes: string) => {
    if (!isMember(currentUser)) return;
    const { data, error } = await supabase.from('personal_sessions').insert({
      member_id: currentUser.id,
      member_name: currentUser.name,
      date, time, duration, status: 'pending', notes,
    }).select().single();
    if (error || !data) return;
    setPersonalSessions(prev => [mapSession(data as SessionRow), ...prev]);
  };

  const handleUpdateSessionStatus = async (id: number, status: SessionStatus) => {
    const { error } = await supabase.from('personal_sessions').update({ status }).eq('id', id);
    if (error) return;
    setPersonalSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // ── Feed ─────────────────────────────────────────────────────────
  const handleCreatePost = async (content: string) => {
    const { data, error } = await supabase.from('feed_posts').insert({ content }).select().single();
    if (error || !data) return;
    const row = data as PostRow;
    setFeedPosts(prev => [{ id: row.id, content: row.content, createdAt: row.created_at, likes: [], comments: [] }, ...prev]);
  };

  const handleDeletePost = async (id: number) => {
    const { error } = await supabase.from('feed_posts').delete().eq('id', id);
    if (error) return;
    setFeedPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleLikePost = async (postId: number) => {
    if (!isMember(currentUser)) return;
    const memberId = currentUser.id;
    const liked = feedPosts.find(p => p.id === postId)?.likes.includes(memberId) ?? false;
    if (liked) {
      const { error } = await supabase.from('feed_likes').delete().eq('post_id', postId).eq('member_id', memberId);
      if (error) return;
    } else {
      const { error } = await supabase.from('feed_likes').insert({ post_id: postId, member_id: memberId });
      if (error) return;
    }
    setFeedPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, likes: liked ? p.likes.filter(id => id !== memberId) : [...p.likes, memberId] };
    }));
  };

  const handleAddComment = async (postId: number, text: string) => {
    if (!isMember(currentUser) || !text.trim()) return;
    const { data, error } = await supabase.from('feed_comments').insert({
      post_id: postId, member_id: currentUser.id, member_name: currentUser.name, text: text.trim(),
    }).select().single();
    if (error || !data) return;
    const row = data as CommentRow;
    const comment = { id: row.id, memberId: row.member_id, memberName: row.member_name, text: row.text, createdAt: row.created_at };
    setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  };

  return (
    <AppStateContext.Provider value={{
      view, setView,
      currentUser, setCurrentUser,
      authLoading, magicLinkSent,
      members, setMembers,
      membershipTypes, setMembershipTypes,
      classes, setClasses,
      newClass, setNewClass,
      newMember, setNewMember,
      newMembershipType, setNewMembershipType,
      adminTab, setAdminTab,
      editingMember, setEditingMember,
      days,
      isMembershipValid,
      getClassesRemaining,
      getTrialDaysRemaining,
      getAvailableSpots,
      isSignedUp,
      handlePasswordLogin,
      handleForgotPassword,
      handleMagicLink,
      handleCreateMemberProfile,
      checkAccessStatus,
      handleAddClass,
      handleDeleteClass,
      handleAddMember,
      handleAddMembershipType,
      handleEditMember,
      handleSaveMember,
      handleAddCredit,
      handleSignUp,
      handleCancel,
      logout,
      sessionPacks, setSessionPacks,
      newSessionPack, setNewSessionPack,
      handleAddSessionPack,
      handleDeleteSessionPack,
      payments, setPayments,
      handleRecordPayment,
      personalSessions, setPersonalSessions,
      handleBookSession,
      handleUpdateSessionStatus,
      feedPosts,
      handleCreatePost,
      handleDeletePost,
      handleLikePost,
      handleAddComment,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
