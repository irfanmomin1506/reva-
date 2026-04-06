
import React from 'react';
import { useData } from '../services/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Package, AlertTriangle, Users, Wrench, ArrowRight } from 'lucide-react';

const COLORS = ['#002147', '#F37021', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { assets, issueLog, consumables, maintenanceLog, studentRequests } = useData();

  // Calculate Stats
  const totalAssets = assets.reduce((acc, curr) => acc + curr.quantityTotal, 0);
  const totalWorking = assets.filter(a => a.condition === 'Working' || a.condition === 'Available').length;
  const underMaintenance = assets.filter(a => a.condition === 'Maintenance').length;
  const lowStockConsumables = consumables.filter(c => c.currentStock <= c.minThreshold).length;
  const pendingRequests = studentRequests.filter(r => r.status === 'Pending').length;
  const activeIssues = issueLog.filter(i => i.status === 'Pending').length;

  // Chart Data
  const categoryData = assets.reduce((acc: any[], curr) => {
    const found = acc.find(i => i.name === curr.category);
    if (found) {
      found.value += curr.quantityTotal;
    } else {
      acc.push({ name: curr.category, value: curr.quantityTotal });
    }
    return acc;
  }, []);

  const conditionData = [
    { name: 'Working/Available', value: totalWorking },
    { name: 'Maintenance', value: underMaintenance },
    { name: 'Damaged', value: assets.filter(a => a.condition === 'Damaged').length },
    { name: 'Not Working', value: assets.filter(a => a.condition === 'Not Working').length },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-reva-navy cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Assets</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalAssets}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-reva-navy group-hover:bg-reva-navy group-hover:text-white transition-colors">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Inventory <ArrowRight size={12} className="ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('maintenance')}
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{underMaintenance}</h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
              <Wrench size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-yellow-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Maintenance Log <ArrowRight size={12} className="ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('consumables')}
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-reva-orange cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{lowStockConsumables}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-reva-orange group-hover:bg-reva-orange group-hover:text-white transition-colors">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Consumables <ArrowRight size={12} className="ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('students')}
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{pendingRequests}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Approve Requests <ArrowRight size={12} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#002147">
                   {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Equipment Condition</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Maintenance Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Issue</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLog.slice(0, 5).map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{log.assetName}</td>
                  <td className="px-6 py-4">{log.issueReported}</td>
                  <td className="px-6 py-4">{log.dateReported}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${log.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
