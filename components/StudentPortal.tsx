
import React, { useState } from 'react';
import { useData } from '../services/DataContext';
import { StudentProfile, Asset, StudentRequest, RequestStatus } from '../types';
// Added missing FileText import from lucide-react
import { 
  ArrowLeft, Search, Bell, BookOpen, User, 
  LogOut, LayoutDashboard, Box, ClipboardList, 
  ChevronRight, Download, ExternalLink, Calendar, 
  MessageSquare, Package, Tag, MapPin, Info, Send, FileText
} from 'lucide-react';

interface StudentPortalProps {
  onBack: () => void;
}

type StudentView = 'dashboard' | 'notices' | 'materials' | 'profile' | 'inventory' | 'my-requests';

export const StudentPortal: React.FC<StudentPortalProps> = ({ onBack }) => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [view, setView] = useState<StudentView>('dashboard');

  if (!student) {
    return <StudentLogin onLogin={setStudent} onBack={onBack} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Equipment', icon: Box },
    { id: 'my-requests', label: 'My Requests', icon: ClipboardList },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans pb-20 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-reva-navy text-white h-screen sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-reva-orange">REVA<span className="text-white ml-1">Student</span></h1>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as StudentView)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${view === item.id ? 'bg-reva-orange text-white' : 'hover:bg-white/10 text-gray-300'}`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onBack}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={18} className="mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-reva-navy text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <h1 className="text-xl font-bold text-reva-orange">REVA</h1>
        <div className="flex gap-4">
          <button onClick={() => setView('dashboard')} className="p-1"><LayoutDashboard size={20}/></button>
          <button onClick={() => setView('profile')} className="p-1"><User size={20}/></button>
          <button onClick={onBack} className="p-1 text-red-400"><LogOut size={20}/></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10">
        <div className="max-w-5xl mx-auto">
          {view === 'dashboard' && <StudentHome student={student} setView={setView} />}
          {view === 'inventory' && <StudentInventory student={student} />}
          {view === 'my-requests' && <MyRequestsView student={student} />}
          {view === 'notices' && <NoticesView />}
          {view === 'materials' && <MaterialsView />}
          {view === 'profile' && <StudentProfileDetail student={student} />}
        </div>
      </main>

      {/* Tab Bar - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50 shadow-2xl">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as StudentView)}
            className={`flex flex-col items-center p-2 rounded-lg flex-1 ${view === item.id ? 'text-reva-orange' : 'text-gray-400'}`}
          >
            <item.icon size={18} />
            <span className="text-[10px] mt-1 whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StudentLogin: React.FC<{ onLogin: (s: StudentProfile) => void, onBack: () => void }> = ({ onLogin, onBack }) => {
  const { students } = useData();
  const [usn, setUsn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = students.find(s => s.usn.toUpperCase() === usn.toUpperCase());
    if (found) {
      onLogin(found);
    } else {
      alert("USN not found. Only pre-registered students can login. (Try R21EC045)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-reva-orange/10 rounded-full -mr-24 -mt-24 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-reva-navy/5 rounded-full -ml-24 -mb-24 blur-3xl" />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border-t-4 border-reva-orange">
        <div className="bg-reva-navy p-10 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <User size={32} className="text-reva-orange" />
          </div>
          <h2 className="text-2xl font-bold">Student Portal</h2>
          <p className="text-blue-200/70 mt-2 text-sm">Access Lab Resources & Materials</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">University Seat Number (USN)</label>
            <input 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-reva-orange outline-none transition-all font-mono tracking-widest uppercase"
              placeholder="R21XXXXX"
              value={usn}
              onChange={e => setUsn(e.target.value)}
            />
          </div>
          <button className="w-full bg-reva-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
            Log In to Portal
          </button>
          <button type="button" onClick={onBack} className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center justify-center">
            <ArrowLeft size={16} className="mr-2" /> Back to Faculty Login
          </button>
        </form>
      </div>
    </div>
  );
};

const StudentHome: React.FC<{ student: StudentProfile, setView: (v: StudentView) => void }> = ({ student, setView }) => {
  const { notices, studyMaterials, studentRequests } = useData();
  const myRequests = studentRequests.filter(r => r.usn === student.usn);
  const pendingCount = myRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome, {student.name.split(' ')[0]}!</h2>
          <p className="text-gray-500 mt-1 font-medium">{student.course} • {student.semester}</p>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-xs font-bold text-gray-400 uppercase">Current Session</div>
          <div className="text-sm font-bold text-reva-navy">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
      </header>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setView('inventory')}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:border-reva-navy transition-all hover:shadow-md"
        >
          <div className="p-3 bg-blue-50 text-reva-navy rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Box size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-800">Browse Equipment</h3>
          <p className="text-xs text-gray-500 mt-1">Check availability and place requests.</p>
        </button>

        <button 
          onClick={() => setView('my-requests')}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:border-reva-orange transition-all hover:shadow-md"
        >
          <div className="p-3 bg-orange-50 text-reva-orange rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <ClipboardList size={24} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">My Requests</h3>
            {pendingCount > 0 && <span className="bg-reva-orange text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount} Pending</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1">Track your component issue history.</p>
        </button>

        <button 
          onClick={() => setView('materials')}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:border-green-600 transition-all hover:shadow-md"
        >
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-800">Resources</h3>
          <p className="text-xs text-gray-500 mt-1">Download manuals and guides.</p>
        </button>
      </div>

      {/* Latest Notice Banner */}
      <div className="bg-reva-navy text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <MessageSquare size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <span className="bg-reva-orange text-[10px] font-bold uppercase px-2 py-1 rounded">Important Announcement</span>
             <span className="text-xs text-blue-200">{notices[0]?.date}</span>
          </div>
          <h3 className="text-xl font-bold">{notices[0]?.title}</h3>
          <p className="text-blue-100/70 mt-2 line-clamp-2 text-sm leading-relaxed max-w-2xl">
            {notices[0]?.content}
          </p>
          <button onClick={() => setView('notices')} className="mt-6 text-sm font-bold flex items-center text-reva-orange hover:text-white transition-colors">
            Read more <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentInventory: React.FC<{ student: StudentProfile }> = ({ student }) => {
  const { assets, addStudentRequest } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestAsset, setRequestAsset] = useState<Asset | null>(null);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Lab Equipment Browser</h2>
           <p className="text-gray-500 text-sm">View available components and place requests for lab work.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-reva-navy outline-none shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            <div className="h-40 bg-gray-50 relative">
              {asset.image ? (
                <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package size={48} />
                </div>
              )}
              <div className="absolute top-3 left-3">
                 <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm ${asset.quantityAvailable > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {asset.quantityAvailable > 0 ? 'Available' : 'Out of Stock'}
                 </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-reva-orange transition-colors">{asset.name}</h3>
                 </div>
                 <p className="text-xs text-gray-400 font-medium mb-3">{asset.category}</p>
                 <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center"><Tag size={12} className="mr-2 text-gray-400"/> {asset.subCategory || 'General'}</div>
                    <div className="flex items-center"><MapPin size={12} className="mr-2 text-gray-400"/> {asset.location}</div>
                 </div>
               </div>
               <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{asset.quantityAvailable} {asset.unit} left</span>
                  <button 
                    disabled={asset.quantityAvailable === 0}
                    onClick={() => setRequestAsset(asset)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${asset.quantityAvailable > 0 ? 'bg-reva-navy text-white hover:bg-blue-900 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Request Item
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {requestAsset && (
        <RequestModal 
          asset={requestAsset} 
          student={student} 
          onClose={() => setRequestAsset(null)}
          onSubmit={(req) => {
            addStudentRequest(req);
            setRequestAsset(null);
            alert("Request submitted successfully. You can track it in 'My Requests'.");
          }}
        />
      )}
    </div>
  );
};

const RequestModal: React.FC<{ asset: Asset, student: StudentProfile, onClose: () => void, onSubmit: (r: StudentRequest) => void }> = ({ asset, student, onClose, onSubmit }) => {
  const [qty, setQty] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: StudentRequest = {
      id: `REQ-${Date.now()}`,
      studentName: student.name,
      usn: student.usn,
      email: student.email,
      assetId: asset.id, // Ensure ID is passed correctly
      assetName: asset.name,
      quantity: qty,
      purpose,
      expectedReturnDate: returnDate,
      status: RequestStatus.PENDING,
      requestDate: new Date().toISOString().split('T')[0]
    };
    onSubmit(request);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-reva-navy text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Request Equipment</h3>
            <p className="text-blue-200 text-xs">Submitting for: {asset.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                <input required type="number" min="1" max={asset.quantityAvailable} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-reva-orange" value={qty} onChange={e => setQty(parseInt(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Return Date</label>
                <input required type="date" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-reva-orange" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
              </div>
           </div>
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Purpose of Use</label>
              <textarea required rows={3} placeholder="e.g. Lab Session 4, Project Prototype..." className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-reva-orange" value={purpose} onChange={e => setPurpose(e.target.value)} />
           </div>
           <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
              <div className="text-reva-navy flex-shrink-0 mt-0.5"><Info size={18}/></div>
              <p className="text-xs text-reva-navy leading-relaxed">
                By submitting this request, you agree to handle the equipment with care and return it by the specified date.
              </p>
           </div>
           <button type="submit" className="w-full bg-reva-orange hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center">
             <Send size={18} className="mr-2" /> Submit Request
           </button>
        </form>
      </div>
    </div>
  );
};

const MyRequestsView: React.FC<{ student: StudentProfile }> = ({ student }) => {
  const { studentRequests } = useData();
  const myRequests = studentRequests.filter(r => r.usn === student.usn);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800">My Requests History</h2>
      
      {myRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-gray-300" />
           </div>
           <p className="text-gray-500 font-medium">You haven't placed any requests yet.</p>
           <p className="text-xs text-gray-400 mt-1">Equipment requests will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                       req.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                       req.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                       'bg-red-50 text-red-700 border border-red-100'
                     }`}>
                        {req.status}
                     </span>
                     <span className="text-xs text-gray-400">{req.requestDate}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{req.assetName}</h3>
                  <p className="text-xs text-gray-500 mt-1">Quantity: {req.quantity} • Expected Return: {req.expectedReturnDate}</p>
               </div>
               <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Purpose</p>
                  <p className="text-sm text-gray-600 italic">"{req.purpose}"</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NoticesView: React.FC = () => {
  const { notices } = useData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800">Notice Board</h2>
      <div className="space-y-4">
        {notices.map(notice => (
          <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${notice.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  {notice.priority}
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center">
                  <Calendar size={12} className="mr-1" /> {notice.date}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800">{notice.title}</h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{notice.content}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 flex items-center">
              Posted by <span className="text-gray-700 font-bold ml-1">{notice.postedBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MaterialsView: React.FC = () => {
  const { studyMaterials } = useData();

  const getIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="text-red-500" />;
      case 'Link': return <ExternalLink className="text-blue-500" />;
      default: return <BookOpen className="text-green-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyMaterials.map(mat => (
          <div key={mat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-reva-navy transition-colors">
            <div className="p-3 bg-gray-50 rounded-xl">
              {getIcon(mat.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{mat.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mat.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase bg-gray-100 px-2 py-0.5 rounded">
                  {mat.type}
                </span>
                <a href={mat.url} className="text-reva-navy hover:text-reva-orange text-xs font-bold flex items-center transition-colors">
                  <Download size={14} className="mr-1" /> Access
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentProfileDetail: React.FC<{ student: StudentProfile }> = ({ student }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Profile</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-reva-navy h-24" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex justify-center md:justify-start">
            <div className="w-24 h-24 bg-reva-orange text-white rounded-3xl border-4 border-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {student.name[0]}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
            <p className="text-gray-500 font-medium">Student ID: {student.usn}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
              <p className="text-gray-800 font-bold">{student.course}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Year</p>
              <p className="text-gray-800 font-bold">{student.semester}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
              <p className="text-gray-800 font-bold">{student.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Level</p>
              <p className="text-reva-navy font-bold flex items-center">
                <LayoutDashboard size={14} className="mr-1"/> Student Restricted
              </p>
            </div>
          </div>
          
          <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
              This is a read-only profile. If any information is incorrect, please contact the Lab Coordinator or Faculty Advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const X: React.FC<{ size?: number, className?: string }> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
