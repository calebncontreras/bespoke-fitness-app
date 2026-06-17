import React from 'react';
import { useAppState } from '../state/AppState';
import Login from '../components/scheduler/Login';
import Signup from '../components/scheduler/Signup';
import Booking from '../components/scheduler/Booking';
import Payment from '../components/scheduler/Payment';
import TrainerDashboard from '../components/scheduler/Admin/AdminDashboard';

const Scheduler: React.FC = () => {
  const { view } = useAppState();
  if (view === 'login') return <Login />;
  if (view === 'signup') return <Signup />;
  if (view === 'payment') return <Payment />;
  if (view === 'booking') return <Booking />;
  if (view === 'trainerDashboard') return <TrainerDashboard />;
  return null;
};

export default Scheduler;
