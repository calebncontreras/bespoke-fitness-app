import React, { useState } from 'react';
import { ChevronRight, Plus, Trash2, LogOut } from 'lucide-react';

const ClassSchedulingApp = () => {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', membershipExpiry: '2026-12-31', membershipType: '1x/week', classCredits: 1, googleCalendarEnabled: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', membershipExpiry: '2025-06-30', membershipType: '2x/week', classCredits: 0, googleCalendarEnabled: false },
  ]);
  const [membershipTypes, setMembershipTypes] = useState([
    { id: '1x/week', name: '1x/Week', price: 29, classesPerWeek: 1 },
    { id: '2x/week', name: '2x/Week', price: 49, classesPerWeek: 2 },
    { id: '3x/week', name: '3x/Week', price: 79, classesPerWeek: 3 },
    { id: 'trial', name: 'Trial Week', price: 0, classesPerWeek: 999, durationDays: 7 },
  ]);
  const [classes, setClasses] = useState([
    { id: 1, name: 'Yoga', day: 'Monday', time: '10:00', instructor: 'Sarah', location: 'Room A', capacity: 15, signups: [1] },
    { id: 2, name: 'Pilates', day: 'Wednesday', time: '14:00', instructor: 'Mike', location: 'Room B', capacity: 12, signups: [2] },
  ]);
  const [newClass, setNewClass] = useState({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
  const [newMember, setNewMember] = useState({ name: '', email: '', membershipExpiry: '', membershipType: '1x/week', classCredits: 0 });
  const [newMembershipType, setNewMembershipType] = useState({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editingMember, setEditingMember] = useState(null);
  const [signupForm, setSignupForm] = useState({ name: '', email: '', cardNumber: '', expiry: '', cvc: '', membershipType: '1x/week' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const isMembershipValid = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;
    return new Date(member.membershipExpiry) > new Date();
  };

  const getDayOfWeek = (dayName) => {
    const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
    return dayMap[dayName];
  };

  const getNextClassDate = (dayName) => {
    const today = new Date();
    const targetDay = getDayOfWeek(dayName);
    const daysAhead = targetDay - today.getDay();
    const date = new Date(today);
    date.setDate(today.getDate() + (daysAhead > 0 ? daysAhead : daysAhead + 7));
    return date;
  };

  const getClassesBookedThisWeek = () => {
    if (!currentUser) return 0;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    return classes.filter(c => {
      if (!c.signups.includes(currentUser.id)) return false;
      const classDate = getNextClassDate(c.day);
      return classDate >= startOfWeek && classDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length;
  };

  const getClassesRemaining = () => {
    if (!currentUser || !currentUser.membershipType) return 0;
    const memberType = membershipTypes.find(m => m.id === currentUser.membershipType);
    if (!memberType) return 0;
    return memberType.classesPerWeek - getClassesBookedThisWeek();
  };

  const getTrialDaysRemaining = () => {
    if (!currentUser || currentUser.membershipType !== 'trial') return null;
    const daysLeft = Math.ceil((new Date(currentUser.membershipExpiry) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getAvailableSpots = (c) => c.capacity - c.signups.length;
  const isSignedUp = (classId) => classes.find(c => c.id === classId)?.signups.includes(currentUser?.id);

  const handleAdminLogin = () => {
    setCurrentUser({ id: 'admin', name: 'Admin', role: 'admin' });
    setView('adminDashboard');
  };

  const handleMemberLogin = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (isMembershipValid(memberId)) {
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
    const newMemberObj = {
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
      setClasses(prev => [...prev, { ...newClass, id: Date.now(), capacity: parseInt(newClass.capacity), signups: [] }]);
      setNewClass({ name: '', day: '', time: '', instructor: '', location: '', capacity: 10 });
    }
  };

  const handleDeleteClass = (id) => setClasses(prev => prev.filter(c => c.id !== id));

  const handleAddMember = () => {
    if (newMember.name && newMember.email && newMember.membershipExpiry) {
      setMembers(prev => [...prev, { ...newMember, id: Date.now(), classCredits: parseInt(newMember.classCredits) || 0, googleCalendarEnabled: false }]);
      setNewMember({ name: '', email: '', membershipExpiry: '', membershipType: '1x/week', classCredits: 0 });
    }
  };

  const handleAddMembershipType = () => {
    if (!newMembershipType.name || newMembershipType.price === '' || newMembershipType.classesPerWeek === '') return;
    const t = {
      id: newMembershipType.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: newMembershipType.name,
      price: parseInt(newMembershipType.price) || 0,
      classesPerWeek: parseInt(newMembershipType.classesPerWeek) || 1,
    };
    if (newMembershipType.durationDays) t.durationDays = parseInt(newMembershipType.durationDays);
    setMembershipTypes(prev => [...prev, t]);
    setNewMembershipType({ name: '', price: '', classesPerWeek: '', durationDays: '' });
  };

  const handleEditMember = (m) => setEditingMember({ ...m });
  const handleSaveMember = () => {
    setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const handleAddCredit = (memberId) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, classCredits: (parseInt(m.classCredits) || 0) + 1 } : m));
  };

  const handleSignUp = (classId, useCredit = false) => {
    const remaining = getClassesRemaining();
    if (remaining <= 0 && !useCredit) {
      alert("You've reached your weekly booking limit. Use a class credit or upgrade your membership.");
      return;
    }
    if (useCredit && currentUser.classCredits <= 0) {
      alert('No class credits available.');
      return;
    }
    setClasses(prev => prev.map(c =>
      c.id === classId && c.signups.length < c.capacity ? { ...c, signups: [...c.signups, currentUser.id] } : c
    ));
    if (useCredit) setCurrentUser(prev => ({ ...prev, classCredits: prev.classCredits - 1 }));
  };

  const handleCancel = (classId) => {
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, signups: c.signups.filter(id => id !== currentUser.id) } : c
    ));
  };

  const logout = () => { setCurrentUser(null); setView('login'); };

  // LOGIN
  if (view === 'login') return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light text-gray-900 mb-12 text-center">Class Scheduler</h1>
        <button onClick={handleAdminLogin} className="w-full px-6 py-4 bg-gray-900 text-white font-light hover:bg-gray-800 transition mb-6">Admin Login</button>
        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div></div>
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600 font-light">Select your account:</p>
          {members.map(member => {
            const isValid = isMembershipValid(member.id);
            return isValid ? (
              <button key={member.id} onClick={() => handleMemberLogin(member.id)} className="w-full px-4 py-3 text-left border border-gray-300 hover:border-gray-400 transition flex justify-between items-center">
                <div><div className="font-light text-gray-900">{member.name}</div><div className="text-xs text-gray-500">{member.email}</div></div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ) : (
              <div key={member.id} className="p-4 border border-gray-300 flex justify-between items-start">
                <div><div className="font-light text-gray-900">{member.name}</div><div className="text-xs text-gray-500">{member.email}</div></div>
                <div>
                  <p className="text-xs text-red-600 font-light">Membership expired {member.membershipExpiry}</p>
                  <button onClick={() => { setCurrentUser(member); setView('payment'); }} className="text-xs text-red-600 font-light underline hover:text-red-700">Update payment</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">new member</span></div></div>
        <button onClick={() => setView('signup')} className="w-full px-6 py-4 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Create New Account</button>
      </div>
    </div>
  );

  // SIGNUP
  if (view === 'signup') return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button onClick={() => setView('login')} className="text-gray-600 hover:text-gray-900 font-light text-sm mb-6">← Back</button>
        <h1 className="text-3xl font-light text-gray-900 mb-8">Create Account</h1>
        <div className="space-y-4 mb-6">
          <input type="text" placeholder="Full Name" value={signupForm.name} onChange={e => setSignupForm({ ...signupForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="email" placeholder="Email" value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
        </div>
        <div className="mb-6">
          <label className="text-sm text-gray-600 font-light block mb-3">Select Membership</label>
          <div className="space-y-2">
            {membershipTypes.map(type => (
              <label key={type.id} className={`flex items-start p-4 border cursor-pointer transition ${signupForm.membershipType === type.id ? 'border-gray-900' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="membershipType" value={type.id} checked={signupForm.membershipType === type.id} onChange={e => setSignupForm({ ...signupForm, membershipType: e.target.value })} className="mt-1 mr-3" />
                <div>
                  <div className="font-light text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-600 font-light">{type.price === 0 ? 'Free' : `$${type.price}/month`}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="text-sm text-gray-600 font-light block mb-3">Payment Information</label>
          <div className="space-y-3">
            <input type="text" placeholder="Card Number" value={signupForm.cardNumber} onChange={e => setSignupForm({ ...signupForm, cardNumber: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            <div className="flex gap-3">
              <input type="text" placeholder="MM/YY" value={signupForm.expiry} onChange={e => setSignupForm({ ...signupForm, expiry: e.target.value })} className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <input type="text" placeholder="CVC" value={signupForm.cvc} onChange={e => setSignupForm({ ...signupForm, cvc: e.target.value })} className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('login')} className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSignup} className="flex-1 px-6 py-3 bg-gray-900 text-white font-light hover:bg-gray-800 transition">Create Account</button>
        </div>
      </div>
    </div>
  );

  // PAYMENT
  if (view === 'payment') return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="px-6 py-8 border-b border-gray-200">
          <button onClick={() => { setView('login'); setCurrentUser(null); }} className="text-gray-600 hover:text-gray-900 font-light text-sm mb-4">← Back</button>
          <h1 className="text-3xl font-light text-gray-900">Renew Membership</h1>
          <p className="text-sm text-gray-600 font-light mt-2">{currentUser?.name}</p>
        </div>
        <div className="p-6 max-w-md">
          <p className="text-sm text-gray-600 font-light mb-8">Your membership expired on {currentUser?.membershipExpiry}. Choose a plan to regain access.</p>
          <div className="space-y-3 mb-8">
            {membershipTypes.map(type => (
              <label key={type.id} className="flex items-start p-4 border border-gray-300 hover:border-gray-400 cursor-pointer transition">
                <input type="radio" name="plan" value={type.id} className="mt-1 mr-4" />
                <div>
                  <div className="font-light text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-600 font-light">{type.price === 0 ? 'Free' : `$${type.price}/month`}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="space-y-4 mb-8">
            <input type="text" placeholder="Card number" className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            <div className="flex gap-4">
              <input type="text" placeholder="MM/YY" className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <input type="text" placeholder="CVC" className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            </div>
            <input type="text" placeholder="Name on card" className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setView('login'); setCurrentUser(null); }} className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Cancel</button>
            <button onClick={() => { alert('Payment processed! Membership renewed.'); setView('login'); setCurrentUser(null); }} className="flex-1 px-6 py-3 bg-gray-900 text-white font-light hover:bg-gray-800 transition">Process Payment</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ADMIN
  if (view === 'adminDashboard') return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center px-6 py-8 border-b border-gray-200">
          <h1 className="text-3xl font-light text-gray-900">Admin Dashboard</h1>
          <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-light"><LogOut size={18} /> Logout</button>
        </div>
        <div className="flex border-b border-gray-200">
          {['dashboard', 'classes', 'members', 'membership-types'].map(tab => (
            <button key={tab} onClick={() => setAdminTab(tab)} className={`px-6 py-4 font-light text-sm border-b-2 transition ${adminTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              {tab === 'membership-types' ? 'Membership Types' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="p-6">

          {adminTab === 'dashboard' && (
            <div className="grid grid-cols-3 gap-6">
              {[['Total Classes', classes.length], ['Total Members', members.length], ['Overdue Memberships', members.filter(m => !isMembershipValid(m.id)).length]].map(([label, val]) => (
                <div key={label} className="p-6 bg-gray-50 border border-gray-200">
                  <div className="text-sm text-gray-600 font-light mb-2">{label}</div>
                  <div className="text-3xl font-light text-gray-900">{val}</div>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'classes' && (
            <div className="space-y-8">
              <div className="p-6 bg-gray-50 border border-gray-200">
                <h3 className="text-lg font-light text-gray-900 mb-4">Add New Class</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Class Name" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <select value={newClass.day} onChange={e => setNewClass({ ...newClass, day: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
                    <option value="">Select Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="time" value={newClass.time} onChange={e => setNewClass({ ...newClass, time: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="text" placeholder="Instructor" value={newClass.instructor} onChange={e => setNewClass({ ...newClass, instructor: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="text" placeholder="Location" value={newClass.location} onChange={e => setNewClass({ ...newClass, location: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light col-span-2" />
                  <input type="number" placeholder="Capacity" value={newClass.capacity} onChange={e => setNewClass({ ...newClass, capacity: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                </div>
                <button onClick={handleAddClass} className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition flex items-center gap-2"><Plus size={18} /> Add Class</button>
              </div>
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4">Recurring Classes</h3>
                <div className="space-y-3">
                  {classes.map(c => (
                    <div key={c.id} className="p-4 border border-gray-200 flex justify-between items-start">
                      <div>
                        <div className="font-light text-gray-900">{c.name}</div>
                        <div className="text-sm text-gray-600 font-light">{c.day} at {c.time} • {c.instructor} • {c.location}</div>
                        <div className="text-sm text-gray-500 font-light">{c.signups.length} / {c.capacity} enrolled</div>
                      </div>
                      <button onClick={() => handleDeleteClass(c.id)} className="text-gray-400 hover:text-gray-600"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {adminTab === 'members' && (
            <div className="space-y-8">
              <div className="p-6 bg-gray-50 border border-gray-200">
                <h3 className="text-lg font-light text-gray-900 mb-4">Add New Member</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="email" placeholder="Email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="date" value={newMember.membershipExpiry} onChange={e => setNewMember({ ...newMember, membershipExpiry: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <select value={newMember.membershipType} onChange={e => setNewMember({ ...newMember, membershipType: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
                    {membershipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input type="number" placeholder="Class Credits" value={newMember.classCredits} onChange={e => setNewMember({ ...newMember, classCredits: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                </div>
                <button onClick={handleAddMember} className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition flex items-center gap-2"><Plus size={18} /> Add Member</button>
              </div>
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4">Members</h3>
                <div className="space-y-3">
                  {members.map(m => (
                    <div key={m.id} className="p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-light text-gray-900">{m.name}</div>
                          <div className="text-sm text-gray-600 font-light">{m.email}</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className={`font-light ${isMembershipValid(m.id) ? 'text-green-600' : 'text-red-600'}`}>{isMembershipValid(m.id) ? 'Active' : 'Overdue'}</div>
                          <div className="text-gray-500 font-light">{m.membershipExpiry}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 font-light">{m.membershipType} • {m.classCredits} credit(s)</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAddCredit(m.id)} className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-50 font-light">+ Credit</button>
                          <button onClick={() => handleEditMember(m)} className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-50 font-light">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {editingMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-light text-gray-900 mb-4">Edit Member</h3>
                    <div className="space-y-4 mb-6">
                      <input type="text" value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                      <input type="email" value={editingMember.email} onChange={e => setEditingMember({ ...editingMember, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                      <input type="date" value={editingMember.membershipExpiry} onChange={e => setEditingMember({ ...editingMember, membershipExpiry: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                      <select value={editingMember.membershipType} onChange={e => setEditingMember({ ...editingMember, membershipType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
                        {membershipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingMember(null)} className="flex-1 px-4 py-2 border border-gray-300 font-light hover:bg-gray-50">Cancel</button>
                      <button onClick={handleSaveMember} className="flex-1 px-4 py-2 bg-gray-900 text-white font-light hover:bg-gray-800">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {adminTab === 'membership-types' && (
            <div className="space-y-8">
              <div className="p-6 bg-gray-50 border border-gray-200">
                <h3 className="text-lg font-light text-gray-900 mb-4">Create New Membership Type</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Name (e.g. 5x/Week)" value={newMembershipType.name} onChange={e => setNewMembershipType({ ...newMembershipType, name: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="number" placeholder="Price per month ($)" value={newMembershipType.price} onChange={e => setNewMembershipType({ ...newMembershipType, price: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="number" placeholder="Classes per week" value={newMembershipType.classesPerWeek} onChange={e => setNewMembershipType({ ...newMembershipType, classesPerWeek: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                  <input type="number" placeholder="Duration days (optional)" value={newMembershipType.durationDays} onChange={e => setNewMembershipType({ ...newMembershipType, durationDays: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
                </div>
                <button onClick={handleAddMembershipType} className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition flex items-center gap-2"><Plus size={18} /> Create Membership Type</button>
              </div>
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4">All Membership Types</h3>
                <div className="space-y-3">
                  {membershipTypes.map(type => (
                    <div key={type.id} className="p-4 border border-gray-200">
                      <div className="font-light text-gray-900">{type.name}</div>
                      <div className="text-sm text-gray-600 font-light">
                        {type.price === 0 ? 'Free' : `$${type.price}/month`} • {type.classesPerWeek === 999 ? 'Unlimited' : type.classesPerWeek} classes/week
                        {type.durationDays ? ` • ${type.durationDays} day access` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  // BOOKING
  if (view === 'booking') return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center px-6 py-8 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Available Classes</h1>
            <p className="text-sm text-gray-600 font-light mt-1">{currentUser.name}</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <label className="flex items-center gap-2 text-sm font-light text-gray-600 cursor-pointer">
              <input type="checkbox" checked={currentUser.googleCalendarEnabled || false} onChange={e => setCurrentUser({ ...currentUser, googleCalendarEnabled: e.target.checked })} className="w-4 h-4" />
              Auto-sync to Google Calendar
            </label>
            <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-light"><LogOut size={18} /> Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {classes.map(c => (
            <div key={c.id} className="border border-gray-200 p-6">
              <h3 className="text-lg font-light text-gray-900 mb-3">{c.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 font-light mb-4">
                <div>{c.day} at {c.time}</div>
                <div>Instructor: {c.instructor}</div>
                <div>Location: {c.location}</div>
                <div>{getAvailableSpots(c)} / {c.capacity} spots available</div>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isSignedUp(c.id) ? (
                  <button onClick={() => handleCancel(c.id)} className="w-full px-4 py-2 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Cancel Booking</button>
                ) : getAvailableSpots(c) > 0 ? (
                  <>
                    <button
                      onClick={() => handleSignUp(c.id, false)}
                      disabled={getClassesRemaining() <= 0}
                      className={`w-full px-4 py-2 font-light transition flex items-center justify-center gap-2 ${getClassesRemaining() > 0 ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      Sign Up <ChevronRight size={16} />
                    </button>
                    {currentUser.classCredits > 0 && (
                      <button onClick={() => handleSignUp(c.id, true)} className="w-full px-4 py-2 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition text-sm">
                        Use Class Credit ({currentUser.classCredits} remaining)
                      </button>
                    )}
                  </>
                ) : (
                  <button disabled className="w-full px-4 py-2 bg-gray-200 text-gray-500 font-light cursor-not-allowed">Class Full</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <h3 className="text-lg font-light text-gray-900 mb-4">My Bookings</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 border border-gray-200 text-center">
              <div className="text-xs text-gray-600 font-light mb-1">Class Credits</div>
              <div className="text-2xl font-light text-gray-900">{currentUser.classCredits}</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 text-center">
              <div className="text-xs text-gray-600 font-light mb-1">Classes Left This Week</div>
              <div className="text-2xl font-light text-gray-900">{Math.max(0, getClassesRemaining())}</div>
            </div>
            {getTrialDaysRemaining() !== null && (
              <div className="p-3 bg-gray-50 border border-gray-200 text-center">
                <div className="text-xs text-gray-600 font-light mb-1">Trial Days Left</div>
                <div className="text-2xl font-light text-gray-900">{getTrialDaysRemaining()}</div>
              </div>
            )}
          </div>
          {currentUser.googleCalendarEnabled && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200">
              <p className="text-xs text-green-700 font-light">Classes are automatically added to your Google Calendar</p>
            </div>
          )}
          <div className="space-y-3">
            {classes.filter(c => isSignedUp(c.id)).length > 0 ? classes.filter(c => isSignedUp(c.id)).map(c => (
              <div key={c.id} className="p-4 bg-gray-50 border border-gray-200 flex justify-between items-start">
                <div>
                  <div className="font-light text-gray-900">{c.name}</div>
                  <div className="text-sm text-gray-600 font-light">{c.day} at {c.time}</div>
                </div>
                {currentUser.googleCalendarEnabled && <div className="text-xs text-green-600 font-light">✓ In calendar</div>}
              </div>
            )) : <p className="text-gray-500 font-light">No bookings yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSchedulingApp;