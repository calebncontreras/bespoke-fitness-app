import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';

const Login: React.FC = () => {
  const { handlePasswordLogin, handleForgotPassword, handleMagicLink, magicLinkSent } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const onPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await handlePasswordLogin(email, password);
    } catch {
      setError('Invalid email or password. Try a login link or reset your password.');
    }
    setLoading(false);
  };

  const onMagicLink = async () => {
    if (!email) {
      setError('Enter your email first, then request a login link.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await handleMagicLink(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const onForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleForgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      // Show sent regardless to avoid email enumeration
      setForgotSent(true);
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-6">
          <p className="text-sm font-light text-gray-900 mb-2">Check your email</p>
          <p className="text-xs font-light text-gray-400">
            We sent a login link to <span className="text-gray-600">{email}</span>. Click it to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm px-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900">Bespoke Fitness</h1>
        </div>

        {forgotMode ? (
          forgotSent ? (
            <div className="space-y-3 text-center">
              <p className="text-xs font-light text-gray-500">Check your email for a password reset link.</p>
              <button
                onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                className="text-xs font-light text-gray-400 hover:text-gray-700 transition"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={onForgotPassword} className="space-y-3">
              <p className="text-xs font-light text-gray-500">Enter your email and we'll send a reset link.</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Your email"
                required
                autoFocus
                className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !forgotEmail}
                className="w-full py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-300 transition"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => setForgotMode(false)} className="text-xs font-light text-gray-400 hover:text-gray-700 transition">
                Back to sign in
              </button>
            </form>
          )
        ) : (
          <>
            <form onSubmit={onPasswordLogin} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
              />
              {error && <p className="text-xs text-red-500 font-light">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-300 transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button type="button" onClick={() => setForgotMode(true)} className="text-xs font-light text-gray-400 hover:text-gray-700 transition">
                Forgot password?
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-100" />
              <span className="text-[11px] font-light text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>

            <div>
              <button
                onClick={onMagicLink}
                disabled={loading || !email}
                className="w-full py-2 border border-gray-900 text-gray-900 text-sm font-light hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-300 transition"
              >
                Email me a login link
              </button>
              <p className="text-[11px] font-light text-gray-300 mt-3 text-center">
                New clients: use the login link to get started — you'll set up your profile (and can add a password) after.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
