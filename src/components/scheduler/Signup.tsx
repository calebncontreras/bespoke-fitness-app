import React from 'react';
import { useAppState } from '../../state/AppState';

const Signup: React.FC = () => {
  const { membershipTypes, signupForm, setSignupForm, handleSignup, setView } = useAppState();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button onClick={() => setView('login')} className="text-gray-600 hover:text-gray-900 font-light text-sm mb-6">← Back</button>
        <h1 className="text-3xl font-light text-gray-900 mb-8">Create Account</h1>
        <div className="space-y-4 mb-6">
          <input type="text" placeholder="Full Name" value={signupForm.name} onChange={e => setSignupForm({ ...signupForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="email" placeholder="Email" value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
        </div>
        <div className="mb-6">
          <label className="text-sm text-gray-600 font-light block mb-3">Select Membership</label>
          <div className="space-y-2">
            {membershipTypes.map(type => (
              <label key={type.id} className={`flex items-start p-4 border cursor-pointer transition ${signupForm.membershipType === type.id ? 'border-gray-900' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="membershipType" value={type.id} checked={signupForm.membershipType === type.id} onChange={e => setSignupForm({ ...signupForm, membershipType: e.target.value })} className="mt-1 mr-3" />
                <div>
                  <div className="font-light text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-600 font-light">{type.price === 0 ? 'Free' : `$${type.price}/month`}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="text-sm text-gray-600 font-light block mb-3">Payment Information</label>
          <div className="space-y-3">
            <input type="text" placeholder="Card Number" value={signupForm.cardNumber} onChange={e => setSignupForm({ ...signupForm, cardNumber: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            <div className="flex gap-3">
              <input type="text" placeholder="MM/YY" value={signupForm.expiry} onChange={e => setSignupForm({ ...signupForm, expiry: e.target.value })} className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <input type="text" placeholder="CVC" value={signupForm.cvc} onChange={e => setSignupForm({ ...signupForm, cvc: e.target.value })} className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('login')} className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSignup} className="flex-1 px-6 py-3 bg-gray-900 text-white font-light hover:bg-gray-800 transition">Create Account</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
