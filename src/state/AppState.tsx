import React, { createContext, useContext, useState } from 'react';
import type {
  Member,
  CurrentUser,
  Class,
  MembershipType,
  NewClassForm,
  NewMemberForm,
  NewMembershipTypeForm,
  SignupForm,
} from '../types';

interface AppStateContextType {
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
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
  signupForm: SignupForm;
  setSignupForm: React.Dispatch<React.SetStateAction<SignupForm>>;
  days: string[];
  isMembershipValid: (memberId: number) => boolean;
  getClassesRemaining: () => number;
  getTrialDaysRemaining: () => number | null;
  getAvailableSpots: (c: Class) => number;
  isSignedUp: (classId: number) => boolean;
  handleAdminLogin: () => void;
  handleMemberLogin: (memberId: number) => void;
  handleSignup: () => void;
  handleAddClass: () => void;
  handleDeleteClass: (id: number) => void;
  handleAddMember: () => void;
  handleAddMembershipType: () => void;
  handleEditMember: (m: Member) => void;
  handleSaveMember: () => void;
  handleAddCredit: (memberId: number) => void;
  handleSignUp: (classId: number, useCredit?: boolean) => void;
  handleCancel: (classId: number) => void;
  logout: () => void;
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
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', membershipExpiry: '2026-12-31', membershipType: '1x/week', classCredits: 1, googleCalendarEnabled: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', membershipExpiry: '2025-06-30', membershipType: '2x/week', classCredits: 0, googleCalendarEnabled: false },
  ]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([
    { id: '1x/week', name: '1x/Week', price: 29, classesPerWeek: 1 },
    { id: '2x/week', name: '2x/Week', price: 49, classesPerWeek: 2 },
    { id: '3x/week', name: '3x/Week', price: 79, classesPerWeek: 3 },
    { id: 'trial', name: 'Trial Week', price: 0, classesPerWeek: 999, durationDays: 7 },
  ]);
  const [classes, setClasses] = useState<Class[]>([
    { id: 1, name: 'Yoga', day: 'Monday', time: '10:00', instructor: 'Sarah', location: 'Room A', capacity: 15, signups: [1] },
    { id: 2, name: 'Pilates', day: 'Wednesday', time: '14:00', instructor: 'Mike', location: 'Room B', capacity: 12, signups: [2] },
  ]);
  const [newClass, setNewClass] = useState<NewClassForm>({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
  const [newMember, setNewMember] = useState<NewMemberForm>({ name: '', email: '', membershipExpiry: '', membershipType: '1x/week', classCredits: 0 });
  const [newMembershipType, setNewMembershipType] = useState<NewMembershipTypeForm>({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [signupForm, setSignupForm] = useState<SignupForm>({ name: '', email: '', cardNumber: '', expiry: '', cvc: '', membershipType: '1x/week' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const isMembershipValid = (memberId: number): boolean => {
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

  const handleAdminLogin = () => {
    setCurrentUser({ id: 'admin', name: 'Admin', role: 'admin' });
    setView('adminDashboard');
  };

  const handleMemberLogin = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (member && isMembershipValid(memberId)) {
      setCurrentUser(member);
      setView('booking');
    }
  };

  const handleSignup = () => {
    if (!signupForm.name || !signupForm.email || !signupForm.cardNumber || !signupForm.expiry || !signupForm.cvc) {
      alert('Please fill in all fields');
      return;
    }
    const expiryDate = new Date();
    const memberType = membershipTypes.find(m => m.id === signupForm.membershipType);
    if (memberType?.durationDays) {
      expiryDate.setDate(expiryDate.getDate() + memberType.durationDays);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    const newMemberObj: Member = {
      id: Date.now(),
      name: signupForm.name,
      email: signupForm.email,
      membershipExpiry: expiryDate.toISOString().split('T')[0],
      membershipType: signupForm.membershipType,
      classCredits: 1,
      googleCalendarEnabled: false,
    };
    setMembers(prev => [...prev, newMemberObj]);
    setCurrentUser(newMemberObj);
    setSignupForm({ name: '', email: '', cardNumber: '', expiry: '', cvc: '', membershipType: '1x/week' });
    setView('booking');
    alert('Welcome! Your account has been created with 1 free class credit.');
  };

  const handleAddClass = () => {
    if (newClass.name && newClass.day && newClass.time) {
      setClasses(prev => [...prev, { ...newClass, id: Date.now(), capacity: parseInt(String(newClass.capacity)), signups: [] }]);
      setNewClass({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
    }
  };

  const handleDeleteClass = (id: number) => setClasses(prev => prev.filter(c => c.id !== id));

  const handleAddMember = () => {
    if (newMember.name && newMember.email && newMember.membershipExpiry) {
      setMembers(prev => [...prev, { ...newMember, id: Date.now(), classCredits: parseInt(String(newMember.classCredits)) || 0, googleCalendarEnabled: false }]);
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

  const handleAddCredit = (memberId: number) => {
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

  const logout = () => {
    setCurrentUser(null);
    setView('login');
  };

  return (
    <AppStateContext.Provider value={{
      view, setView,
      currentUser, setCurrentUser,
      members, setMembers,
      membershipTypes, setMembershipTypes,
      classes, setClasses,
      newClass, setNewClass,
      newMember, setNewMember,
      newMembershipType, setNewMembershipType,
      adminTab, setAdminTab,
      editingMember, setEditingMember,
      signupForm, setSignupForm,
      days,
      isMembershipValid,
      getClassesRemaining,
      getTrialDaysRemaining,
      getAvailableSpots,
      isSignedUp,
      handleAdminLogin,
      handleMemberLogin,
      handleSignup,
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
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
