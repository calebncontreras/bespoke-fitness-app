import React from 'react';
import { LogOut } from 'lucide-react';
import { useAppState } from '../../../state/AppState';
import AdminClasses from './AdminClasses';
import AdminMembers from './AdminMembers';
import AdminMembershipTypes from './AdminMembershipTypes';

const AdminDashboard: React.FC = () => {
  const { members, classes, adminTab, setAdminTab, isMembershipValid, logout } = useAppState();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center px-6 py-8 border-b border-gray-200">
          <h1 className="text-3xl font-light text-gray-900">Admin Dashboard</h1>
          <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-light">
            <LogOut size={18} /> Logout
          </button>
        </div>
        <div className="flex border-b border-gray-200">
          {['dashboard', 'classes', 'members', 'membership-types'].map(tab => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`px-6 py-4 font-light text-sm border-b-2 transition ${adminTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              {tab === 'membership-types' ? 'Membership Types' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="p-6">
          {adminTab === 'dashboard' && (
            <div className="grid grid-cols-3 gap-6">
              {[
                ['Total Classes', classes.length],
                ['Total Members', members.length],
                ['Overdue Memberships', members.filter(m => !isMembershipValid(m.id)).length],
              ].map(([label, val]) => (
                <div key={label} className="p-6 bg-gray-50 border border-gray-200">
                  <div className="text-sm text-gray-600 font-light mb-2">{label}</div>
                  <div className="text-3xl font-light text-gray-900">{val}</div>
                </div>
              ))}
            </div>
          )}
          {adminTab === 'classes' && <AdminClasses />}
          {adminTab === 'members' && <AdminMembers />}
          {adminTab === 'membership-types' && <AdminMembershipTypes />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
