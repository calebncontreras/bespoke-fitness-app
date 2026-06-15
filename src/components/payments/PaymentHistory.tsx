import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';

interface PaymentHistoryProps {
  filterMemberId?: number;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ filterMemberId }) => {
  const { payments, members } = useAppState();
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = payments.filter(p => {
    if (filterMemberId !== undefined && p.memberId !== filterMemberId) return false;
    if (selectedMember && p.memberId !== Number(selectedMember)) return false;
    if (fromDate && p.date < fromDate) return false;
    if (toDate && p.date > toDate) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {filterMemberId === undefined && (
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedMember}
            onChange={e => setSelectedMember(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
          >
            <option value="">All Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
          />
          {(selectedMember || fromDate || toDate) && (
            <button
              onClick={() => { setSelectedMember(''); setFromDate(''); setToDate(''); }}
              className="text-xs text-gray-400 font-light hover:text-gray-600 px-2"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 font-light">No transactions found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
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
  );
};

export default PaymentHistory;
