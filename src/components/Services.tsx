import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, DollarSign, Clock } from 'lucide-react';
import { Service } from '../types';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Manajemen Layanan</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus size={18} /> Tambah Layanan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Tag size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1">{service.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                {service.category}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign size={14} />
                  <span>Harga</span>
                </div>
                <span className="font-bold text-indigo-600">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <span>Estimasi</span>
                </div>
                <span className="font-semibold text-slate-700">{service.estimated_days} Hari</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
