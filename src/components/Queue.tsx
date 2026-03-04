import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Smartphone, CheckCircle, Clock, Package, ChevronRight, Printer } from 'lucide-react';
import { Order } from '../types';
import { motion } from 'motion/react';

export default function Queue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('SEMUA');

  useEffect(() => {
    fetch('/api/orders').then(res => res.json()).then(setOrders);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o));
    }
  };

  const filteredOrders = filter === 'SEMUA' ? orders : orders.filter(o => o.status === filter);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const statusColors: any = {
    'BARU': 'bg-blue-50 text-blue-600 border-blue-100',
    'PROSES': 'bg-amber-50 text-amber-600 border-amber-100',
    'SELESAI': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'DIAMBIL': 'bg-slate-50 text-slate-500 border-slate-100'
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {['SEMUA', 'BARU', 'PROSES', 'SELESAI', 'DIAMBIL'].map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari No. Nota / Nama..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <motion.div 
            layout
            key={order.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  #{order.id}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{order.customer_name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <span className={`text-[10px] font-bold ${order.payment_status === 'LUNAS' ? 'text-emerald-500' : 'text-red-400'}`}>
                  {order.payment_status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Package size={16} />
                  <span className="text-xs font-medium">Layanan Laundry</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{formatCurrency(order.total_price)}</span>
              </div>

              <div className="h-[1px] bg-slate-50"></div>

              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all">
                  <Smartphone size={14} /> WhatsApp
                </button>
                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                  <Printer size={16} />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 flex gap-2">
              {order.status === 'BARU' && (
                <button 
                  onClick={() => updateStatus(order.id, 'PROSES')}
                  className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                >
                  Mulai Proses
                </button>
              )}
              {order.status === 'PROSES' && (
                <button 
                  onClick={() => updateStatus(order.id, 'SELESAI')}
                  className="w-full py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all"
                >
                  Selesaikan
                </button>
              )}
              {order.status === 'SELESAI' && (
                <button 
                  onClick={() => updateStatus(order.id, 'DIAMBIL')}
                  className="w-full py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Serahkan ke Pelanggan
                </button>
              )}
              {order.status === 'DIAMBIL' && (
                <div className="w-full py-2 text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  Transaksi Selesai
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 opacity-50">
            <ClipboardList size={64} className="mx-auto text-slate-300" strokeWidth={1} />
            <p className="text-slate-500 italic">Tidak ada antrian di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClipboardList({ size, className, strokeWidth }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
  );
}
