import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import ClientDocuments from '../documents/ClientDocuments';

const AwaitingApproval: React.FC = () => {
  const { currentUser, logout, checkAccessStatus } = useAppState();
  const [checking, setChecking] = useState(false);

  const memberId = currentUser && 'email' in currentUser ? currentUser.id : '';
  const memberName = currentUser && 'name' in currentUser ? currentUser.name : '';

  const handleCheck = async () => {
    setChecking(true);
    await checkAccessStatus();
    setChecking(false);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
      <div>
        <p className="text-sm font-light text-gray-900 mb-1">Documents under review</p>
        <p className="text-xs font-light text-gray-400 leading-relaxed">
          Your trainer is reviewing your documents. You'll receive an email once you're approved.
          If any documents were rejected, re-sign and re-upload them below.
        </p>
      </div>

      {memberId && (
        <ClientDocuments
          memberId={memberId}
          memberName={memberName}
        />
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleCheck}
          disabled={checking}
          className="text-xs font-light border border-gray-900 text-gray-900 px-4 py-2 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-300 transition"
        >
          {checking ? 'Checking...' : 'Check status'}
        </button>
        <button onClick={logout} className="text-xs font-light text-gray-300 hover:text-gray-500 transition">
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AwaitingApproval;
