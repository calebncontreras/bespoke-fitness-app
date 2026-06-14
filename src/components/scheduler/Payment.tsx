import React from 'react';
import { useAppState } from '../../state/AppState';

const Payment: React.FC = () => {
  const { currentUser, membershipTypes, setView, setCurrentUser } = useAppState();

  const handleBack = () => {
    setView('login');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="px-6 py-8 border-b border-gray-200">
          <button onClick={handleBack} className="text-gray-600 hover:text-gray-900 font-light text-sm mb-4">← Back</button>
          <h1 className="text-3xl font-light text-gray-900">Renew Membership</h1>
          <p className="text-sm text-gray-600 font-light mt-2">{currentUser?.name}</p>
        </div>
        <div className="p-6 max-w-md">
          <p className="text-sm text-gray-600 font-light mb-8">
            Your membership expired on {'membershipExpiry' in (currentUser ?? {}) ? (currentUser as { membershipExpiry: string }).membershipExpiry : ''}. Choose a plan to regain access.
          </p>
          <div className="space-y-3 mb-8">
            {membershipTypes.map(type => (
              <label key={type.id} className="flex items-start p-4 border border-gray-300 hover:border-gray-400 cursor-pointer transition">
                <input type="radio" name="plan" value={type.id} className="mt-1 mr-4" />
                <div>
                  <div className="font-light text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-600 font-light">{type.price === 0 ? 'Free' : `$${type.price}/month`}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="space-y-4 mb-8">
            <input type="text" placeholder="Card number" className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            <div className="flex gap-4">
              <input type="text" placeholder="MM/YY" className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <input type="text" placeholder="CVC" className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            </div>
            <input type="text" placeholder="Name on card" className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleBack} className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Cancel</button>
            <button onClick={() => { alert('Payment processed! Membership renewed.'); handleBack(); }} className="flex-1 px-6 py-3 bg-gray-900 text-white font-light hover:bg-gray-800 transition">Process Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
