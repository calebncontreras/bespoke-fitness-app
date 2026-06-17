import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppState } from '../../../state/AppState';

const AdminTrainers: React.FC = () => {
  const { trainers, handleAddTrainer, handleDeleteTrainer } = useAppState();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const onAdd = () => {
    handleAddTrainer(name, specialty);
    setName('');
    setSpecialty('');
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 p-6">
        <h3 className="text-sm font-light text-gray-600 uppercase tracking-widest mb-4">Add Trainer</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
          <input
            placeholder="Specialty"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm font-light focus:outline-none focus:border-gray-400"
          />
        </div>
        <button
          onClick={onAdd}
          disabled={!name.trim()}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Add Trainer
        </button>
      </div>

      <div className="space-y-3">
        {trainers.length === 0 && (
          <p className="text-gray-500 font-light text-sm">No trainers added yet.</p>
        )}
        {trainers.map(t => (
          <div key={t.id} className="border border-gray-200 p-4 flex justify-between items-center">
            <div>
              <div className="font-light text-gray-900">{t.name}</div>
              <div className="text-sm text-gray-500 font-light">{t.specialty || '—'}</div>
            </div>
            <button
              onClick={() => handleDeleteTrainer(t.id)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTrainers;
