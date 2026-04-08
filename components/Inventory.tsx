
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../services/DataContext';
import { Asset, AssetCategory, AssetStatus } from '../types';
import { Search, Plus, Eye, X, History, ClipboardList, ShoppingBag, Camera, Upload, Image as ImageIcon, Tag, MapPin, DollarSign, Edit2, Save, RefreshCw } from 'lucide-react';

const compressImage = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });
};

export const Inventory: React.FC = () => {
  const { assets, addAsset } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const selectedAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) || null : null;

  const filteredAssets = assets.filter(asset => 
    (filterCategory === 'All' || asset.category === filterCategory) &&
    (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (asset.subCategory && asset.subCategory.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6 relative">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, sub-category, serial..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reva-orange focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 outline-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {Object.values(AssetCategory).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-reva-navy text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category / Sub</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Warranty</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-gray-50 group cursor-pointer transition-colors" onClick={() => setSelectedAssetId(asset.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Prominent Image */}
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative group-hover:border-reva-orange transition-all shadow-sm">
                        {asset.image ? (
                          <img src={asset.image} alt={asset.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <ImageIcon size={28} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base group-hover:text-reva-orange transition-colors">{asset.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{asset.serialNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{asset.category}</div>
                    {asset.subCategory && <div className="text-xs text-gray-500 mt-0.5">{asset.subCategory}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {asset.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-bold ${asset.quantityAvailable === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                      {asset.quantityAvailable}
                    </span>
                    <span className="text-gray-400 text-xs block">of {asset.quantityTotal} {asset.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border
                      ${(asset.condition === 'Working' || asset.condition === 'Available') ? 'bg-green-50 text-green-700 border-green-200' : 
                        asset.condition === 'Maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}
                    `}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{asset.warrantyExp}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedAssetId(asset.id); }} className="p-2 text-gray-400 hover:text-reva-navy hover:bg-gray-100 rounded-full transition-colors">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAssets.length === 0 && (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Search size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Asset Detail Slide-over / Modal */}
      {selectedAsset && (
        <AssetDetailModal 
            asset={selectedAsset} 
            onClose={() => setSelectedAssetId(null)} 
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddAssetModal onClose={() => setShowAddModal(false)} onAdd={addAsset} />
      )}
    </div>
  );
};

const AssetDetailModal: React.FC<{ asset: Asset, onClose: () => void }> = ({ asset, onClose }) => {
    const { vendors, maintenanceLog, auditLog, updateAsset } = useData();
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | undefined>(asset.image);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Sync preview when asset changes
    useEffect(() => {
        setPreviewImage(asset.image);
        setIsEditingPhoto(false);
        setIsCameraOpen(false);
    }, [asset]);

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access camera. Please check permissions.");
          setIsCameraOpen(false);
        }
      };
    
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        const compressed = await compressImage(dataUrl);
        setPreviewImage(compressed);
        stopCamera();
      }
    }
  };
    
      const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
      };
    
      const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const compressed = await compressImage(reader.result as string);
            setPreviewImage(compressed);
          };
          reader.readAsDataURL(file);
        }
      };

      const handleSavePhoto = () => {
        if (previewImage && previewImage !== asset.image) {
            updateAsset(asset.id, { image: previewImage });
            setIsEditingPhoto(false);
        }
      };

      const handleCancelEdit = () => {
          setIsEditingPhoto(false);
          setPreviewImage(asset.image);
          stopCamera();
      }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto transform transition-transform duration-300">
             <div className="p-6 bg-reva-navy text-white flex justify-between items-start sticky top-0 z-10 shadow-md">
               <div>
                 <h2 className="text-2xl font-bold tracking-tight">{asset.name}</h2>
                 <p className="text-blue-200 text-sm mt-1">{asset.description}</p>
                 <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="bg-blue-900/50 border border-blue-700 px-2 py-1 rounded text-xs flex items-center font-medium"><Tag size={12} className="mr-1"/> {asset.category}</span>
                    {asset.subCategory && <span className="bg-blue-900/50 border border-blue-700 px-2 py-1 rounded text-xs font-medium">{asset.subCategory}</span>}
                    <span className="bg-blue-900/50 border border-blue-700 px-2 py-1 rounded text-xs font-mono">SN: {asset.serialNumber}</span>
                    {asset.fundingSource && <span className="bg-blue-900/50 border border-blue-700 px-2 py-1 rounded text-xs flex items-center"><DollarSign size={12} className="mr-1"/> Funded by: {asset.fundingSource}</span>}
                 </div>
               </div>
               <button onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                 <X size={24} />
               </button>
             </div>

             <div className="p-6 space-y-8">
               {/* Image Preview & Edit Section */}
               <div className="w-full relative group">
                   {!isEditingPhoto ? (
                       <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 relative shadow-inner">
                            {asset.image ? (
                                <img src={asset.image} alt={asset.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                <ImageIcon size={64} />
                                <span className="text-sm mt-2 font-medium">No Image Available</span>
                                </div>
                            )}
                            {/* Edit Overlay Button */}
                            <button 
                                onClick={() => setIsEditingPhoto(true)}
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2.5 rounded-lg shadow-lg flex items-center text-sm font-bold hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Edit2 size={16} className="mr-2" /> Change Photo
                            </button>
                       </div>
                   ) : (
                       <div className="bg-gray-50 border-2 border-dashed border-reva-orange rounded-xl p-6">
                           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                             <Camera className="mr-2 text-reva-orange" size={20}/> Update Product Photo
                           </h4>
                           
                           {/* Camera View */}
                           {isCameraOpen ? (
                               <div className="relative bg-black rounded-lg overflow-hidden mb-4 shadow-lg">
                                    <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline></video>
                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                        <button type="button" onClick={capturePhoto} className="bg-white rounded-full p-4 shadow-xl hover:scale-110 transition-transform ring-4 ring-white/30">
                                            <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                                        </button>
                                        <button type="button" onClick={stopCamera} className="bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900">
                                            Cancel
                                        </button>
                                    </div>
                               </div>
                           ) : (
                               <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-300">
                                   {previewImage ? (
                                       <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                                   ) : (
                                       <span className="text-gray-400 text-sm font-medium">No new image selected</span>
                                   )}
                               </div>
                           )}

                           {/* Controls */}
                           {!isCameraOpen && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button onClick={startCamera} className="flex items-center justify-center py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold">
                                        <Camera size={18} className="mr-2"/> Take Photo
                                    </button>
                                    <label className="flex items-center justify-center py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-bold shadow-sm">
                                        <Upload size={18} className="mr-2"/> Upload File
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                           )}

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                               <button 
                                  onClick={() => {
                                    updateAsset(asset.id, { image: '' });
                                    setIsEditingPhoto(false);
                                  }}
                                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors mr-auto"
                               >
                                 Remove Photo
                               </button>
                               <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                               <button 
                                  onClick={handleSavePhoto}
                                  disabled={previewImage === asset.image} 
                                  className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center shadow-sm transition-colors ${previewImage === asset.image ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-reva-orange text-white hover:bg-orange-600'}`}
                                >
                                   <Save size={16} className="mr-2" /> Save Photo
                               </button>
                           </div>
                       </div>
                   )}
               </div>

               {/* Status Card */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Status</p>
                    <p className={`text-xl font-bold mt-1 ${(asset.condition === 'Working' || asset.condition === 'Available') ? 'text-green-600' : 'text-red-600'}`}>{asset.condition}</p>
                 </div>
                 <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Location</p>
                    <div className="flex items-center text-xl font-bold mt-1 text-gray-800">
                       <MapPin size={20} className="mr-2 text-reva-orange"/> {asset.location}
                    </div>
                 </div>
               </div>

               {/* Purchase Info */}
               <div>
                  <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                    <ShoppingBag size={20} className="mr-2 text-reva-orange" /> Purchase Details
                  </h3>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 grid grid-cols-2 gap-y-6 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Vendor</span>
                      <span className="font-bold text-gray-800 text-lg">{vendors.find(v => v.id === asset.vendor)?.name || asset.vendor}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Purchase Date</span>
                      <span className="font-medium text-gray-800">{asset.purchaseDate}</span>
                    </div>
                     <div>
                      <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Price</span>
                      <span className="font-medium text-gray-800 text-lg">₹{asset.price.toLocaleString()}</span>
                    </div>
                     <div>
                      <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Warranty Ends</span>
                      <span className="font-medium text-gray-800">{asset.warrantyExp}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Stock Unit</span>
                      <span className="font-medium text-gray-800">{asset.unit}</span>
                    </div>
                  </div>
               </div>

               {/* Maintenance History */}
               <div>
                 <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                    <History size={20} className="mr-2 text-reva-orange" /> Maintenance Log
                  </h3>
                  <div className="space-y-3">
                    {maintenanceLog.filter(m => m.assetId === asset.id).length === 0 && <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">No maintenance records found.</p>}
                    {maintenanceLog.filter(m => m.assetId === asset.id).map(m => (
                      <div key={m.id} className="text-sm bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="flex justify-between font-bold text-gray-800 mb-2">
                            <span className="flex items-center gap-2">
                               <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${m.type === 'Prevention' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                                  {m.type}
                               </span>
                               {m.issueReported}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${m.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span>
                         </div>
                         <div className="flex justify-between text-xs text-gray-500 border-t pt-2 mt-1">
                            <span>Reported: {m.dateReported}</span>
                            <span>Cost: ₹{m.cost}</span>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Audit History */}
               <div>
                 <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                    <ClipboardList size={20} className="mr-2 text-reva-orange" /> Audit Logs
                  </h3>
                  <div className="space-y-3">
                    {auditLog.filter(a => a.assetId === asset.id).length === 0 && <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">No audit records found.</p>}
                    {auditLog.filter(a => a.assetId === asset.id).map(a => (
                       <div key={a.id} className="text-sm bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-1">
                             <div className="font-bold text-gray-800">{a.verifiedBy}</div>
                             <span className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{a.status}</span>
                          </div>
                          <p className="text-gray-600 my-2 italic">"{a.remarks}"</p>
                          <div className="text-xs text-gray-400">
                             Verified on {a.verificationDate}
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>
        </div>
    );
}

const AddAssetModal: React.FC<{ onClose: () => void, onAdd: (a: Asset) => void }> = ({ onClose, onAdd }) => {
  const { vendors } = useData();
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '', category: AssetCategory.EQUIPMENT, subCategory: '', quantityTotal: 1, location: '', unit: 'pcs',
    serialNumber: '', condition: AssetStatus.AVAILABLE, price: 0, image: '', fundingSource: ''
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: Asset = {
      ...formData,
      id: `A${Math.floor(Math.random() * 10000)}`,
      quantityAvailable: formData.quantityTotal || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    } as Asset;
    onAdd(newAsset);
    onClose();
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        const compressed = await compressImage(dataUrl);
        setFormData({ ...formData, image: compressed });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setFormData({ ...formData, image: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Add New Equipment</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to register a new asset.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
              <input required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none" 
                onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Digital Oscilloscope" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <select className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-reva-navy outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as AssetCategory})}>
                {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Sub Category (Optional)</label>
              <input className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none" placeholder="e.g. 3D Printers"
                onChange={e => setFormData({...formData, subCategory: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Funding Source (Optional)</label>
              <input className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none" placeholder="e.g. AICTE"
                onChange={e => setFormData({...formData, fundingSource: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                 <input type="number" required min="1" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                   onChange={e => setFormData({...formData, quantityTotal: parseInt(e.target.value)})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                 <input type="text" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none" placeholder="pcs" defaultValue="pcs"
                   onChange={e => setFormData({...formData, unit: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
              <input required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none" placeholder="e.g. IDEA LAB Section"
                onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-reva-navy outline-none"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value as AssetStatus})}>
                {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vendor</label>
              <select className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-reva-navy outline-none"
                onChange={e => setFormData({...formData, vendor: e.target.value})}>
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Purchase Date</label>
              <input type="date" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
            </div>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Warranty Exp</label>
              <input type="date" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                onChange={e => setFormData({...formData, warrantyExp: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number</label>
              <input required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
               <input type="number" required min="0" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} />
            </div>
          </div>
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none" rows={3}
                onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detailed description of the equipment..." />
          </div>

          {/* Image Upload / Camera Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <Camera size={18} className="mr-2 text-reva-orange"/> Asset Photo
            </label>
            
            {!isCameraOpen && (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                 <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center overflow-hidden border shadow-sm">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-gray-400">
                          <ImageIcon size={32} className="mx-auto mb-1" />
                          <span className="text-xs">No image</span>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-3 w-full">
                    <p className="text-sm text-gray-500 mb-2">Upload a photo or capture one using your device camera.</p>
                    <div className="flex gap-3">
                        <button type="button" onClick={startCamera} className="flex-1 flex items-center justify-center px-4 py-3 bg-reva-navy text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm font-medium">
                           <Camera size={18} className="mr-2" /> Take Photo
                        </button>
                        <label className="flex-1 flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm font-medium text-gray-700">
                           <Upload size={18} className="mr-2" /> Upload File
                           <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                 </div>
              </div>
            )}

            {isCameraOpen && (
               <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                 <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline></video>
                 <canvas ref={canvasRef} className="hidden"></canvas>
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button type="button" onClick={capturePhoto} className="bg-white rounded-full p-4 shadow-xl hover:scale-110 transition-transform">
                       <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                    </button>
                    <button type="button" onClick={stopCamera} className="bg-gray-800/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                       Cancel
                    </button>
                 </div>
               </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-reva-orange text-white rounded-lg hover:bg-orange-600 font-bold shadow-sm transition-colors">Save Asset</button>
          </div>
        </form>
      </div>
    </div>
  );
};
