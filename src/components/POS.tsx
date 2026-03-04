import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ShoppingCart, Trash2, Printer, CheckCircle, Smartphone } from 'lucide-react';
import { Customer, Service, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function POS() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'BELUM_BAYAR' | 'LUNAS'>('BELUM_BAYAR');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
  }, []);

  const handleSearchCustomer = async () => {
    if (!phone) return;
    const res = await fetch(`/api/customers/search?phone=${phone}`);
    const data = await res.json();
    if (data) {
      setCustomer(data);
      setIsNewCustomer(false);
    } else {
      setCustomer(null);
      setIsNewCustomer(true);
    }
  };

  const addToCart = (service: Service) => {
    const existing = cart.find(item => item.service_id === service.id);
    if (existing) {
      setCart(cart.map(item => 
        item.service_id === service.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        service_id: service.id, 
        service_name: service.name, 
        quantity: 1, 
        price: service.price 
      }]);
    }
  };

  const removeFromCart = (serviceId: number) => {
    setCart(cart.filter(item => item.service_id !== serviceId));
  };

  const updateQuantity = (serviceId: number, qty: number) => {
    if (qty <= 0) return removeFromCart(serviceId);
    setCart(cart.map(item => 
      item.service_id === serviceId ? { ...item, quantity: qty } : item
    ));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    let customerId = customer?.id;

    if (isNewCustomer) {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone, address: newAddress })
      });
      const data = await res.json();
      customerId = data.id;
    }

    if (!customerId || cart.length === 0) return;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        items: cart,
        total_price: totalPrice,
        payment_status: paymentStatus
      })
    });

    if (res.ok) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCart([]);
        setPhone('');
        setCustomer(null);
        setIsNewCustomer(false);
        setNewName('');
        setNewAddress('');
      }, 3000);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Customer & Services */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Search */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-indigo-600" /> Informasi Pelanggan
          </h3>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Masukkan Nomor WhatsApp..." 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button 
                onClick={handleSearchCustomer}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {customer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-indigo-900">{customer.name}</p>
                  <p className="text-xs text-indigo-600">{customer.address || 'Alamat tidak tersedia'}</p>
                </div>
                <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase">Pelanggan Tetap</div>
              </motion.div>
            )}

            {isNewCustomer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs flex items-center gap-2">
                  <UserPlus size={16} /> Nomor baru terdeteksi. Silakan lengkapi data.
                </div>
                <input 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <textarea 
                  placeholder="Alamat Lengkap" 
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-20"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Services Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Pilih Layanan</h3>
            <div className="flex gap-2">
              {['Semua', 'Kg', 'Pcs', 'Pasang'].map(cat => (
                <button key={cat} className="px-3 py-1 text-[10px] font-bold border border-slate-200 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all uppercase tracking-wider">
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <button 
                key={service.id}
                onClick={() => addToCart(service)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                    {service.category}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShoppingCart size={16} />
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{service.name}</h4>
                <p className="text-indigo-600 font-bold mt-1">{formatCurrency(service.price)}<span className="text-slate-400 text-[10px] font-normal">/{service.category}</span></p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" /> Ringkasan Pesanan
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map((item) => (
              <div key={item.service_id} className="flex items-center justify-between gap-4 group">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.service_name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.service_id, parseFloat(e.target.value))}
                    className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                  />
                  <button 
                    onClick={() => removeFromCart(item.service_id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="text-sm italic">Keranjang kosong</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-b-2xl space-y-4">
            <div className="flex items-center justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-sm">
              <span>Diskon</span>
              <span className="font-semibold text-emerald-500">- Rp 0</span>
            </div>
            <div className="h-[1px] bg-slate-200"></div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Total</span>
              <span className="text-xl font-black text-indigo-600">{formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentStatus('BELUM_BAYAR')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  paymentStatus === 'BELUM_BAYAR' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white text-slate-400 border border-slate-100'
                }`}
              >
                Belum Bayar
              </button>
              <button 
                onClick={() => setPaymentStatus('LUNAS')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  paymentStatus === 'LUNAS' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-400 border border-slate-100'
                }`}
              >
                Lunas
              </button>
            </div>

            <button 
              disabled={cart.length === 0 || (!customer && !isNewCustomer)}
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer size={20} /> Simpan & Cetak Nota
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Transaksi Berhasil!</h3>
              <p className="text-slate-500 text-sm mb-6">Nota sedang dicetak dan notifikasi WhatsApp telah dikirim ke pelanggan.</p>
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Tutup</button>
                <button className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">Lihat Nota</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
