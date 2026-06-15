import React from 'react';
import { useAppState } from '../state/AppState';
import Login from '../components/scheduler/Login';
import ScheduleGrid from '../components/schedule/ScheduleGrid';

const ScheduleView: React.FC = () => {
  const { currentUser } = useAppState();
  if (!currentUser) return <Login />;
  return <ScheduleGrid />;
};

export default ScheduleView;
