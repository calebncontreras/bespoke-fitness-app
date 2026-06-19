import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';

const PaymentDashboard: React.FC = () => {
  const { members, payments, isMembershipValid } = useAppState();
  const [quickPayMemberId, setQuickPayMemberId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'record' | 'history'>('overview');

  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const overdue = members.filter(m => !isMembershipValid(m.id));
  const expiringSoon = members.filter(m => isMembershipValid(m.id) && m.membershipExpiry <= in30Days);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const recent = payments.slice(0, 5);

  const handleQuickPay = (memberId: string) => {
    setQuickPayMemberId(memberId);
    setActiveTab('record');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'record', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-light border-b-2 transition -mb-px ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            {[
              ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
              ['Overdue Members', String(overdue.length)],
              ['Expiring in 30 Days', String(expiringSoon.length)],
            ].map(([label, val]) => (
              <div key={label} className="p-6 bg-gray-50 border border-gray-200">
                <div className="text-sm text-gray-600 font-light mb-2">{label}</div>
                <div className="text-3xl font-light text-gray-900">{val}</div>
              </div>
            ))}
          </div>

          {overdue.length > 0 && (
            <div>
              <h3 className="text-xs font-light text-gray-400 uppercase tracking-widest mb-3">Overdue</h3>
              <div className="space-y-2">
                {overdue.map(m => (
                  <div key={m.id} className="p-4 border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-light text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500 font-light mt-0.5">
                        {m.membershipType} · expired {m.membershipExpiry}
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickPay(m.id)}
                      className="text-xs px-3 py-1.5 bg-gray-900 text-white font-light hover:bg-gray-800 transition"
                    >
                      Record Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiringSoon.length > 0 && (
            <div>
              <h3 className="text-xs font-light text-gray-400 uppercase tracking-widest mb-3">Expiring Soon</h3>
              <div className="space-y-2">
                {expiringSoon.map(m => (
                  <div key={m.id} className="p-4 border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-light text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500 font-light mt-0.5">
                        {m.membershipType} · expires {m.membershipExpiry}
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickPay(m.id)}
                      className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 font-light hover:bg-gray-50 transition"
                    >
                      Record Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-light text-gray-400 uppercase tracking-widest">Recent Transactions</h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs text-gray-400 font-light hover:text-gray-600 underline"
              >
                View all
              </button>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-400 font-light">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {recent.map(p => (
                  <div key={p.id} className="p-4 border border-gray-200 flex justify-between items-start">
                    <div>
                      <div className="font-light text-gray-900 text-sm">{p.memberName}</div>
                      <div className="text-xs text-gray-500 font-light mt-0.5">
                        {p.date} · {p.method}
                        {p.reference ? ` · ${p.reference}` : ''}
                      </div>
                    </div>
                    <div className="text-gray-900 font-light text-sm">${p.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'record' && (
        <div className="max-w-md">
          <PaymentForm
            key={quickPayMemberId ?? ''}
            defaultMemberId={quickPayMemberId ?? undefined}
            onSuccess={() => {
              setQuickPayMemberId(null);
              setActiveTab('history');
            }}
          />
        </div>
      )}

      {activeTab === 'history' && <PaymentHistory />}
    </div>
  );
};

export default PaymentDashboard;
