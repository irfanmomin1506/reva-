
import React, { useState } from 'react';
import { useData } from '../services/DataContext';
import { IssueRecord, RequestStatus, Asset } from '../types';
import { Check, X, Search, RotateCcw, Package, AlertCircle } from 'lucide-react';

export const Operations: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { 
    assets, issueLog, issueItem, returnItem, 
    studentRequests, processStudentRequest 
  } = useData();
  
  const [returnModalId, setReturnModalId] = useState<string | null>(null);

  // Student Requests Tab Logic
  if (activeTab === 'students') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Incoming Requests</h2>
                <p className="text-sm text-gray-500">Review and approve equipment requests from students.</p>
            </div>
            <div className="bg-reva-navy text-white px-4 py-1.5 rounded-full text-xs font-bold">
                {studentRequests.filter(r => r.status === 'Pending').length} PENDING
            </div>
        </div>

        <div className="grid gap-6">
          {studentRequests.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-100">
                  <Package className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-gray-400 font-medium">No student requests at this moment.</p>
              </div>
          )}
          
          {studentRequests.map(req => {
            const asset = assets.find(a => a.id === req.assetId);
            const isStockLow = asset ? asset.quantityAvailable < req.quantity : false;

            return (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Asset Image Preview */}
                  <div className="w-full md:w-48 h-48 bg-gray-50 flex-shrink-0 relative">
                    {asset?.image ? (
                        <img src={asset.image} alt={req.assetName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           <Package size={40} />
                        </div>
                    )}
                    <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {req.status}
                        </span>
                    </div>
                  </div>

                  {/* Request Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-800">{req.assetName}</h3>
                                <span className="text-xs text-gray-400 font-mono">ID: {req.assetId}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-600 font-medium">Requested by: <span className="text-reva-navy font-bold">{req.studentName}</span> ({req.usn})</p>
                                <p className="text-sm text-gray-500 italic leading-relaxed">"Purpose: {req.purpose}"</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl min-w-[140px] border border-gray-100">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Request Info</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Qty:</span>
                                    <span className="font-bold text-gray-800">{req.quantity}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Return:</span>
                                    <span className="font-bold text-reva-orange">{req.expectedReturnDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center text-xs text-gray-400">
                           Requested on: {req.requestDate}
                        </div>
                        
                        {req.status === 'Pending' && (
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => processStudentRequest(req.id, RequestStatus.REJECTED)}
                                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                                >
                                    <X size={16} className="mr-2" /> Reject
                                </button>
                                <button 
                                    disabled={isStockLow}
                                    onClick={() => processStudentRequest(req.id, RequestStatus.APPROVED)}
                                    className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${
                                        isStockLow ? 'bg-gray-300 cursor-not-allowed' : 'bg-reva-navy hover:bg-blue-900 active:scale-95'
                                    }`}
                                >
                                    <Check size={16} className="mr-2" /> 
                                    {isStockLow ? 'Insufficient Stock' : 'Approve & Issue'}
                                </button>
                            </div>
                        )}
                        
                        {isStockLow && req.status === 'Pending' && (
                             <div className="flex items-center text-red-500 text-[10px] font-bold bg-red-50 px-2 py-1 rounded">
                                 <AlertCircle size={12} className="mr-1" /> CURRENTLY OUT OF STOCK
                             </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Issue & Return Tab Logic (unchanged for brevity, but integrated)
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-reva-navy mb-4 flex items-center gap-2">
            <Package size={20} className="text-reva-orange" /> Direct Component Issue
        </h3>
        <IssueForm assets={assets} onIssue={issueItem} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Active Lab Issues</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
                <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Equipment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {issueLog.filter(i => i.status !== RequestStatus.RETURNED).map(item => {
                    const asset = assets.find(a => a.id === item.assetId);
                    return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-800">{item.studentName}</div>
                                <div className="text-[10px] text-gray-400 font-mono uppercase">{item.usn}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden border border-gray-100">
                                        {asset?.image && <img src={asset.image} className="w-full h-full object-cover" />}
                                    </div>
                                    <span className="font-medium text-gray-700">{item.assetName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-orange-50 text-reva-orange px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">ON LOAN</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">{item.expectedReturnDate}</td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setReturnModalId(item.id)}
                                    className="inline-flex items-center text-xs font-bold text-reva-navy hover:text-reva-orange transition-colors"
                                >
                                    <RotateCcw size={14} className="mr-1" /> Mark Returned
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
      </div>

      {returnModalId && (
        <ReturnModal 
          id={returnModalId} 
          onClose={() => setReturnModalId(null)} 
          onConfirm={returnItem} 
        />
      )}
    </div>
  );
};

const IssueForm: React.FC<{ assets: Asset[], onIssue: (r: IssueRecord) => void }> = ({ assets, onIssue }) => {
  const [formData, setFormData] = useState<Partial<IssueRecord>>({
    studentName: '', usn: '', assetId: '', issueDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAsset = assets.find(a => a.id === formData.assetId);
    if (!selectedAsset) return;

    onIssue({
      ...formData,
      id: `I-MAN-${Date.now()}`,
      assetName: selectedAsset.name,
      status: RequestStatus.PENDING
    } as IssueRecord);
    
    setFormData({...formData, studentName: '', usn: '', assetId: ''});
    alert("Equipment issued successfully.");
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Student Name</label>
          <input required placeholder="Name" className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-reva-navy"
            value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
      </div>
      <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">USN Number</label>
          <input required placeholder="R21XXXXX" className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-reva-navy uppercase font-mono"
            value={formData.usn} onChange={e => setFormData({...formData, usn: e.target.value})} />
      </div>
      <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Equipment</label>
          <select required className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-reva-navy bg-white"
            value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
            <option value="">Choose item...</option>
            {assets.filter(a => a.quantityAvailable > 0 && a.condition === 'Working').map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.quantityAvailable} avail.)</option>
            ))}
          </select>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Return Due</label>
             <input required type="date" className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-reva-navy"
                onChange={e => setFormData({...formData, expectedReturnDate: e.target.value})} />
        </div>
        <button type="submit" className="bg-reva-orange text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 shadow-md h-[42px] transition-all active:scale-95">Issue</button>
      </div>
    </form>
  );
};

const ReturnModal: React.FC<{ id: string, onClose: () => void, onConfirm: (id: string, cond: string, date: string) => void }> = ({ id, onClose, onConfirm }) => {
  const [condition, setCondition] = useState('Working');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95">
        <h3 className="text-xl font-bold mb-2 text-gray-800">Complete Return</h3>
        <p className="text-sm text-gray-500 mb-6">Inspect the component and confirm its condition below.</p>
        
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Physical Condition</label>
        <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
                type="button"
                onClick={() => setCondition('Working')}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${condition === 'Working' ? 'border-reva-navy bg-blue-50 text-reva-navy' : 'border-gray-100 text-gray-400'}`}
            >
                Working (OK)
            </button>
            <button 
                type="button"
                onClick={() => setCondition('Damaged')}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${condition === 'Damaged' ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-100 text-gray-400'}`}
            >
                Damaged
            </button>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => {
            onConfirm(id, condition, new Date().toISOString().split('T')[0]);
            onClose();
          }} className="w-full py-3 bg-reva-navy text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-colors">
            Confirm & Update Stock
          </button>
          <button onClick={onClose} className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
