import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MoreVertical, Smartphone, MapPin, Calendar, History } from 'lucide-react';
import { Customer } from '../types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800">Database Pelanggan</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Nama / WhatsApp..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bergabung</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Smartphone size={14} className="text-indigo-500" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs max-w-[200px] truncate">
                      <MapPin size={14} />
                      {customer.address || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar size={14} />
                      {new Date(customer.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <History size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
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
