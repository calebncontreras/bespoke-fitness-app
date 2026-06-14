import React from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '../../../state/AppState';

const AdminMembershipTypes: React.FC = () => {
  const { membershipTypes, newMembershipType, setNewMembershipType, handleAddMembershipType } = useAppState();

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 border border-gray-200">
        <h3 className="text-lg font-light text-gray-900 mb-4">Create New Membership Type</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Name (e.g. 5x/Week)" value={newMembershipType.name} onChange={e => setNewMembershipType({ ...newMembershipType, name: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="number" placeholder="Price per month ($)" value={newMembershipType.price} onChange={e => setNewMembershipType({ ...newMembershipType, price: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="number" placeholder="Classes per week" value={newMembershipType.classesPerWeek} onChange={e => setNewMembershipType({ ...newMembershipType, classesPerWeek: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="number" placeholder="Duration days (optional)" value={newMembershipType.durationDays} onChange={e => setNewMembershipType({ ...newMembershipType, durationDays: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
        </div>
        <button onClick={handleAddMembershipType} className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition flex items-center gap-2">
          <Plus size={18} /> Create Membership Type
        </button>
      </div>
      <div>
        <h3 className="text-lg font-light text-gray-900 mb-4">All Membership Types</h3>
        <div className="space-y-3">
          {membershipTypes.map(type => (
            <div key={type.id} className="p-4 border border-gray-200">
              <div className="font-light text-gray-900">{type.name}</div>
              <div className="text-sm text-gray-600 font-light">
                {type.price === 0 ? 'Free' : `$${type.price}/month`} • {type.classesPerWeek === 999 ? 'Unlimited' : type.classesPerWeek} classes/week
                {type.durationDays ? ` • ${type.durationDays} day access` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMembershipTypes;
