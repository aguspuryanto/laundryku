export type Role = 'ADMIN' | 'STAFF';

export interface User {
  name: string;
  role: Role;
  avatar: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  category: 'Kg' | 'Pcs' | 'Pasang';
  price: number;
  estimated_days: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  service_id: number;
  service_name?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  status: 'BARU' | 'PROSES' | 'SELESAI' | 'DIAMBIL';
  payment_status: 'BELUM_BAYAR' | 'LUNAS';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Stats {
  revenue: number;
  activeOrders: number;
  completedToday: number;
}
