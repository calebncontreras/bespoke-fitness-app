import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';

const Login: React.FC = () => {
  const { handleTrainerLogin, handleMagicLink, magicLinkSent } = useAppState();

  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');
  const [trainerError, setTrainerError] = useState('');

  const [clientEmail, setClientEmail] = useState('');
  const [clientError, setClientError] = useState('');

  const [loading, setLoading] = useState(false);

  const onTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrainerError('');
    setLoading(true);
    try {
      await handleTrainerLogin(trainerEmail, trainerPassword);
    } catch {
      setTrainerError('Invalid email or password.');
    }
    setLoading(false);
  };

  const onMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setLoading(true);
    try {
      await handleMagicLink(clientEmail);
    } catch {
      setClientError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-6">
          <p className="text-sm font-light text-gray-900 mb-2">Check your email</p>
          <p className="text-xs font-light text-gray-400">
            We sent a login link to <span className="text-gray-600">{clientEmail}</span>. Click it to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm px-6 space-y-10">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900">Bespoke Fitness</h1>
        </div>

        {/* Trainer */}
        <div>
          <p className="text-xs font-light uppercase tracking-widest text-gray-400 mb-4">Trainer</p>
          <form onSubmit={onTrainerSubmit} className="space-y-3">
            <input
              type="email"
              value={trainerEmail}
              onChange={e => setTrainerEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
            />
            <input
              type="password"
              value={trainerPassword}
              onChange={e => setTrainerPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
            />
            {trainerError && <p className="text-xs text-red-500 font-light">{trainerError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-300 transition"
            >
              Sign In
            </button>
          </form>
        </div>

        <div className="border-t border-gray-100" />

        {/* Client */}
        <div>
          <p className="text-xs font-light uppercase tracking-widest text-gray-400 mb-4">Client</p>
          <form onSubmit={onMagicLink} className="space-y-3">
            <input
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
            />
            {clientError && <p className="text-xs text-red-500 font-light">{clientError}</p>}
            <button
              type="submit"
              disabled={loading || !clientEmail}
              className="w-full py-2 border border-gray-900 text-gray-900 text-sm font-light hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-300 transition"
            >
              Send Login Link
            </button>
          </form>
          <p className="text-[11px] font-light text-gray-300 mt-3 text-center">
            New clients will be prompted to complete their profile after clicking the link.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
