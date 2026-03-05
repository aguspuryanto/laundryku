import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  Package,
  Printer,
  ChevronRight,
  MoreVertical,
  Filter,
  Download,
  Smartphone,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Service, Order, Stats, Role, User } from './types';

// Components
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Queue from './components/Queue';
import Customers from './components/Customers';
import Services from './components/Services';
import Reports from './components/Reports';

type Page = 'dashboard' | 'pos' | 'queue' | 'customers' | 'services' | 'reports';

const MOCK_USERS: Record<Role, User> = {
  ADMIN: { name: 'Admin Laundry', role: 'ADMIN', avatar: 'https://picsum.photos/seed/admin/100/100' },
  STAFF: { name: 'Staff Operasional', role: 'STAFF', avatar: 'https://picsum.photos/seed/staff/100/100' }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.ADMIN);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Define permissions
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'pos', label: 'Quick Intake (POS)', icon: PlusCircle, roles: ['ADMIN', 'STAFF'] },
    { id: 'queue', label: 'Antrian & Status', icon: ClipboardList, roles: ['ADMIN', 'STAFF'] },
    { id: 'customers', label: 'Pelanggan', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { id: 'services', label: 'Layanan', icon: Settings, roles: ['ADMIN'] },
    { id: 'reports', label: 'Laporan Bisnis', icon: TrendingUp, roles: ['ADMIN'] },
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  // Redirect if current page is not allowed
  useEffect(() => {
    const isAllowed = allowedMenuItems.find(item => item.id === activePage);
    if (!isAllowed) {
      setActivePage(allowedMenuItems[0].id as Page);
    }
  }, [currentUser.role, activePage, allowedMenuItems]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'pos': return <POS />;
      case 'queue': return <Queue />;
      case 'customers': return <Customers />;
      case 'services': return <Services />;
      case 'reports': return <Reports />;
      default: return null;
    }
  };

  const toggleRole = () => {
    setCurrentUser(prev => prev.role === 'ADMIN' ? MOCK_USERS.STAFF : MOCK_USERS.ADMIN);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Package size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-indigo-900">LaundryKu</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {allowedMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activePage === item.id 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
              {activePage === item.id && isSidebarOpen && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-bottom border-slate-200 px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {menuItems.find(i => i.id === activePage)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari transaksi atau pelanggan..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleRole}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors mr-2"
                title="Switch Role (Demo)"
              >
                <Shield size={14} />
                {currentUser.role} MODE
              </button>

              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <MessageSquare size={20} />
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.role === 'ADMIN' ? 'Super Admin' : 'Staff'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                  <img src={currentUser.avatar} alt="Avatar" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
