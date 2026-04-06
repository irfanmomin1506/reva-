
import React from 'react';
import { useData } from '../services/DataContext';
import { Phone, Mail, MapPin, Truck } from 'lucide-react';

export const Vendors: React.FC = () => {
  const { vendors } = useData();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Vendor Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div key={vendor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-reva-orange transition-colors group">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-reva-navy group-hover:text-reva-orange transition-colors">{vendor.name}</h3>
               <span className="bg-blue-50 text-blue-700 p-2 rounded-full">
                 <Truck size={20} />
               </span>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
               <div className="flex items-center">
                 <Phone size={16} className="mr-3 text-gray-400" />
                 <span>{vendor.contactPerson} ({vendor.phone})</span>
               </div>
               <div className="flex items-center">
                 <Mail size={16} className="mr-3 text-gray-400" />
                 <a href={`mailto:${vendor.email}`} className="hover:text-reva-navy">{vendor.email}</a>
               </div>
               <div className="flex items-start">
                 <MapPin size={16} className="mr-3 mt-1 text-gray-400" />
                 <span>{vendor.address}</span>
               </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Supplies</p>
               <div className="flex flex-wrap gap-2">
                 {vendor.itemsSupplied.map((item, idx) => (
                   <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                     {item}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
