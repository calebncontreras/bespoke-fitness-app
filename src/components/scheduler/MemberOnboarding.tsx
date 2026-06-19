import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';

const MemberOnboarding: React.FC = () => {
  const { handleCreateMemberProfile, currentUser, logout } = useAppState();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await handleCreateMemberProfile(name.trim());
    setDone(true);
    setSaving(false);
  };

  if (done || (currentUser && 'email' in currentUser && currentUser.membershipType !== undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-sm px-6 text-center space-y-4">
          <p className="text-sm font-light text-gray-900">You're registered, {currentUser && 'name' in currentUser ? currentUser.name : ''}.</p>
          <p className="text-xs font-light text-gray-400 leading-relaxed">
            Your trainer will send you documents to sign before your first session. Once your documents are approved and payment is confirmed, you'll have full access.
          </p>
          <p className="text-xs font-light text-gray-300">
            You'll receive 1 free trial class once your documents are approved.
          </p>
          <button onClick={logout} className="text-xs font-light text-gray-300 hover:text-gray-500 transition mt-4">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm px-6 space-y-6">
        <div>
          <p className="text-sm font-light text-gray-900 mb-1">Welcome</p>
          <p className="text-xs font-light text-gray-400">Enter your name to complete your registration.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            required
            autoFocus
            className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-300 transition"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberOnboarding;
