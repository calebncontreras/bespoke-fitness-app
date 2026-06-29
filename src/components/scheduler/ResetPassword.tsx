import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      // Sign out so SIGNED_OUT handler clears recovery state and routes to login
      setTimeout(() => supabase.auth.signOut(), 1500);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-6">
          <p className="text-sm font-light text-gray-900 mb-2">Password updated</p>
          <p className="text-xs font-light text-gray-400">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm px-6 space-y-6">
        <div>
          <p className="text-sm font-light text-gray-900 mb-1">Set new password</p>
          <p className="text-xs font-light text-gray-400">Choose a password at least 8 characters long.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
            required
            autoFocus
            className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
          {error && <p className="text-xs text-red-500 font-light">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-300 transition"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
