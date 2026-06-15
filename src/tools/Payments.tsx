import React from 'react';
import { useAppState } from '../state/AppState';
import PaymentDashboard from '../components/payments/PaymentDashboard';
import PaymentHistory from '../components/payments/PaymentHistory';
import type { Member } from '../types';

const Payments: React.FC = () => {
  const { currentUser, members, membershipTypes, isMembershipValid } = useAppState();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 font-light text-sm">Log in via Scheduler to view payments.</p>
      </div>
    );
  }

  if (currentUser.id === 'admin') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Payments</h1>
        <PaymentDashboard />
      </div>
    );
  }

  const memberUser = currentUser as Member;
  const freshMember = members.find(m => m.id === memberUser.id) ?? memberUser;
  const mt = membershipTypes.find(t => t.id === freshMember.membershipType);
  const isValid = isMembershipValid(freshMember.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-3xl font-light text-gray-900">My Payments</h1>

      <div className="p-6 border border-gray-200">
        <div className="text-xs text-gray-400 font-light uppercase tracking-widest mb-3">Membership</div>
        <div className="text-xl font-light text-gray-900">{mt?.name ?? freshMember.membershipType}</div>
        <div className={`text-sm font-light mt-2 ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          {isValid ? `Active · renews ${freshMember.membershipExpiry}` : `Expired ${freshMember.membershipExpiry}`}
        </div>
        {mt && (
          <div className="text-sm text-gray-500 font-light mt-1">
            Next payment due: {freshMember.membershipExpiry} · ${mt.price}/mo
          </div>
        )}
      </div>

      <div className="p-6 border border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-400 font-light uppercase tracking-widest mb-4">Pay via Zelle</div>
        <div className="space-y-2 text-sm font-light text-gray-700">
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 shrink-0">Send to</span>
            <span className="text-gray-900">bespokefitness@zelle.com</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 shrink-0">Memo</span>
            <span className="text-gray-900">{freshMember.name} – {mt?.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 shrink-0">Amount</span>
            <span className="text-gray-900">${mt?.price ?? '—'}/mo</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 font-light mt-4">
          Your membership will be extended once admin confirms the payment.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-light text-gray-900 mb-4">Transaction History</h2>
        <PaymentHistory filterMemberId={freshMember.id} />
      </div>
    </div>
  );
};

export default Payments;
