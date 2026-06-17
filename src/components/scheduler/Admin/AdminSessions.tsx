import React, { useState } from 'react';
import { useAppState } from '../../../state/AppState';
import type { SessionStatus } from '../../../types';

const STATUS_LABELS: Record<SessionStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  confirmed: 'text-green-700 bg-green-50 border-green-200',
  cancelled: 'text-gray-400 bg-gray-50 border-gray-200',
};

const AdminSessions: React.FC = () => {
  const { personalSessions, handleUpdateSessionStatus } = useAppState();
  const [filter, setFilter] = useState<SessionStatus | 'all'>('all');

  const visible = filter === 'all'
    ? personalSessions
    : personalSessions.filter(s => s.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-light border transition ${filter === f ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-gray-500 font-light text-sm">No sessions found.</p>
      )}

      <div className="space-y-3">
        {visible.map(s => (
          <div key={s.id} className="border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-light text-gray-900">{s.memberName}</div>
                <div className="text-sm text-gray-500 font-light">
                  {s.date} at {s.time} · {s.duration} min
                </div>
                {s.notes && <div className="text-xs text-gray-400 font-light mt-1">{s.notes}</div>}
              </div>
              <span className={`text-xs font-light px-2 py-1 border ${STATUS_COLORS[s.status]}`}>
                {STATUS_LABELS[s.status]}
              </span>
            </div>
            {s.status === 'pending' && (
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleUpdateSessionStatus(s.id, 'confirmed')}
                  className="px-3 py-1 bg-gray-900 text-white text-xs font-light hover:bg-gray-800 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleUpdateSessionStatus(s.id, 'cancelled')}
                  className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-light hover:bg-gray-50 transition"
                >
                  Decline
                </button>
              </div>
            )}
            {s.status === 'confirmed' && (
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleUpdateSessionStatus(s.id, 'cancelled')}
                  className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-light hover:bg-gray-50 transition"
                >
                  Cancel Session
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSessions;
