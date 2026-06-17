import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppState } from '../../state/AppState';

const Login: React.FC = () => {
  const { members, isMembershipValid, handleTrainerLogin, handleMemberLogin, setCurrentUser, setView } = useAppState();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light text-gray-900 mb-12 text-center">Bespoke Fitness</h1>

        <button onClick={handleTrainerLogin} className="w-full px-6 py-4 bg-gray-900 text-white font-light hover:bg-gray-800 transition">
          Trainer Login
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400 uppercase tracking-widest">Client</span></div>
        </div>

        <div className="space-y-3 mb-6">
          {members.map(member => {
            const isValid = isMembershipValid(member.id);
            return isValid ? (
              <button key={member.id} onClick={() => handleMemberLogin(member.id)} className="w-full px-4 py-3 text-left border border-gray-200 hover:border-gray-400 transition flex justify-between items-center">
                <div>
                  <div className="font-light text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ) : (
              <div key={member.id} className="p-4 border border-gray-200 flex justify-between items-start">
                <div>
                  <div className="font-light text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-500 font-light">Expired {member.membershipExpiry}</p>
                  <button onClick={() => { setCurrentUser(member); setView('payment'); }} className="text-xs text-red-500 font-light underline hover:text-red-700">Update payment</button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setView('signup')} className="w-full px-6 py-4 border border-gray-200 text-gray-900 font-light hover:bg-gray-50 transition">
          New Client Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
