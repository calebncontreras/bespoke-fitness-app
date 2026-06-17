import React, { useState } from 'react';
import { useAppState } from '../../state/AppState';
import ClassCard from './ClassCard';
import ClassModal from './ClassModal';
import type { Class, PersonalSession } from '../../types';

type ViewMode = 'weekly' | 'monthly';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ROW_PX = 64;

function buildTimeSlots(classes: Class[]): string[] {
  const standard: string[] = [];
  for (let h = 6; h <= 21; h++) standard.push(`${String(h).padStart(2, '0')}:00`);
  const extra = classes.map(c => c.time).filter(t => !standard.includes(t));
  return [...new Set([...standard, ...extra])].sort();
}

function buildSlotTops(slots: string[]): Map<string, number> {
  const tops = new Map<string, number>();
  let top = 0;
  for (const slot of slots) { tops.set(slot, top); top += ROW_PX; }
  return tops;
}

// "8:00AM", "9:30AM"
function fmt12(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

// "9 AM", "9:30 AM"
function fmtSlotLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getWeekStart(): Date {
  const today = new Date();
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekSessionsByDay(sessions: PersonalSession[]): Map<string, PersonalSession[]> {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const result = new Map<string, PersonalSession[]>();
  sessions
    .filter(s => s.status === 'confirmed')
    .forEach(s => {
      const d = new Date(s.date + 'T12:00:00');
      if (d >= weekStart && d < weekEnd) {
        const dayName = DAYS[(d.getDay() + 6) % 7];
        if (!result.has(dayName)) result.set(dayName, []);
        result.get(dayName)!.push(s);
      }
    });
  return result;
}

function getSessionTopPx(sessionTime: string, slotTops: Map<string, number>, timeSlots: string[]): number {
  const [sh, sm] = sessionTime.split(':').map(Number);
  const sessionMin = sh * 60 + sm;
  let baseSlot = timeSlots[0];
  for (const slot of timeSlots) {
    const [slh, slm] = slot.split(':').map(Number);
    if (slh * 60 + slm <= sessionMin) baseSlot = slot;
    else break;
  }
  const [bh, bm] = baseSlot.split(':').map(Number);
  return (slotTops.get(baseSlot) ?? 0) + ((sessionMin - (bh * 60 + bm)) / 60) * ROW_PX;
}

interface ModalState {
  classData: Class | null;
  prefillDay?: string;
  prefillTime?: string;
}

const ScheduleGrid: React.FC = () => {
  const { classes, personalSessions, currentUser, isSignedUp, getAvailableSpots, logout } = useAppState();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const isAdmin = !!(currentUser && 'role' in currentUser);
  const timeSlots = buildTimeSlots(classes);
  const slotTops = buildSlotTops(timeSlots);
  const weekSessionsByDay = getWeekSessionsByDay(personalSessions);

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
            {isAdmin ? 'Trainer — click any empty slot to add a class' : `Welcome, ${currentUser?.name}`}
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
            <button onClick={() => setViewMode('weekly')} className={`px-3 py-1.5 text-xs font-light transition-colors ${viewMode === 'weekly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}>Week</button>
            <button onClick={() => setViewMode('monthly')} className={`px-3 py-1.5 text-xs font-light transition-colors ${viewMode === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}>Month</button>
          </div>
          <button onClick={logout} className="text-xs font-light text-gray-400 hover:text-gray-700 transition-colors">Sign out</button>
        </div>
      </div>

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <div className="overflow-auto">
          <div className="min-w-[720px]">
            {/* Sticky day headers */}
            <div className="grid grid-cols-[72px_repeat(7,1fr)] sticky top-0 bg-white border-b border-gray-100 z-10">
              <div />
              {DAY_SHORT.map(d => (
                <div key={d} className="py-2.5 px-2 text-center border-l border-gray-50">
                  <p className="text-xs font-light text-gray-400 uppercase tracking-widest">{d}</p>
                </div>
              ))}
            </div>

            {/* Time rows + unified session overlay */}
            <div className="relative">
              {timeSlots.map(time => {
                const hasClass = DAYS.some(day => classes.some(c => c.day === day && c.time === time));
                const [th, tm] = time.split(':').map(Number);
                const slotStart = th * 60 + tm;
                const slotEnd = slotStart + 60;
                const hasSession = DAYS.some(day =>
                  (weekSessionsByDay.get(day) ?? []).some(s => {
                    const [sh, sm] = s.time.split(':').map(Number);
                    const start = sh * 60 + sm;
                    return start < slotEnd && start + s.duration > slotStart;
                  })
                );
                if (!hasClass && !hasSession && !isAdmin) return null;

                return (
                  <div key={time} className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-gray-50">
                    <div className="py-2 pr-3 flex items-start justify-end">
                      <span className="text-xs font-light text-gray-300 mt-1.5">{fmtSlotLabel(time)}</span>
                    </div>
                    {DAYS.map(day => {
                      const dayClasses = classes.filter(c => c.day === day && c.time === time);
                      const isEmpty = dayClasses.length === 0;
                      return (
                        <div
                          key={day}
                          className={`px-1.5 py-1.5 border-l border-gray-50 group ${isEmpty && isAdmin ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          style={{ minHeight: `${ROW_PX}px` }}
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
                            <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                              <span className="text-[10px] font-light text-gray-300">+ add</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Session overlay — one unified block per session, no row splitting */}
              {DAYS.map((day, dayIdx) =>
                (weekSessionsByDay.get(day) ?? []).map(s => {
                  const [sh, sm] = s.time.split(':').map(Number);
                  const startMin = sh * 60 + sm;
                  const topPx = getSessionTopPx(s.time, slotTops, timeSlots);
                  const heightPx = (s.duration / 60) * ROW_PX;
                  const label = `${fmt12(startMin)} – ${fmt12(startMin + s.duration)}`;
                  return (
                    <div
                      key={s.id}
                      className="absolute bg-gray-100 border border-dashed border-gray-300 flex items-center px-1.5 select-none pointer-events-none overflow-hidden z-10"
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        left: `calc(72px + ${dayIdx} * (100% - 72px) / 7 + 4px)`,
                        width: `calc((100% - 72px) / 7 - 8px)`,
                      }}
                    >
                      <span className="text-[10px] font-light text-gray-400 truncate">1-on-1 · {label}</span>
                    </div>
                  );
                })
              )}

              {classes.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-light text-sm">
                  {isAdmin ? 'Click any cell to add a class' : 'No classes scheduled'}
                </div>
              )}
            </div>
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
              const dateStr = dayNum
                ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                : '';
              const daySessions = dateStr
                ? personalSessions.filter(s => s.status === 'confirmed' && s.date === dateStr)
                : [];
              const isToday =
                dayNum !== null &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                dayNum === today.getDate();

              return (
                <div key={idx} className={`border-b border-r border-gray-100 min-h-[96px] p-1.5 ${!dayNum ? 'bg-gray-50/40' : ''}`}>
                  {dayNum && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-light mb-1 ${isToday ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
                        {dayNum}
                      </div>
                      <div className="space-y-0.5">
                        {dayClasses.slice(0, 3).map(c => (
                          <button
                            key={c.id}
                            onClick={() => setModal({ classData: c })}
                            className={`w-full text-left text-[10px] font-light px-1.5 py-0.5 rounded truncate transition-colors ${
                              isSignedUp(c.id) ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {fmtSlotLabel(c.time)} {c.name}
                          </button>
                        ))}
                        {dayClasses.length > 3 && (
                          <p className="text-[10px] font-light text-gray-400 px-1.5">+{dayClasses.length - 3} more</p>
                        )}
                        {daySessions.map(s => {
                          const [sh, sm] = s.time.split(':').map(Number);
                          const startMin = sh * 60 + sm;
                          return (
                            <div key={s.id} className="w-full text-[10px] font-light px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 border border-dashed border-gray-300 select-none truncate">
                              1-on-1 · {fmt12(startMin)}–{fmt12(startMin + s.duration)}
                            </div>
                          );
                        })}
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
