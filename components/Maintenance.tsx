
import React, { useState } from 'react';
import { useData } from '../services/DataContext';
import { MaintenanceRecord, AssetStatus, MaintenanceType } from '../types';
import { Wrench, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export const Maintenance: React.FC = () => {
  const { maintenanceLog, assets, reportMaintenance, completeMaintenance } = useData();
  const [showReportModal, setShowReportModal] = useState(false);
  const [completeModalId, setCompleteModalId] = useState<string | null>(null);

  const pending = maintenanceLog.filter(m => m.status === 'Pending');
  const completed = maintenanceLog.filter(m => m.status === 'Completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Log</h2>
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-reva-navy text-white px-4 py-2 rounded-lg hover:bg-blue-900 flex items-center"
        >
          <Wrench size={18} className="mr-2" /> Report Issue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Maintenance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
             <h3 className="font-bold text-yellow-800 flex items-center">
               <Clock size={18} className="mr-2" /> Pending ({pending.length})
             </h3>
          </div>
          <div className="divide-y divide-gray-100">
             {pending.length === 0 && <div className="p-6 text-center text-gray-500">No equipment currently under maintenance.</div>}
             {pending.map(record => (
               <div key={record.id} className="p-4 hover:bg-gray-50">
                 <div className="flex justify-between items-start">
                   <div>
                     <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        {record.assetName}
                        {record.type === MaintenanceType.PREVENTIVE && (
                             <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 flex items-center">
                                 <ShieldCheck size={10} className="mr-1"/> Prevention
                             </span>
                        )}
                     </h4>
                     <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Issue:</span> {record.issueReported}</p>
                     <p className="text-xs text-gray-500 mt-2">Reported on: {record.dateReported} | Vendor: {record.vendorName}</p>
                   </div>
                   <button 
                     onClick={() => setCompleteModalId(record.id)}
                     className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 border border-green-200"
                   >
                     Mark Repaired
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
             <h3 className="font-bold text-gray-700 flex items-center">
               <CheckCircle size={18} className="mr-2" /> Repair History
             </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
             {completed.length === 0 && <div className="p-6 text-center text-gray-500">No repair history available.</div>}
             {completed.map(record => (
               <div key={record.id} className="p-4 hover:bg-gray-50">
                 <div className="flex justify-between">
                    <div>
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                             {record.assetName}
                             {record.type === MaintenanceType.PREVENTIVE && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">Prev.</span>
                             )}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{record.issueReported}</p>
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-gray-700">₹{record.cost}</span>
                        <span className="text-xs text-gray-400">{record.repairDate}</span>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportModal 
          assets={assets.filter(a => a.condition !== AssetStatus.DAMAGED)} 
          onClose={() => setShowReportModal(false)}
          onSubmit={reportMaintenance}
        />
      )}

      {completeModalId && (
        <CompleteModal 
          id={completeModalId} 
          onClose={() => setCompleteModalId(null)}
          onSubmit={completeMaintenance}
        />
      )}
    </div>
  );
};

const ReportModal: React.FC<{ assets: any[], onClose: () => void, onSubmit: (r: MaintenanceRecord) => void }> = ({ assets, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    assetId: '', issueReported: '', vendorName: '', dateReported: new Date().toISOString().split('T')[0], type: MaintenanceType.REPAIR
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === formData.assetId);
    if (!asset) return;

    onSubmit({
      ...formData,
      id: `M${Date.now()}`,
      assetName: asset.name,
      cost: 0,
      status: 'Pending'
    } as MaintenanceRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Report Equipment Issue</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Asset</label>
            <select required className="w-full border rounded-lg p-2 mt-1" 
              onChange={e => setFormData({...formData, assetId: e.target.value})}>
              <option value="">-- Select Equipment --</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maintenance Type</label>
            <select required className="w-full border rounded-lg p-2 mt-1" 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as MaintenanceType})}>
              {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue / Task Description</label>
            <textarea required rows={3} className="w-full border rounded-lg p-2 mt-1" 
              onChange={e => setFormData({...formData, issueReported: e.target.value})} placeholder="e.g., Screen not turning on or Regular Cleaning" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Vendor / Service Center</label>
            <input required type="text" className="w-full border rounded-lg p-2 mt-1" 
              onChange={e => setFormData({...formData, vendorName: e.target.value})} placeholder="e.g., Tektronix Support" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-reva-orange text-white rounded-lg hover:bg-orange-600">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompleteModal: React.FC<{ id: string, onClose: () => void, onSubmit: (id: string, cost: number, date: string) => void }> = ({ id, onClose, onSubmit }) => {
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Complete Repair</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost (₹)</label>
            <input type="number" min="0" className="w-full border rounded-lg p-2 mt-1" value={cost} onChange={e => setCost(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Completion Date</label>
            <input type="date" className="w-full border rounded-lg p-2 mt-1" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={() => { onSubmit(id, cost, date); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Complete</button>
          </div>
        </div>
      </div>
    </div>
  );
};
