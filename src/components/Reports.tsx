import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Filter, Calendar, ArrowUpRight, ArrowDownRight, FileText, Table } from 'lucide-react';
import { Stats, Order } from '../types';

export default function Reports() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, activeOrders: 0, completedToday: 0 });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
    fetch('/api/orders').then(res => res.json()).then(setOrders);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Laporan Bisnis</h2>
          <p className="text-sm text-slate-500">Pantau performa laundry Anda secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all">
            <Filter size={16} /> Filter
          </button>
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            <button className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs flex items-center gap-2">
              <FileText size={16} /> PDF
            </button>
            <button className="px-4 py-2 bg-white text-slate-600 font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
              <Table size={16} /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Omset</p>
          <h3 className="text-2xl font-black text-slate-800">{formatCurrency(stats.revenue * 30)}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} /> +15.4% <span className="text-slate-400 font-medium">vs bulan lalu</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-black text-slate-800">{orders.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} /> +8.2% <span className="text-slate-400 font-medium">vs bulan lalu</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pelanggan Baru</p>
          <h3 className="text-2xl font-black text-slate-800">24</h3>
          <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-bold">
            <ArrowDownRight size={14} /> -2.1% <span className="text-slate-400 font-medium">vs bulan lalu</span>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Riwayat Transaksi</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar size={14} /> 1 Feb 2024 - 28 Feb 2024
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pembayaran</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-400">#{order.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{order.customer_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold ${order.payment_status === 'LUNAS' ? 'text-emerald-500' : 'text-red-400'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(order.total_price)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
