import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Package, 
  ChevronRight, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Settings,
  Smartphone
} from 'lucide-react';
import { Stats, Order } from '../types';
import { motion } from 'motion/react';

export default function Dashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [stats, setStats] = useState<Stats>({ revenue: 0, activeOrders: 0, completedToday: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
    fetch('/api/orders').then(res => res.json()).then(data => setRecentOrders(data.slice(0, 5)));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const statCards = [
    { label: 'Omset Hari Ini', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%', trendUp: true },
    { label: 'Antrian Aktif', value: stats.activeOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '4 Baru', trendUp: true },
    { label: 'Selesai Hari Ini', value: stats.completedToday, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+2', trendUp: true },
    { label: 'Total Transaksi', value: recentOrders.length, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50', trend: 'Bulan ini', trendUp: true },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Transaksi Terbaru</h2>
            <button 
              onClick={() => onNavigate('queue')}
              className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {order.customer_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{order.customer_name}</p>
                            <p className="text-xs text-slate-500">{order.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'BARU' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'PROSES' ? 'bg-amber-50 text-amber-600' :
                          order.status === 'SELESAI' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(order.total_price)}</p>
                        <p className={`text-[10px] font-bold ${order.payment_status === 'LUNAS' ? 'text-emerald-500' : 'text-red-400'}`}>
                          {order.payment_status}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                        Belum ada transaksi hari ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Summary */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Siap Melayani?</h3>
              <p className="text-indigo-100 text-sm mb-6">Mulai transaksi baru dengan cepat menggunakan fitur Quick Intake.</p>
              <button 
                onClick={() => onNavigate('pos')}
                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle size={20} /> Transaksi Baru
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full opacity-20"></div>
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-indigo-400 rounded-full opacity-10"></div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Shortcut</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onNavigate('customers')} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                <Users className="text-indigo-600" size={24} />
                <span className="text-xs font-semibold text-slate-600">Pelanggan</span>
              </button>
              <button onClick={() => onNavigate('services')} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                <Settings className="text-indigo-600" size={24} />
                <span className="text-xs font-semibold text-slate-600">Layanan</span>
              </button>
              <button onClick={() => onNavigate('reports')} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                <TrendingUp className="text-indigo-600" size={24} />
                <span className="text-xs font-semibold text-slate-600">Laporan</span>
              </button>
              <button className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                <Smartphone className="text-indigo-600" size={24} />
                <span className="text-xs font-semibold text-slate-600">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusCircle({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  );
}
