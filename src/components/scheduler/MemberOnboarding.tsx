import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import ClientDocuments from '../documents/ClientDocuments';

type Step = 'name' | 'documents' | 'pending';

const MemberOnboarding: React.FC = () => {
  const { handleCreateMemberProfile, currentUser, logout } = useAppState();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>('name');

  const memberId = currentUser && 'email' in currentUser ? currentUser.id : null;
  const memberName = currentUser && 'name' in currentUser ? currentUser.name : '';

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await handleCreateMemberProfile(name.trim());
    setStep('documents');
    setSaving(false);
  };

  if (step === 'name') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-sm px-6 space-y-6">
          <div>
            <p className="text-sm font-light text-gray-900 mb-1">Welcome</p>
            <p className="text-xs font-light text-gray-400">Enter your name to complete your registration.</p>
          </div>
          <form onSubmit={handleSubmitName} className="space-y-3">
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
  }

  if (step === 'documents' && memberId) {
    return (
      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-sm font-light text-gray-900 mb-1">Hi, {memberName}</p>
          <p className="text-xs font-light text-gray-400 leading-relaxed">
            Before your first session, please sign and upload the following documents.
            Download each template, sign it (DocuSign or physical scan), then upload the signed copy.
          </p>
        </div>
        <ClientDocuments
          memberId={memberId}
          memberName={memberName}
          onAllSubmitted={() => setStep('pending')}
        />
        <button onClick={logout} className="text-xs font-light text-gray-300 hover:text-gray-500 transition">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-sm px-6 text-center space-y-4">
        <p className="text-sm font-light text-gray-900">Documents submitted</p>
        <p className="text-xs font-light text-gray-400 leading-relaxed">
          Your trainer will review and approve your documents. Once approved, your free trial session will be unlocked.
          You'll be notified when you're all set.
        </p>
        <button onClick={logout} className="text-xs font-light text-gray-300 hover:text-gray-500 transition mt-4">
          Sign out
        </button>
      </div>
    </div>
  );
};

export default MemberOnboarding;
