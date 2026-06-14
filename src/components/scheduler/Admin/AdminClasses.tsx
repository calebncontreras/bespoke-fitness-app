import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppState } from '../../../state/AppState';

const AdminClasses: React.FC = () => {
  const { classes, newClass, setNewClass, handleAddClass, handleDeleteClass, days } = useAppState();

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 border border-gray-200">
        <h3 className="text-lg font-light text-gray-900 mb-4">Add New Class</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Class Name" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <select value={newClass.day} onChange={e => setNewClass({ ...newClass, day: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
            <option value="">Select Day</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={newClass.time} onChange={e => setNewClass({ ...newClass, time: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="text" placeholder="Instructor" value={newClass.instructor} onChange={e => setNewClass({ ...newClass, instructor: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          <input type="text" placeholder="Location" value={newClass.location} onChange={e => setNewClass({ ...newClass, location: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light col-span-2" />
          <input type="number" placeholder="Capacity" value={newClass.capacity} onChange={e => setNewClass({ ...newClass, capacity: e.target.value })} className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
        </div>
        <button onClick={handleAddClass} className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition flex items-center gap-2">
          <Plus size={18} /> Add Class
        </button>
      </div>
      <div>
        <h3 className="text-lg font-light text-gray-900 mb-4">Recurring Classes</h3>
        <div className="space-y-3">
          {classes.map(c => (
            <div key={c.id} className="p-4 border border-gray-200 flex justify-between items-start">
              <div>
                <div className="font-light text-gray-900">{c.name}</div>
                <div className="text-sm text-gray-600 font-light">{c.day} at {c.time} • {c.instructor} • {c.location}</div>
                <div className="text-sm text-gray-500 font-light">{c.signups.length} / {c.capacity} enrolled</div>
              </div>
              <button onClick={() => handleDeleteClass(c.id)} className="text-gray-400 hover:text-gray-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminClasses;
