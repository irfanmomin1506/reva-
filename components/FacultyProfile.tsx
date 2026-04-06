
import React, { useState, useEffect } from 'react';
import { useData } from '../services/DataContext';
import { User, Check, Shield, User as UserIcon, Mail, Phone, Lock, Save } from 'lucide-react';

export const FacultyProfile: React.FC = () => {
  const { currentUser, updateCurrentUser } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone
    });
  }, [currentUser]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser(formData);
    setMessage({ type: 'success', text: 'Profile details updated successfully.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.current !== currentUser.password) {
      setMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (passData.new !== passData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passData.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    updateCurrentUser({ password: passData.new });
    setPassData({ current: '', new: '', confirm: '' });
    setMessage({ type: 'success', text: 'Password changed successfully.' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Faculty Profile</h2>
        <p className="text-gray-500">Manage your personal information and account security.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? <Check size={20} className="mr-2" /> : <Shield size={20} className="mr-2" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-24 h-24 bg-reva-navy text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                 {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{currentUser.name}</h3>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mt-1">{currentUser.role}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-left">
                 <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-3 text-reva-orange" /> {currentUser.email}
                 </div>
                 <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-3 text-reva-orange" /> {currentUser.phone}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
           {/* General Info Form */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                 <UserIcon size={20} className="mr-2 text-reva-navy" /> Personal Details
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                       <input type="text" required 
                          className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                       <input type="tel" required 
                          className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                       <input type="email" required 
                          className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                          value={formData.email} disabled title="Contact Admin to change email"
                       />
                       <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                    </div>
                 </div>
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-reva-navy text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors flex items-center">
                       <Save size={18} className="mr-2" /> Save Changes
                    </button>
                 </div>
              </form>
           </div>

           {/* Security Form */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                 <Lock size={20} className="mr-2 text-reva-navy" /> Security & Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" required 
                       className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                       value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                       <input type="password" required 
                          className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                          value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                       <input type="password" required 
                          className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-reva-navy outline-none"
                          value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-reva-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                       <Shield size={18} className="mr-2" /> Update Password
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};
