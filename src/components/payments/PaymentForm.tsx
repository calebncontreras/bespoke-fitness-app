import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import PaymentMethod from './PaymentMethod';
import type { PaymentMethodType } from '../../types';

interface PaymentFormProps {
  defaultMemberId?: string;
  onSuccess?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ defaultMemberId, onSuccess }) => {
  const { members, membershipTypes, sessionPacks, handleRecordPayment } = useAppState();

  const initialMemberId = defaultMemberId ?? members[0]?.id ?? '';
  const [memberId, setMemberId] = useState<string>(initialMemberId);
  // Encoded product selection: "membership:<id>" or "pack:<id>"
  const [product, setProduct] = useState('');
  const [method, setMethod] = useState<PaymentMethodType | null>(null);
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Auto-calculated price from the selected product.
  const [kind, rawId] = product.split(':');
  const selectedTier = kind === 'membership' ? membershipTypes.find(t => t.id === rawId) : undefined;
  const selectedPack = kind === 'pack' ? sessionPacks.find(p => String(p.id) === rawId) : undefined;
  const amount = selectedTier?.price ?? selectedPack?.price ?? null;

  const handleSubmit = () => {
    if (!memberId || !product || !method || !date) {
      setError('Please choose a member, a product, a payment method, and a date.');
      return;
    }
    handleRecordPayment(memberId, kind as 'membership' | 'pack', rawId, method, reference, date);
    setProduct('');
    setReference('');
    setMethod(null);
    setError('');
    onSuccess?.();
  };

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
      </div>

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Membership or Session Pack</label>
        <select
          value={product}
          onChange={e => setProduct(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light text-sm"
        >
          <option value="">Select a product…</option>
          {membershipTypes.length > 0 && (
            <optgroup label="Memberships">
              {membershipTypes.map(t => (
                <option key={`membership:${t.id}`} value={`membership:${t.id}`}>
                  {t.name} — ${t.price}{t.durationDays ? ` / ${t.durationDays} days` : ' / mo'}
                </option>
              ))}
            </optgroup>
          )}
          {sessionPacks.length > 0 && (
            <optgroup label="Session Packs">
              {sessionPacks.map(p => (
                <option key={`pack:${p.id}`} value={`pack:${p.id}`}>
                  {p.name} — {p.credits} credits — ${p.price}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div>
        <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Total</label>
        <div className="w-full px-4 py-2 border border-gray-200 bg-gray-50 font-light text-sm text-gray-900">
          {amount != null ? `$${amount.toFixed(2)}` : '—'}
        </div>
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
        disabled={amount == null}
        className="w-full px-4 py-2.5 bg-gray-900 text-white font-light hover:bg-gray-800 disabled:bg-gray-300 transition text-sm"
      >
        {amount != null ? `Record Payment · $${amount.toFixed(2)}` : 'Record Payment'}
      </button>
    </div>
  );
};

export default PaymentForm;
