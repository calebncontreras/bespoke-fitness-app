import React, { useState } from 'react';
import type { Class } from '../../types';
import { useAppState } from '../../state/AppState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ClassModalProps {
  classData: Class | null;
  prefillDay?: string;
  prefillTime?: string;
  onClose: () => void;
}

const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400 transition-colors';
const lbl = 'block text-xs font-light text-gray-400 mb-1';

const ClassModal: React.FC<ClassModalProps> = ({ classData, prefillDay, prefillTime, onClose }) => {
  const { currentUser, setClasses, handleDeleteClass, handleSignUp, handleCancel, isSignedUp, getAvailableSpots } = useAppState();
  const isAdmin = currentUser && 'role' in currentUser;

  const [editing, setEditing] = useState(!classData);
  const [form, setForm] = useState({
    name: classData?.name ?? '',
    day: classData?.day ?? prefillDay ?? '',
    time: classData?.time ?? prefillTime ?? '',
    instructor: classData?.instructor ?? '',
    location: classData?.location ?? '',
    capacity: String(classData?.capacity ?? 10),
  });

  const booked = classData ? isSignedUp(classData.id) : false;
  const spots = classData ? getAvailableSpots(classData) : 0;

  const handleSave = () => {
    if (!form.name.trim() || !form.day || !form.time.trim()) return;
    const cap = Math.max(1, parseInt(form.capacity) || 10);
    if (classData) {
      setClasses(prev => prev.map(c =>
        c.id === classData.id ? { ...c, ...form, capacity: cap } : c
      ));
    } else {
      setClasses(prev => [...prev, {
        id: Date.now(),
        name: form.name.trim(),
        day: form.day,
        time: form.time.trim(),
        instructor: form.instructor.trim(),
        location: form.location.trim(),
        capacity: cap,
        signups: [],
      }]);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!classData || !confirm(`Delete "${classData.name}"?`)) return;
    handleDeleteClass(classData.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-light text-gray-900">
              {!classData ? 'New Class' : editing ? 'Edit Class' : classData.name}
            </h2>
            {!editing && classData && (
              <p className="text-sm font-light text-gray-400 mt-0.5">{classData.day} · {classData.time}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none ml-4">&times;</button>
        </div>

        <div className="px-6 py-5">
          {isAdmin && editing ? (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Class Name</label>
                <input
                  className={inp}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Yoga Flow"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Day</label>
                  <select className={inp} value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                    <option value="">Select day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Time (HH:MM)</label>
                  <input className={inp} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="09:00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Instructor</label>
                  <input className={inp} value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} placeholder="Name" />
                </div>
                <div>
                  <label className={lbl}>Location</label>
                  <input className={inp} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Room A" />
                </div>
              </div>
              <div>
                <label className={lbl}>Capacity</label>
                <input className={inp} type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gray-900 text-white text-sm font-light py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  {classData ? 'Save Changes' : 'Add Class'}
                </button>
                {classData && (
                  <button onClick={() => setEditing(false)} className="px-4 text-sm font-light text-gray-400 hover:text-gray-700 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            classData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {classData.instructor && (
                    <div>
                      <p className="text-xs font-light text-gray-400">Instructor</p>
                      <p className="text-sm font-light text-gray-900 mt-0.5">{classData.instructor}</p>
                    </div>
                  )}
                  {classData.location && (
                    <div>
                      <p className="text-xs font-light text-gray-400">Location</p>
                      <p className="text-sm font-light text-gray-900 mt-0.5">{classData.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-light text-gray-400">Spots</p>
                    <p className={`text-sm font-light mt-0.5 ${spots === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {spots === 0 ? 'Class full' : `${spots} of ${classData.capacity} available`}
                    </p>
                  </div>
                  {booked && (
                    <div>
                      <p className="text-xs font-light text-gray-400">Status</p>
                      <p className="text-sm font-light text-emerald-600 mt-0.5">Booked</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="flex-1 border border-gray-200 text-sm font-light py-2 rounded hover:border-gray-400 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 border border-red-100 text-red-500 text-sm font-light py-2 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  ) : booked ? (
                    <button
                      onClick={() => { handleCancel(classData.id); onClose(); }}
                      className="flex-1 border border-gray-200 text-sm font-light py-2 rounded hover:border-gray-400 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <button
                      onClick={() => { handleSignUp(classData.id); onClose(); }}
                      disabled={spots === 0}
                      className="flex-1 bg-gray-900 text-white text-sm font-light py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {spots === 0 ? 'Class Full' : 'Sign Up'}
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassModal;
