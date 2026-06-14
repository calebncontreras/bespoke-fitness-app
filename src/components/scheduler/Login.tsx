import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppState } from '../../state/AppState';

const Login: React.FC = () => {
  const { members, isMembershipValid, handleAdminLogin, handleMemberLogin, setCurrentUser, setView } = useAppState();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light text-gray-900 mb-12 text-center">Class Scheduler</h1>
        <button onClick={handleAdminLogin} className="w-full px-6 py-4 bg-gray-900 text-white font-light hover:bg-gray-800 transition mb-6">Admin Login</button>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
        </div>
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600 font-light">Select your account:</p>
          {members.map(member => {
            const isValid = isMembershipValid(member.id);
            return isValid ? (
              <button key={member.id} onClick={() => handleMemberLogin(member.id)} className="w-full px-4 py-3 text-left border border-gray-300 hover:border-gray-400 transition flex justify-between items-center">
                <div>
                  <div className="font-light text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ) : (
              <div key={member.id} className="p-4 border border-gray-300 flex justify-between items-start">
                <div>
                  <div className="font-light text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
                <div>
                  <p className="text-xs text-red-600 font-light">Membership expired {member.membershipExpiry}</p>
                  <button onClick={() => { setCurrentUser(member); setView('payment'); }} className="text-xs text-red-600 font-light underline hover:text-red-700">Update payment</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">new member</span></div>
        </div>
        <button onClick={() => setView('signup')} className="w-full px-6 py-4 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Create New Account</button>
      </div>
    </div>
  );
};

export default Login;
