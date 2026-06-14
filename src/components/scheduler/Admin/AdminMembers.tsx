import React from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '../../../state/AppState';

const AdminMembers: React.FC = () => {
  const {
    members, membershipTypes, newMember, setNewMember, editingMember, setEditingMember,
    isMembershipValid, handleAddMember, handleEditMember, handleSaveMember, handleAddCredit,
  } = useAppState();

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 border border-gray-200">
        <h3 className="text-lg font-light text-gray-900 mb-4">Add New Member</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="email" placeholder="Email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="date" value={newMember.membershipExpiry} onChange={e => setNewMember({ ...newMember, membershipExpiry: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <select value={newMember.membershipType} onChange={e => setNewMember({ ...newMember, membershipType: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
            {membershipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="number" placeholder="Class Credits" value={newMember.classCredits} onChange={e => setNewMember({ ...newMember, classCredits: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
        </div>
        <button onClick={handleAddMember} className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition flex items-center gap-2">
          <Plus size={18} /> Add Member
        </button>
      </div>
      <div>
        <h3 className="text-lg font-light text-gray-900 mb-4">Members</h3>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-light text-gray-900">{m.name}</div>
                  <div className="text-sm text-gray-600 font-light">{m.email}</div>
                </div>
                <div className="text-sm text-right">
                  <div className={`font-light ${isMembershipValid(m.id) ? 'text-green-600' : 'text-red-600'}`}>{isMembershipValid(m.id) ? 'Active' : 'Overdue'}</div>
                  <div className="text-gray-500 font-light">{m.membershipExpiry}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 font-light">{m.membershipType} • {m.classCredits} credit(s)</div>
                <div className="flex gap-2">
                  <button onClick={() => handleAddCredit(m.id)} className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-50 font-light">+ Credit</button>
                  <button onClick={() => handleEditMember(m)} className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-50 font-light">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-light text-gray-900 mb-4">Edit Member</h3>
            <div className="space-y-4 mb-6">
              <input type="text" value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <input type="email" value={editingMember.email} onChange={e => setEditingMember({ ...editingMember, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <input type="date" value={editingMember.membershipExpiry} onChange={e => setEditingMember({ ...editingMember, membershipExpiry: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              <select value={editingMember.membershipType} onChange={e => setEditingMember({ ...editingMember, membershipType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
                {membershipTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingMember(null)} className="flex-1 px-4 py-2 border border-gray-300 font-light hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveMember} className="flex-1 px-4 py-2 bg-gray-900 text-white font-light hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
