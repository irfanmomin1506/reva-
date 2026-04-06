
import React, { useState } from 'react';
import { 
  LayoutDashboard, Box, ClipboardList, PenTool, 
  Users, Activity, FileText, Settings, LogOut, Menu, X, Bell, AlertCircle, AlertTriangle, Info, Video 
} from 'lucide-react';
import { useData } from '../services/DataContext';
import { AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { studentRequests, notifications, currentUser } = useData();
  
  const pendingRequests = studentRequests.filter(r => r.status === 'Pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'issue-return', label: 'Issue & Return', icon: ClipboardList },
    { id: 'consumables', label: 'Consumables', icon: PenTool },
    { id: 'students', label: 'Student Requests', icon: Users, badge: pendingRequests },
    { id: 'maintenance', label: 'Maintenance', icon: Activity },
    { id: 'ai-lab', label: 'AI Animator', icon: Video },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'vendors', label: 'Vendors', icon: Users }, 
  ];

  const getNotifIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertCircle size={16} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const handleNotificationClick = (n: AppNotification) => {
    setIsNotifOpen(false);
    if (n.id.startsWith('n-req')) setActiveTab('students');
    else if (n.id.startsWith('n-stock')) setActiveTab('consumables');
    else if (n.id.startsWith('n-overdue') || n.id.startsWith('n-due')) setActiveTab('issue-return');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-reva-navy text-white transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-700 bg-[#001936]">
            <h1 className="text-2xl font-bold text-reva-orange">REVA<span className="text-white ml-1">IMS</span></h1>
            <p className="text-xs text-gray-400 mt-1">Lab Inventory System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                      ${activeTab === item.id 
                        ? 'bg-reva-orange text-white shadow-md' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon size={20} className="mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-gray-700 bg-[#001936]">
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 mb-4 px-2 w-full text-left hover:bg-white/5 rounded p-2 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-reva-navy font-bold group-hover:bg-reva-orange group-hover:text-white transition-colors">
                {currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{currentUser.role}</p>
              </div>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button 
              className="p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 ml-2 lg:ml-0">
              {activeTab === 'profile' ? 'My Profile' : navItems.find(i => i.id === activeTab)?.label}
            </h2>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 text-gray-600 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Notifications</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{notifications.length} New</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                        )}
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                              <div>
                                <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${activeTab === 'profile' ? 'text-reva-orange bg-orange-50' : 'text-gray-600'}`}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
