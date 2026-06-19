import React, { useState, useEffect } from 'react';
import { AppStateProvider } from './state/AppState';
import { useAppState } from './state/AppState';
import Scheduler from './tools/Scheduler';
import ScheduleView from './tools/ScheduleView';
import Payments from './tools/Payments';
import FeedSidebar from './components/feed/FeedSidebar';

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

  const isMemberUser = !!currentUser && !('role' in currentUser);

  const content = (
    <>
      {tool === 'scheduler' && <Scheduler />}
      {tool === 'schedule' && <ScheduleView />}
      {tool === 'payments' && <Payments />}
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="border-b border-gray-100 px-6 py-2.5 flex items-center gap-4 shrink-0">
        <span className="text-xs font-light tracking-widest text-gray-300 uppercase">Bespoke</span>
        {currentUser && (
          <div className="flex gap-1">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTool(id)}
                className={`px-3 py-1 text-xs rounded transition-colors ${tool === id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isMemberUser ? (
        <div className="flex flex-1 min-h-0">
          <aside className="w-64 border-r border-gray-100 shrink-0 overflow-y-auto">
            <FeedSidebar />
          </aside>
          <div className="flex-1 overflow-y-auto">
            {content}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {content}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AppStateProvider>
    <AppInner />
  </AppStateProvider>
);

export default App;
