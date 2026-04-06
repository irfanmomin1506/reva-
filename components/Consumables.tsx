
import React, { useState } from 'react';
import { useData } from '../services/DataContext';
import { Consumable, ConsumableTransaction } from '../types';
import { Plus, Minus, AlertTriangle, Droplet } from 'lucide-react';

export const Consumables: React.FC = () => {
  const { consumables, consumableTransactions, addConsumableTransaction } = useData();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedConsumable, setSelectedConsumable] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'ISSUE' | 'REFILL'>('ISSUE');

  const getLowStockCount = () => consumables.filter(c => c.currentStock <= c.minThreshold).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Consumables Inventory</h2>
           <p className="text-gray-500 text-sm">Track chemicals, glassware, and lab supplies.</p>
        </div>
        {getLowStockCount() > 0 && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg flex items-center shadow-sm border border-red-100">
            <AlertTriangle size={18} className="mr-2" />
            <span className="font-medium">{getLowStockCount()} items are running low!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consumables List */}
        <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consumables.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-2 h-full ${item.currentStock <= item.minThreshold ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div className="flex justify-between items-start mb-2">
                             <div className="p-2 bg-blue-50 text-reva-navy rounded-lg">
                                <Droplet size={20} />
                             </div>
                             <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {item.unit}
                             </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className="text-xs text-gray-500">Available Stock</p>
                                <p className={`text-2xl font-bold ${item.currentStock <= item.minThreshold ? 'text-red-600' : 'text-gray-800'}`}>
                                    {item.currentStock}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        setSelectedConsumable(item.id);
                                        setTransactionType('REFILL');
                                        setShowTransactionModal(true);
                                    }}
                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" title="Refill">
                                    <Plus size={18} />
                                </button>
                                <button 
                                     onClick={() => {
                                        setSelectedConsumable(item.id);
                                        setTransactionType('ISSUE');
                                        setShowTransactionModal(true);
                                    }}
                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Issue/Use">
                                    <Minus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs flex justify-between text-gray-500">
                             <span>Threshold: {item.minThreshold}</span>
                             <span>Last Refill: {item.lastRefillDate}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
             <div className="p-4 border-b border-gray-100">
                 <h3 className="font-bold text-gray-800">Recent Transactions</h3>
             </div>
             <div className="overflow-y-auto flex-1 p-4 space-y-3">
                 {consumableTransactions.length === 0 && <p className="text-gray-400 text-center text-sm">No transactions yet.</p>}
                 {consumableTransactions.map(t => (
                     <div key={t.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                         <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 mr-3 ${t.type === 'REFILL' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                         <div>
                             <p className="text-sm font-medium text-gray-800">
                                 {t.type === 'REFILL' ? 'Refilled' : 'Issued'} <span className="font-bold">{t.quantity}</span> {t.consumableName}
                             </p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{t.date}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{t.performedBy}</span>
                             </div>
                             {t.notes && <p className="text-xs text-gray-500 italic mt-1">"{t.notes}"</p>}
                         </div>
                     </div>
                 ))}
             </div>
        </div>
      </div>

      {showTransactionModal && (
          <TransactionModal 
            type={transactionType}
            consumableId={selectedConsumable}
            consumables={consumables}
            onClose={() => setShowTransactionModal(false)}
            onConfirm={addConsumableTransaction}
          />
      )}
    </div>
  );
};

const TransactionModal: React.FC<{
    type: 'ISSUE' | 'REFILL';
    consumableId: string;
    consumables: Consumable[];
    onClose: () => void;
    onConfirm: (t: ConsumableTransaction) => void;
}> = ({ type, consumableId, consumables, onClose, onConfirm }) => {
    const item = consumables.find(c => c.id === consumableId);
    const [qty, setQty] = useState(0);
    const [notes, setNotes] = useState('');
    const [performedBy, setPerformedBy] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;
        
        const transaction: ConsumableTransaction = {
            id: `CT${Date.now()}`,
            consumableId: item.id,
            consumableName: item.name,
            type,
            quantity: Number(qty),
            date: new Date().toISOString().split('T')[0],
            performedBy,
            notes
        };
        onConfirm(transaction);
        onClose();
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                 <h3 className="text-xl font-bold text-gray-800 mb-2">{type === 'REFILL' ? 'Restock' : 'Issue'} {item.name}</h3>
                 <p className="text-sm text-gray-500 mb-6">Current Stock: {item.currentStock} {item.unit}</p>
                 
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({item.unit})</label>
                        <input type="number" step="0.1" min="0.1" required autoFocus
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-reva-navy outline-none"
                            onChange={e => setQty(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
                        <input type="text" required placeholder="Faculty/Staff Name"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-reva-navy outline-none"
                            onChange={e => setPerformedBy(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Purpose</label>
                        <input type="text" placeholder="Optional"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-reva-navy outline-none"
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className={`px-4 py-2 text-white rounded-lg ${type === 'REFILL' ? 'bg-green-600 hover:bg-green-700' : 'bg-reva-orange hover:bg-orange-600'}`}>
                            Confirm {type === 'REFILL' ? 'Restock' : 'Issue'}
                        </button>
                    </div>
                 </form>
             </div>
        </div>
    );
};
