import React, { useState, useEffect } from 'react';
import { useAppState } from '../../state/AppState';
import PaymentMethod from './PaymentMethod';
import type { PaymentMethodType } from '../../types';

interface PaymentFormProps {
  defaultMemberId?: string;
  onSuccess?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ defaultMemberId, onSuccess }) => {
  const { members, membershipTypes, handleRecordPayment } = useAppState();

  const initialMemberId = defaultMemberId ?? members[0]?.id ?? '';
  const [memberId, setMemberId] = useState<string>(initialMemberId);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethodType | null>(null);
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      const mt = membershipTypes.find(t => t.id === member.membershipType);
      if (mt) setAmount(String(mt.price));
    }
  }, [memberId, members, membershipTypes]);

  const handleSubmit = () => {
    if (!memberId || !amount || !method || !date) {
      setError('Please fill in all required fields.');
      return;
    }
    handleRecordPayment(memberId, parseFloat(amount), method, reference, date);
    setReference('');
    setMethod(null);
    setError('');
    onSuccess?.();
  };

  const member = members.find(m => m.id === memberId);
  const mt = member ? membershipTypes.find(t => t.id === member.membershipType) : null;

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-500 font-light">{error}</p>}

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Member</label>
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        {mt && (
          <p className="mt-1 text-xs text-gray-400 font-light">{mt.name} · ${mt.price}/mo</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Payment Method</label>
        <PaymentMethod value={method} onChange={setMethod} />
      </div>

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">
          {method === 'Zelle' ? 'Zelle Confirmation #' : 'Reference / Notes'}
        </label>
        <input
          type="text"
          value={reference}
          onChange={e => setReference(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
          placeholder={method === 'Zelle' ? 'e.g. ZL-98765' : 'Optional notes'}
        />
      </div>

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2.5 bg-gray-900 text-white font-light hover:bg-gray-800 transition text-sm"
      >
        Record Payment
      </button>
    </div>
  );
};

export default PaymentForm;
