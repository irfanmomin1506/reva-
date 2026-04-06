
import React, { useState } from 'react';
import { useData } from '../services/DataContext';
import { AuditRecord, AssetStatus } from '../types';
import { ClipboardCheck, Check, X, Search } from 'lucide-react';

export const Audit: React.FC = () => {
  const { assets, auditLog, addAuditRecord } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyModalId, setVerifyModalId] = useState<string | null>(null);

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.serialNumber.includes(searchTerm));

  // Helper to get last audit status for an asset
  const getLastAudit = (assetId: string) => {
    return auditLog.find(log => log.assetId === assetId); // Assuming auditLog is sorted new -> old
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Audit & Verification</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Asset ID..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-reva-navy outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 uppercase text-xs text-gray-700">
            <tr>
              <th className="px-6 py-3">Asset Details</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Current System Status</th>
              <th className="px-6 py-3">Last Verified</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAssets.map(asset => {
              const lastAudit = getLastAudit(asset.id);
              return (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{asset.name}</div>
                    <div className="text-xs text-gray-500">SN: {asset.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4">{asset.location}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${asset.condition === AssetStatus.WORKING ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {asset.condition}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    {lastAudit ? (
                      <div>
                        <div className="font-medium text-gray-800">{lastAudit.verificationDate}</div>
                        <div className="text-xs text-gray-500">by {lastAudit.verifiedBy}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Never Verified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setVerifyModalId(asset.id)}
                      className="text-reva-navy hover:bg-blue-50 px-3 py-1.5 rounded border border-blue-200 transition-colors flex items-center justify-center mx-auto"
                    >
                      <ClipboardCheck size={16} className="mr-2" /> Verify
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {verifyModalId && (
        <VerificationModal 
          asset={assets.find(a => a.id === verifyModalId)!}
          onClose={() => setVerifyModalId(null)}
          onConfirm={addAuditRecord}
        />
      )}
    </div>
  );
};

const VerificationModal: React.FC<{ asset: any, onClose: () => void, onConfirm: (r: AuditRecord) => void }> = ({ asset, onClose, onConfirm }) => {
  const [formData, setFormData] = useState<Partial<AuditRecord>>({
    condition: asset.condition,
    remarks: '',
    verifiedBy: '',
    verificationDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      ...formData,
      id: `AD${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      status: formData.condition === asset.condition ? 'Verified' : 'Discrepancy'
    } as AuditRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
         <h3 className="text-lg font-bold text-gray-800 mb-4">Verify Asset: {asset.name}</h3>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Physical Condition Found</label>
              <select 
                className="w-full border rounded-lg p-2 mt-1"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value as AssetStatus})}
              >
                 {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Auditor Name</label>
               <input required type="text" className="w-full border rounded-lg p-2 mt-1" 
                  onChange={e => setFormData({...formData, verifiedBy: e.target.value})} placeholder="Faculty Name" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Remarks</label>
               <textarea required className="w-full border rounded-lg p-2 mt-1" rows={3}
                  onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Observations..." />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-reva-navy text-white rounded-lg hover:bg-blue-900">Save Audit</button>
            </div>
         </form>
       </div>
    </div>
  );
};
