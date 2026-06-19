import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
  handleTrainerLogin: (email: string, password: string) => Promise<void>;
  handleMagicLink: (email: string) => Promise<void>;
  handleCreateMemberProfile: (name: string) => Promise<void>;
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
  payments: PaymentTransaction[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
  handleRecordPayment: (memberId: string, amount: number, method: PaymentMethodType, reference: string, date: string) => void;
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

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([
    { id: '1x/week', name: '1x/Week', price: 29, classesPerWeek: 1 },
    { id: '2x/week', name: '2x/Week', price: 49, classesPerWeek: 2 },
    { id: '3x/week', name: '3x/Week', price: 79, classesPerWeek: 3 },
  ]);
  const [classes, setClasses] = useState<Class[]>([
    { id: 1, name: 'Yoga', day: 'Monday', time: '10:00', instructor: 'Sarah', location: 'Room A', capacity: 15, signups: [] },
    { id: 2, name: 'Pilates', day: 'Wednesday', time: '14:00', instructor: 'Mike', location: 'Room B', capacity: 12, signups: [] },
  ]);
  const [newClass, setNewClass] = useState<NewClassForm>({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
  const [newMember, setNewMember] = useState<NewMemberForm>({ name: '', email: '', membershipExpiry: '', membershipType: '1x/week', classCredits: 0 });
  const [newMembershipType, setNewMembershipType] = useState<NewMembershipTypeForm>({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [personalSessions, setPersonalSessions] = useState<PersonalSession[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // ── Auth ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleAuthUser = async (user: User) => {
      setAuthLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'trainer') {
        setCurrentUser({ id: 'trainer', name: profile.name || 'Trainer', role: 'trainer' });
        setView('trainerDashboard');
        setAuthLoading(false);
        return;
      }

      if (profile?.role === 'member') {
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single();

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
          setView('booking');
          setAuthLoading(false);
          return;
        }
      }

      // No profile yet — new client
      setView('onboarding');
      setAuthLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        handleAuthUser(session.user);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setView('login');
        setMagicLinkSent(false);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTrainerLogin = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  const handleCreateMemberProfile = async (name: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;

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

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  // ── Membership ───────────────────────────────────────────────────
  const isMembershipValid = (memberId: string): boolean => {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;
    return new Date(member.membershipExpiry) > new Date();
  };

  const getDayOfWeek = (dayName: string): number => {
    const dayMap: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
    return dayMap[dayName];
  };

  const getNextClassDate = (dayName: string): Date => {
    const today = new Date();
    const targetDay = getDayOfWeek(dayName);
    const daysAhead = targetDay - today.getDay();
    const date = new Date(today);
    date.setDate(today.getDate() + (daysAhead > 0 ? daysAhead : daysAhead + 7));
    return date;
  };

  const getClassesBookedThisWeek = (): number => {
    if (!isMember(currentUser)) return 0;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    return classes.filter(c => {
      if (!c.signups.includes(currentUser.id)) return false;
      const classDate = getNextClassDate(c.day);
      return classDate >= startOfWeek && classDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length;
  };

  const getClassesRemaining = (): number => {
    if (!isMember(currentUser)) return 0;
    const memberType = membershipTypes.find(m => m.id === currentUser.membershipType);
    if (!memberType) return 0;
    return memberType.classesPerWeek - getClassesBookedThisWeek();
  };

  const getTrialDaysRemaining = (): number | null => {
    if (!isMember(currentUser) || currentUser.membershipType !== 'trial') return null;
    const daysLeft = Math.ceil((new Date(currentUser.membershipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getAvailableSpots = (c: Class): number => c.capacity - c.signups.length;

  const isSignedUp = (classId: number): boolean => {
    if (!isMember(currentUser)) return false;
    return classes.find(c => c.id === classId)?.signups.includes(currentUser.id) ?? false;
  };

  // ── Classes ──────────────────────────────────────────────────────
  const handleAddClass = () => {
    if (newClass.name && newClass.day && newClass.time) {
      setClasses(prev => [...prev, { ...newClass, id: Date.now(), capacity: parseInt(String(newClass.capacity)), signups: [] }]);
      setNewClass({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
    }
  };

  const handleDeleteClass = (id: number) => setClasses(prev => prev.filter(c => c.id !== id));

  // ── Members ──────────────────────────────────────────────────────
  const handleAddMember = () => {
    if (newMember.name && newMember.email && newMember.membershipExpiry) {
      setMembers(prev => [...prev, {
        ...newMember,
        id: String(Date.now()),
        classCredits: parseInt(String(newMember.classCredits)) || 0,
        googleCalendarEnabled: false,
      }]);
      setNewMember({ name: '', email: '', membershipExpiry: '', membershipType: '1x/week', classCredits: 0 });
    }
  };

  const handleAddMembershipType = () => {
    if (!newMembershipType.name || newMembershipType.price === '' || newMembershipType.classesPerWeek === '') return;
    const t: MembershipType = {
      id: newMembershipType.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: newMembershipType.name,
      price: parseInt(newMembershipType.price) || 0,
      classesPerWeek: parseInt(newMembershipType.classesPerWeek) || 1,
    };
    if (newMembershipType.durationDays) t.durationDays = parseInt(newMembershipType.durationDays);
    setMembershipTypes(prev => [...prev, t]);
    setNewMembershipType({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  };

  const handleEditMember = (m: Member) => setEditingMember({ ...m });

  const handleSaveMember = () => {
    if (!editingMember) return;
    setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const handleAddCredit = (memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, classCredits: (parseInt(String(m.classCredits)) || 0) + 1 } : m));
  };

  const handleSignUp = (classId: number, useCredit = false) => {
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
    setClasses(prev => prev.map(c =>
      c.id === classId && c.signups.length < c.capacity ? { ...c, signups: [...c.signups, currentUser.id] } : c
    ));
    if (useCredit) {
      setCurrentUser(prev => isMember(prev) ? { ...prev, classCredits: prev.classCredits - 1 } : prev);
    }
  };

  const handleCancel = (classId: number) => {
    if (!isMember(currentUser)) return;
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, signups: c.signups.filter(id => id !== currentUser.id) } : c
    ));
  };

  // ── Payments ─────────────────────────────────────────────────────
  const handleRecordPayment = (memberId: string, amount: number, method: PaymentMethodType, reference: string, date: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const memberType = membershipTypes.find(t => t.id === member.membershipType);
    const tx: PaymentTransaction = {
      id: Date.now(), memberId, memberName: member.name, amount, method, reference, date, membershipTypeId: member.membershipType,
    };
    setPayments(prev => [tx, ...prev]);
    const base = new Date(Math.max(
      new Date(date + 'T12:00:00').getTime(),
      new Date((member.membershipExpiry || date) + 'T12:00:00').getTime()
    ));
    if (memberType?.durationDays) base.setDate(base.getDate() + memberType.durationDays);
    else base.setMonth(base.getMonth() + 1);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, membershipExpiry: base.toISOString().split('T')[0] } : m));
  };

  // ── Sessions ─────────────────────────────────────────────────────
  const handleBookSession = (date: string, time: string, duration: number, notes: string) => {
    if (!isMember(currentUser)) return;
    const session: PersonalSession = {
      id: Date.now(), memberId: currentUser.id, memberName: currentUser.name,
      date, time, duration, status: 'pending', notes,
    };
    setPersonalSessions(prev => [session, ...prev]);
  };

  const handleUpdateSessionStatus = (id: number, status: SessionStatus) => {
    setPersonalSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // ── Feed ─────────────────────────────────────────────────────────
  const handleCreatePost = (content: string) => {
    const post: FeedPost = { id: Date.now(), content, createdAt: new Date().toISOString(), likes: [], comments: [] };
    setFeedPosts(prev => [post, ...prev]);
  };

  const handleDeletePost = (id: number) => setFeedPosts(prev => prev.filter(p => p.id !== id));

  const handleLikePost = (postId: number) => {
    if (!isMember(currentUser)) return;
    const memberId = currentUser.id;
    setFeedPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(memberId);
      return { ...p, likes: liked ? p.likes.filter(id => id !== memberId) : [...p.likes, memberId] };
    }));
  };

  const handleAddComment = (postId: number, text: string) => {
    if (!isMember(currentUser) || !text.trim()) return;
    const comment = { id: Date.now(), memberId: currentUser.id, memberName: currentUser.name, text: text.trim(), createdAt: new Date().toISOString() };
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
      handleTrainerLogin,
      handleMagicLink,
      handleCreateMemberProfile,
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
