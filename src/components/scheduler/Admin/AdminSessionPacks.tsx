import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppState } from '../../../state/AppState';

const DURATION_OPTIONS = ['30', '60', '90', 'custom'] as const;

const AdminSessionPacks: React.FC = () => {
  const { sessionPacks, newSessionPack, setNewSessionPack, handleAddSessionPack, handleDeleteSessionPack } = useAppState();

  const sessions = parseInt(newSessionPack.credits) || 0;
  const perSession = parseFloat(newSessionPack.pricePerSession) || 0;
  const subtotal = sessions * perSession;
  const taxRate = newSessionPack.addSalesTax ? (parseFloat(newSessionPack.salesTax) || 0) : 0;
  const total = subtotal * (1 + taxRate / 100);

  const durationLabel = (mins?: number) => mins ? `${mins} min` : '—';

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 border border-gray-200">
        <h3 className="text-lg font-light text-gray-900 mb-4">Create New Session Pack</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Name</label>
            <input type="text" placeholder="e.g. 10-Session Pack" value={newSessionPack.name} onChange={e => setNewSessionPack({ ...newSessionPack, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Number of sessions</label>
            <input type="number" min="1" placeholder="10" value={newSessionPack.credits} onChange={e => setNewSessionPack({ ...newSessionPack, credits: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Price per session ($)</label>
            <input type="number" min="0" step="0.01" placeholder="25.00" value={newSessionPack.pricePerSession} onChange={e => setNewSessionPack({ ...newSessionPack, pricePerSession: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Session duration</label>
            <div className="flex gap-2">
              <select value={newSessionPack.sessionDuration} onChange={e => setNewSessionPack({ ...newSessionPack, sessionDuration: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light">
                {DURATION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d === 'custom' ? 'Custom' : `${d} min`}</option>
                ))}
              </select>
              {newSessionPack.sessionDuration === 'custom' && (
                <input type="number" min="1" placeholder="min" value={newSessionPack.customDuration} onChange={e => setNewSessionPack({ ...newSessionPack, customDuration: e.target.value })} className="w-24 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-light text-gray-600 cursor-pointer">
            <input type="checkbox" checked={newSessionPack.addSalesTax} onChange={e => setNewSessionPack({ ...newSessionPack, addSalesTax: e.target.checked })} className="w-4 h-4" />
            Add sales tax
          </label>
          {newSessionPack.addSalesTax && (
            <div className="mt-3 max-w-xs">
              <label className="block text-xs font-light text-gray-400 mb-1.5 uppercase tracking-wide">Sales tax (%)</label>
              <input type="number" min="0" step="0.01" placeholder="8.25" value={newSessionPack.salesTax} onChange={e => setNewSessionPack({ ...newSessionPack, salesTax: e.target.value })} className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 font-light" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 mb-4">
          <div className="text-sm font-light text-gray-600">
            Session Pack Price
            <div className="text-xs text-gray-400">
              {sessions} × ${perSession.toFixed(2)}
              {newSessionPack.addSalesTax ? ` + ${taxRate}% tax` : ''}
            </div>
          </div>
          <div className="text-2xl font-light text-gray-900">${total.toFixed(2)}</div>
        </div>

        <button
          onClick={handleAddSessionPack}
          disabled={!newSessionPack.name || sessions <= 0 || perSession <= 0}
          className="px-6 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 disabled:bg-gray-300 transition flex items-center gap-2"
        >
          <Plus size={18} /> Create Session Pack
        </button>
      </div>

      <div>
        <h3 className="text-lg font-light text-gray-900 mb-4">All Session Packs</h3>
        {sessionPacks.length === 0 ? (
          <p className="text-sm text-gray-400 font-light">No session packs yet.</p>
        ) : (
          <div className="space-y-3">
            {sessionPacks.map(pack => (
              <div key={pack.id} className="p-4 border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="font-light text-gray-900">{pack.name}</div>
                  <div className="text-sm text-gray-600 font-light">
                    {pack.credits} sessions · {durationLabel(pack.sessionDuration)}
                    {pack.pricePerSession != null ? ` · $${pack.pricePerSession.toFixed(2)}/session` : ''}
                    {pack.salesTax != null ? ` · ${pack.salesTax}% tax` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-light text-gray-900">${pack.price.toFixed(2)}</div>
                  <button
                    onClick={() => handleDeleteSessionPack(pack.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    aria-label="Delete pack"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSessionPacks;
