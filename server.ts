import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("laundry.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Kg, Pcs, Pasang
    price REAL NOT NULL,
    estimated_days INTEGER DEFAULT 2
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'BARU', -- BARU, PROSES, SELESAI, DIAMBIL
    payment_status TEXT DEFAULT 'BELUM_BAYAR', -- BELUM_BAYAR, LUNAS
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial services if empty
const serviceCount = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
if (serviceCount.count === 0) {
  const insertService = db.prepare("INSERT INTO services (name, category, price, estimated_days) VALUES (?, ?, ?, ?)");
  insertService.run("Cuci Kering Setrika", "Kg", 7000, 2);
  insertService.run("Cuci Kering", "Kg", 5000, 1);
  insertService.run("Setrika Saja", "Kg", 4000, 1);
  insertService.run("Bedcover Besar", "Pcs", 35000, 3);
  insertService.run("Sepatu Canvas", "Pasang", 25000, 3);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Customers
  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
    res.json(customers);
  });

  app.get("/api/customers/search", (req, res) => {
    const { phone } = req.query;
    const customer = db.prepare("SELECT * FROM customers WHERE phone = ?").get(phone);
    res.json(customer || null);
  });

  app.post("/api/customers", (req, res) => {
    const { name, phone, address } = req.body;
    try {
      const result = db.prepare("INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)").run(name, phone, address);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Services
  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  // Orders
  app.get("/api/orders", (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { customer_id, items, total_price, payment_status } = req.body;
    
    const transaction = db.transaction(() => {
      const orderResult = db.prepare(`
        INSERT INTO orders (customer_id, total_price, payment_status) 
        VALUES (?, ?, ?)
      `).run(customer_id, total_price, payment_status);
      
      const orderId = orderResult.lastInsertRowid;
      
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, service_id, quantity, price) 
        VALUES (?, ?, ?, ?)
      `);
      
      for (const item of items) {
        insertItem.run(orderId, item.service_id, item.quantity, item.price);
      }
      
      return orderId;
    });

    try {
      const orderId = transaction();
      db.prepare("INSERT INTO audit_logs (action, details) VALUES (?, ?)").run('CREATE_ORDER', `Order ID: ${orderId}, Total: ${total_price}`);
      res.json({ id: orderId });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
    db.prepare("INSERT INTO audit_logs (action, details) VALUES (?, ?)").run('UPDATE_STATUS', `Order ID: ${id}, New Status: ${status}`);
    res.json({ success: true });
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const dailyRevenue = db.prepare("SELECT SUM(total_price) as total FROM orders WHERE date(created_at) = ?").get(today) as any;
    const activeOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('BARU', 'PROSES')").get() as any;
    const completedToday = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'SELESAI' AND date(updated_at) = ?").get(today) as any;
    
    res.json({
      revenue: dailyRevenue?.total || 0,
      activeOrders: activeOrders?.count || 0,
      completedToday: completedToday?.count || 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
