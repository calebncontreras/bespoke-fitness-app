import React, { useState, useEffect } from 'react';
import { AppStateProvider } from './state/AppState';
import { useAppState } from './state/AppState';
import Scheduler from './tools/Scheduler';
import ScheduleView from './tools/ScheduleView';
import Payments from './tools/Payments';

type Tool = 'scheduler' | 'schedule' | 'payments';

const NAV: { id: Tool; label: string }[] = [
  { id: 'scheduler', label: 'Scheduler' },
  { id: 'schedule', label: 'Schedule View' },
  { id: 'payments', label: 'Payments' },
];

const AppInner: React.FC = () => {
  const { currentUser } = useAppState();
  const [tool, setTool] = useState<Tool>('scheduler');

  useEffect(() => {
    if (!currentUser) setTool('scheduler');
  }, [currentUser]);

  const visibleNav = currentUser ? NAV : NAV.slice(0, 1);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 px-6 py-2.5 flex items-center gap-4">
        <span className="text-xs font-light tracking-widest text-gray-300 uppercase">Bespoke</span>
        <div className="flex gap-1">
          {visibleNav.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`px-3 py-1 text-xs rounded transition-colors ${tool === id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tool === 'scheduler' && <Scheduler />}
      {tool === 'schedule' && <ScheduleView />}
      {tool === 'payments' && <Payments />}
    </div>
  );
};

const App: React.FC = () => (
  <AppStateProvider>
    <AppInner />
  </AppStateProvider>
);

export default App;
