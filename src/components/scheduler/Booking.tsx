import React, { useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAppState } from '../../state/AppState';
import ClientDocuments from '../documents/ClientDocuments';
import type { Member } from '../../types';

const SESSION_DURATIONS = [30, 60];

function buildSessionTimes(): string[] {
  const times: string[] = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m > 0) break;
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return times;
}
const SESSION_TIMES = buildSessionTimes();

function fmt12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const PersonalBookingPanel: React.FC = () => {
  const { personalSessions, handleBookSession, currentUser } = useAppState();
  const member = currentUser as Member;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const onBook = () => {
    if (!date || !time) return;
    handleBookSession(date, time, duration, notes);
    setDate('');
    setTime('');
    setNotes('');
    setBooked(true);
    setTimeout(() => setBooked(false), 3000);
  };

  const mySessions = personalSessions.filter(s => s.memberId === member.id);

  return (
    <div className="p-6 space-y-8">
      <div className="border border-gray-200 p-6">
        <h3 className="text-sm font-light text-gray-600 uppercase tracking-widest mb-4">Request a Session</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 font-light mb-1">Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-light mb-1">Time</label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
            >
              <option value="">Select time</option>
              {SESSION_TIMES.map(t => (
                <option key={t} value={t}>{fmt12(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-light mb-1">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
            >
              {SESSION_DURATIONS.map(d => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 font-light mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Goals, injuries, preferences..."
            className="w-full border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>
        <button
          onClick={onBook}
          disabled={!date || !time}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
        >
          Request Session
        </button>
        {booked && <span className="ml-3 text-sm text-green-600 font-light">Request sent — your trainer will confirm shortly.</span>}
      </div>

      <div>
        <h3 className="text-sm font-light text-gray-600 uppercase tracking-widest mb-3">My 1-on-1 Sessions</h3>
        {mySessions.length === 0
          ? <p className="text-gray-500 font-light text-sm">No sessions booked yet.</p>
          : (
            <div className="space-y-3">
              {mySessions.map(s => {
                const statusColor = s.status === 'confirmed' ? 'text-green-700' : s.status === 'cancelled' ? 'text-gray-400' : 'text-yellow-600';
                return (
                  <div key={s.id} className="border border-gray-200 p-4 flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500 font-light">{s.date} at {fmt12(s.time)} · {s.duration} min</div>
                      {s.notes && <div className="text-xs text-gray-400 font-light mt-1">{s.notes}</div>}
                    </div>
                    <span className={`text-xs font-light capitalize ${statusColor}`}>{s.status}</span>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
};

const Booking: React.FC = () => {
  const {
    currentUser, setCurrentUser, classes,
    getAvailableSpots, isSignedUp, getClassesRemaining, getTrialDaysRemaining,
    handleSignUp, handleCancel, logout,
  } = useAppState();
  const [bookingTab, setBookingTab] = useState<'classes' | '1on1' | 'documents'>('classes');

  const member = currentUser as Member;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center px-6 py-8 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              {bookingTab === 'classes' ? 'Available Classes' : '1-on-1 Sessions'}
            </h1>
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

        <div className="flex border-b border-gray-200">
          {([['classes', 'Group Classes'], ['1on1', '1-on-1 Sessions'], ['documents', 'Documents']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setBookingTab(id)}
              className={`px-6 py-3 text-sm font-light border-b-2 transition ${bookingTab === id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {bookingTab === '1on1' && <PersonalBookingPanel />}

        {bookingTab === 'documents' && (
          <div className="p-6 max-w-2xl">
            <h3 className="text-sm font-light text-gray-600 uppercase tracking-widest mb-4">My Documents</h3>
            <ClientDocuments memberId={member.id} memberName={member.name} />
          </div>
        )}

        {bookingTab === 'classes' && <><div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
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
              <div className="text-2xl font-light text-gray-900">
                {Number.isFinite(getClassesRemaining()) ? Math.max(0, getClassesRemaining()) : 'Unlimited'}
              </div>
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
        </>}
      </div>
    </div>
  );
};

export default Booking;
