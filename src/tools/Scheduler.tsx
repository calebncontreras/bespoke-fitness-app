import React from 'react';
import { AppStateProvider, useAppState } from '../state/AppState';
import Login from '../components/scheduler/Login';
import Signup from '../components/scheduler/Signup';
import Booking from '../components/scheduler/Booking';
import Payment from '../components/scheduler/Payment';
import AdminDashboard from '../components/scheduler/Admin/AdminDashboard';

const SchedulerRouter: React.FC = () => {
  const { view } = useAppState();
  if (view === 'login') return <Login />;
  if (view === 'signup') return <Signup />;
  if (view === 'payment') return <Payment />;
  if (view === 'booking') return <Booking />;
  if (view === 'adminDashboard') return <AdminDashboard />;
  return null;
};

const Scheduler: React.FC = () => (
  <AppStateProvider>
    <SchedulerRouter />
  </AppStateProvider>
);

export default Scheduler;
