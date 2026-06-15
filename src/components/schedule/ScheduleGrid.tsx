import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import ClassCard from './ClassCard';
import ClassModal from './ClassModal';
import type { Class } from '../../types';

type ViewMode = 'weekly' | 'monthly';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildTimeSlots(classes: Class[]): string[] {
  const standard: string[] = [];
  for (let h = 6; h <= 21; h++) standard.push(`${h.toString().padStart(2, '0')}:00`);
  const extra = classes.map(c => c.time).filter(t => !standard.includes(t));
  return [...new Set([...standard, ...extra])].sort();
}

interface ModalState {
  classData: Class | null;
  prefillDay?: string;
  prefillTime?: string;
}

const ScheduleGrid: React.FC = () => {
  const { classes, currentUser, isSignedUp, getAvailableSpots, logout } = useAppState();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const isAdmin = !!(currentUser && 'role' in currentUser);
  const timeSlots = buildTimeSlots(classes);

  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const calCells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (calCells.length % 7 !== 0) calCells.push(null);

  const getDayName = (d: number) => DAYS[(new Date(year, month, d).getDay() + 6) % 7];

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-light text-gray-900">Class Schedule</p>
          <p className="text-xs font-light text-gray-400 mt-0.5">
            {isAdmin ? 'Admin — click any empty slot to add a class' : `Welcome, ${currentUser?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'monthly' && (
            <div className="flex items-center gap-1">
              <button onClick={() => setMonthOffset(o => o - 1)} className="px-2 py-1 text-gray-400 hover:text-gray-700 text-sm">‹</button>
              <span className="text-xs font-light text-gray-600 min-w-[120px] text-center">{MONTH_NAMES[month]} {year}</span>
              <button onClick={() => setMonthOffset(o => o + 1)} className="px-2 py-1 text-gray-400 hover:text-gray-700 text-sm">›</button>
            </div>
          )}
          <div className="flex border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-light transition-colors ${viewMode === 'weekly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-light transition-colors ${viewMode === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Month
            </button>
          </div>
          <button onClick={logout} className="text-xs font-light text-gray-400 hover:text-gray-700 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <div className="overflow-auto">
          <div className="min-w-[720px]">
            {/* Day headers */}
            <div className="grid grid-cols-[72px_repeat(7,1fr)] sticky top-0 bg-white border-b border-gray-100 z-10">
              <div />
              {DAY_SHORT.map(d => (
                <div key={d} className="py-2.5 px-2 text-center border-l border-gray-50">
                  <p className="text-xs font-light text-gray-400 uppercase tracking-widest">{d}</p>
                </div>
              ))}
            </div>

            {/* Time slot rows */}
            {timeSlots.map(time => {
              const hasClass = DAYS.some(day => classes.some(c => c.day === day && c.time === time));
              if (!hasClass && !isAdmin) return null;

              return (
                <div key={time} className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-gray-50">
                  <div className="py-2 pr-3 flex items-start justify-end">
                    <span className="text-xs font-light text-gray-300 mt-1.5">{time}</span>
                  </div>
                  {DAYS.map(day => {
                    const dayClasses = classes.filter(c => c.day === day && c.time === time);
                    const isEmpty = dayClasses.length === 0;
                    return (
                      <div
                        key={day}
                        className={`px-1.5 py-1.5 border-l border-gray-50 min-h-[68px] space-y-1 relative group ${
                          isEmpty && isAdmin ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        onClick={() => isEmpty && isAdmin && setModal({ classData: null, prefillDay: day, prefillTime: time })}
                      >
                        {dayClasses.map(c => (
                          <ClassCard
                            key={c.id}
                            classData={c}
                            isBooked={isSignedUp(c.id)}
                            availableSpots={getAvailableSpots(c)}
                            onClick={() => setModal({ classData: c })}
                          />
                        ))}
                        {isEmpty && isAdmin && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            <span className="text-[10px] font-light text-gray-300">+ add</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {classes.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-light text-sm">
                {isAdmin ? 'Click any cell to add a class' : 'No classes scheduled'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <div className="p-6">
          <div className="grid grid-cols-7 mb-1">
            {DAY_SHORT.map(d => (
              <div key={d} className="text-center text-xs font-light text-gray-400 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t border-l border-gray-100">
            {calCells.map((dayNum, idx) => {
              const dayClasses = dayNum ? classes.filter(c => c.day === getDayName(dayNum)) : [];
              const isToday =
                dayNum !== null &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                dayNum === today.getDate();

              return (
                <div
                  key={idx}
                  className={`border-b border-r border-gray-100 min-h-[96px] p-1.5 ${!dayNum ? 'bg-gray-50/40' : ''}`}
                >
                  {dayNum && (
                    <>
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-light mb-1 ${
                          isToday ? 'bg-gray-900 text-white' : 'text-gray-500'
                        }`}
                      >
                        {dayNum}
                      </div>
                      <div className="space-y-0.5">
                        {dayClasses.slice(0, 3).map(c => (
                          <button
                            key={c.id}
                            onClick={() => setModal({ classData: c })}
                            className={`w-full text-left text-[10px] font-light px-1.5 py-0.5 rounded truncate transition-colors ${
                              isSignedUp(c.id)
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {c.time} {c.name}
                          </button>
                        ))}
                        {dayClasses.length > 3 && (
                          <p className="text-[10px] font-light text-gray-400 px-1.5">+{dayClasses.length - 3} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal !== null && (
        <ClassModal
          classData={modal.classData}
          prefillDay={modal.prefillDay}
          prefillTime={modal.prefillTime}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default ScheduleGrid;
