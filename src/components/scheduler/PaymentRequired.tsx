import React from 'react';
import { useAppState } from '../../state/AppState';

const PaymentRequired: React.FC = () => {
  const { currentUser, logout } = useAppState();
  const memberName = currentUser && 'name' in currentUser ? currentUser.name : '';
  const hasExpiredMembership = currentUser && 'membershipExpiry' in currentUser && currentUser.membershipExpiry;

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-sm px-6 text-center space-y-4">
        <p className="text-sm font-light text-gray-900">
          {hasExpiredMembership ? 'Membership past due' : 'No active membership'}
        </p>
        <p className="text-xs font-light text-gray-400 leading-relaxed">
          Hi {memberName}, your trial session has been used
          {hasExpiredMembership ? ' and your membership has expired' : ''}.
          To continue booking, please contact your trainer to purchase a new membership or add class credits.
        </p>
        <div className="pt-2 space-y-2">
          <p className="text-xs font-light text-gray-500">
            Options available:
          </p>
          <ul className="text-xs font-light text-gray-400 space-y-1">
            <li>— Purchase a membership</li>
            <li>— Add class credits</li>
          </ul>
        </div>
        <button onClick={logout} className="text-xs font-light text-gray-300 hover:text-gray-500 transition mt-6 block mx-auto">
          Sign out
        </button>
      </div>
    </div>
  );
};

export default PaymentRequired;
