import React from 'react';
import { useAppState } from '../state/AppState';
import Login from '../components/scheduler/Login';
import Booking from '../components/scheduler/Booking';
import MemberOnboarding from '../components/scheduler/MemberOnboarding';
import AwaitingApproval from '../components/scheduler/AwaitingApproval';
import PaymentRequired from '../components/scheduler/PaymentRequired';
import TrainerDashboard from '../components/scheduler/Admin/AdminDashboard';

const Scheduler: React.FC = () => {
  const { view, authLoading } = useAppState();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs font-light text-gray-300">Loading...</p>
      </div>
    );
  }

  if (view === 'login') return <Login />;
  if (view === 'onboarding') return <MemberOnboarding />;
  if (view === 'awaitingApproval') return <AwaitingApproval />;
  if (view === 'paymentRequired') return <PaymentRequired />;
  if (view === 'booking') return <Booking />;
  if (view === 'trainerDashboard') return <TrainerDashboard />;
  return null;
};

export default Scheduler;
