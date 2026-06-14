import React from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAppState } from '../../state/AppState';
import type { Member } from '../../types';

const Booking: React.FC = () => {
  const {
    currentUser, setCurrentUser, classes,
    getAvailableSpots, isSignedUp, getClassesRemaining, getTrialDaysRemaining,
    handleSignUp, handleCancel, logout,
  } = useAppState();

  const member = currentUser as Member;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center px-6 py-8 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Available Classes</h1>
            <p className="text-sm text-gray-600 font-light mt-1">{member.name}</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <label className="flex items-center gap-2 text-sm font-light text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={member.googleCalendarEnabled || false}
                onChange={e => setCurrentUser({ ...member, googleCalendarEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              Auto-sync to Google Calendar
            </label>
            <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-light">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {classes.map(c => (
            <div key={c.id} className="border border-gray-200 p-6">
              <h3 className="text-lg font-light text-gray-900 mb-3">{c.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 font-light mb-4">
                <div>{c.day} at {c.time}</div>
                <div>Instructor: {c.instructor}</div>
                <div>Location: {c.location}</div>
                <div>{getAvailableSpots(c)} / {c.capacity} spots available</div>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isSignedUp(c.id) ? (
                  <button onClick={() => handleCancel(c.id)} className="w-full px-4 py-2 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition">Cancel Booking</button>
                ) : getAvailableSpots(c) > 0 ? (
                  <>
                    <button
                      onClick={() => handleSignUp(c.id, false)}
                      disabled={getClassesRemaining() <= 0}
                      className={`w-full px-4 py-2 font-light transition flex items-center justify-center gap-2 ${getClassesRemaining() > 0 ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      Sign Up <ChevronRight size={16} />
                    </button>
                    {member.classCredits > 0 && (
                      <button onClick={() => handleSignUp(c.id, true)} className="w-full px-4 py-2 border border-gray-300 text-gray-900 font-light hover:bg-gray-50 transition text-sm">
                        Use Class Credit ({member.classCredits} remaining)
                      </button>
                    )}
                  </>
                ) : (
                  <button disabled className="w-full px-4 py-2 bg-gray-200 text-gray-500 font-light cursor-not-allowed">Class Full</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <h3 className="text-lg font-light text-gray-900 mb-4">My Bookings</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 border border-gray-200 text-center">
              <div className="text-xs text-gray-600 font-light mb-1">Class Credits</div>
              <div className="text-2xl font-light text-gray-900">{member.classCredits}</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 text-center">
              <div className="text-xs text-gray-600 font-light mb-1">Classes Left This Week</div>
              <div className="text-2xl font-light text-gray-900">{Math.max(0, getClassesRemaining())}</div>
            </div>
            {getTrialDaysRemaining() !== null && (
              <div className="p-3 bg-gray-50 border border-gray-200 text-center">
                <div className="text-xs text-gray-600 font-light mb-1">Trial Days Left</div>
                <div className="text-2xl font-light text-gray-900">{getTrialDaysRemaining()}</div>
              </div>
            )}
          </div>
          {member.googleCalendarEnabled && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200">
              <p className="text-xs text-green-700 font-light">Classes are automatically added to your Google Calendar</p>
            </div>
          )}
          <div className="space-y-3">
            {classes.filter(c => isSignedUp(c.id)).length > 0
              ? classes.filter(c => isSignedUp(c.id)).map(c => (
                <div key={c.id} className="p-4 bg-gray-50 border border-gray-200 flex justify-between items-start">
                  <div>
                    <div className="font-light text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-600 font-light">{c.day} at {c.time}</div>
                  </div>
                  {member.googleCalendarEnabled && <div className="text-xs text-green-600 font-light">✓ In calendar</div>}
                </div>
              ))
              : <p className="text-gray-500 font-light">No bookings yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
