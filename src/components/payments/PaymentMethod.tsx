import React from 'react';
import type { PaymentMethodType } from '../../types';

// Stripe PaymentIntent stub — add VITE_STRIPE_PUBLISHABLE_KEY to .env to activate
// import { loadStripe } from '@stripe/stripe-js';
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
//
// export const createStripePaymentIntent = async (amountCents: number, memberId: number) => {
//   const res = await fetch('/api/create-payment-intent', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ amount: amountCents, currency: 'usd', metadata: { memberId } }),
//   });
//   const { clientSecret } = await res.json() as { clientSecret: string };
//   const stripe = await stripePromise;
//   return stripe?.confirmCardPayment(clientSecret);
// };

interface PaymentMethodProps {
  value: PaymentMethodType | null;
  onChange: (method: PaymentMethodType) => void;
}

const METHODS: { id: PaymentMethodType; label: string; comingSoon?: boolean }[] = [
  { id: 'Cash', label: 'Cash' },
  { id: 'Zelle', label: 'Zelle' },
  { id: 'Stripe', label: 'Stripe', comingSoon: true },
];

const PaymentMethod: React.FC<PaymentMethodProps> = ({ value, onChange }) => (
  <div className="flex gap-2">
    {METHODS.map(m => (
      <button
        key={m.id}
        type="button"
        disabled={m.comingSoon}
        onClick={() => !m.comingSoon && onChange(m.id)}
        className={`relative flex-1 px-4 py-2 text-sm font-light border transition ${
          m.comingSoon
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
            : value === m.id
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 text-gray-700 hover:border-gray-500'
        }`}
      >
        {m.label}
        {m.comingSoon && (
          <span className="absolute -top-2.5 right-1 text-xs bg-gray-100 text-gray-400 px-1 py-px font-light">
            soon
          </span>
        )}
      </button>
    ))}
  </div>
);

export default PaymentMethod;
