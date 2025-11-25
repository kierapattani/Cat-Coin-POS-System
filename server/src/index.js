import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

let db;
const dbPath = join(__dirname, '../catcoin.db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
async function initDatabase() {
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      stock INTEGER DEFAULT 0,
      emoji TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      payment_method TEXT NOT NULL,
      items TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      total_sales REAL DEFAULT 0,
      order_count INTEGER DEFAULT 0,
      treats_eaten INTEGER DEFAULT 0
    )
  `);

  const count = db.exec('SELECT COUNT(*) as count FROM products')[0];
  if (!count || count.values[0][0] === 0) {
    seedData();
  }

  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  writeFileSync(dbPath, data);
}

function seedData() {
  const products = [
    { name: 'Catnip Latte', price: 4.50, category: 'Drinks', stock: 50, emoji: '☕' },
    { name: 'Tuna Sandwich', price: 7.99, category: 'Food', stock: 30, emoji: '🥪' },
    { name: 'Salmon Sushi Roll', price: 12.99, category: 'Food', stock: 25, emoji: '🍱' },
    { name: 'Milk Tea', price: 5.50, category: 'Drinks', stock: 40, emoji: '🧋' },
    { name: 'Fish Cookies', price: 3.99, category: 'Snacks', stock: 60, emoji: '🍪' },
    { name: 'Paw-cakes', price: 8.99, category: 'Food', stock: 20, emoji: '🥞' },
    { name: 'Meow Muffin', price: 4.25, category: 'Snacks', stock: 35, emoji: '🧁' },
    { name: 'Kitty Smoothie', price: 6.50, category: 'Drinks', stock: 45, emoji: '🥤' },
    { name: 'Purr-rito', price: 9.99, category: 'Food', stock: 28, emoji: '🌯' },
    { name: 'Cat Cake Slice', price: 5.99, category: 'Desserts', stock: 22, emoji: '🍰' },
  ];

  const stmt = db.prepare('INSERT INTO products (name, price, category, stock, emoji) VALUES (?, ?, ?, ?, ?)');
  for (const product of products) {
    stmt.run([product.name, product.price, product.category, product.stock, product.emoji]);
  }
  stmt.free();
  saveDatabase();
}

// API Routes
app.get('/api/products', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM products ORDER BY category, name');
    const products = result[0] ? result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      category: row[3],
      stock: row[4],
      emoji: row[5],
      created_at: row[6]
    })) : [];
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!result[0] || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const row = result[0].values[0];
    res.json({
      id: row[0],
      name: row[1],
      price: row[2],
      category: row[3],
      stock: row[4],
      emoji: row[5],
      created_at: row[6]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, price, category, stock, emoji } = req.body;
    db.run(
      'INSERT INTO products (name, price, category, stock, emoji) VALUES (?, ?, ?, ?, ?)',
      [name, price, category, stock || 0, emoji || '📦']
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM products WHERE id = last_insert_rowid()');
    const row = result[0].values[0];
    res.status(201).json({
      id: row[0],
      name: row[1],
      price: row[2],
      category: row[3],
      stock: row[4],
      emoji: row[5],
      created_at: row[6]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { name, price, category, stock, emoji } = req.body;
    db.run(
      'UPDATE products SET name = ?, price = ?, category = ?, stock = ?, emoji = ? WHERE id = ?',
      [name, price, category, stock, emoji, req.params.id]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!result[0] || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const row = result[0].values[0];
    res.json({
      id: row[0],
      name: row[1],
      price: row[2],
      category: row[3],
      stock: row[4],
      emoji: row[5],
      created_at: row[6]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', (req, res) => {
  try {
    const { total, subtotal, tax, payment_method, items } = req.body;

    db.run(
      'INSERT INTO sales (total, subtotal, tax, payment_method, items) VALUES (?, ?, ?, ?, ?)',
      [total, subtotal, tax, payment_method, JSON.stringify(items)]
    );

    for (const item of items) {
      db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }

    const today = new Date().toISOString().split('T')[0];
    const treats = Math.floor(total);

    const existingStats = db.exec('SELECT * FROM daily_stats WHERE date = ?', [today]);

    if (existingStats[0] && existingStats[0].values.length > 0) {
      db.run(
        'UPDATE daily_stats SET total_sales = total_sales + ?, order_count = order_count + 1, treats_eaten = treats_eaten + ? WHERE date = ?',
        [total, treats, today]
      );
    } else {
      db.run(
        'INSERT INTO daily_stats (date, total_sales, order_count, treats_eaten) VALUES (?, ?, ?, ?)',
        [today, total, 1, treats]
      );
    }

    saveDatabase();

    const result = db.exec('SELECT * FROM sales WHERE id = last_insert_rowid()');
    const row = result[0].values[0];
    res.status(201).json({
      id: row[0],
      total: row[1],
      subtotal: row[2],
      tax: row[3],
      payment_method: row[4],
      items: JSON.parse(row[5]),
      created_at: row[6]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM sales ORDER BY created_at DESC');
    const sales = result[0] ? result[0].values.map(row => ({
      id: row[0],
      total: row[1],
      subtotal: row[2],
      tax: row[3],
      payment_method: row[4],
      items: JSON.parse(row[5]),
      created_at: row[6]
    })) : [];
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = db.exec('SELECT * FROM daily_stats WHERE date = ?', [today]);

    let stats;
    if (result[0] && result[0].values.length > 0) {
      const row = result[0].values[0];
      stats = {
        id: row[0],
        date: row[1],
        total_sales: row[2],
        order_count: row[3],
        treats_eaten: row[4]
      };
    } else {
      stats = { date: today, total_sales: 0, order_count: 0, treats_eaten: 0 };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/range', (req, res) => {
  try {
    const { start, end } = req.query;
    const result = db.exec(
      'SELECT * FROM daily_stats WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [start, end]
    );

    const stats = result[0] ? result[0].values.map(row => ({
      id: row[0],
      date: row[1],
      total_sales: row[2],
      order_count: row[3],
      treats_eaten: row[4]
    })) : [];

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/low-stock', (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const result = db.exec('SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC', [threshold]);

    const products = result[0] ? result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      category: row[3],
      stock: row[4],
      emoji: row[5],
      created_at: row[6]
    })) : [];

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export/sales/csv', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM sales ORDER BY created_at DESC');

    let csv = 'ID,Date,Subtotal,Tax,Total,Payment Method,Items\n';

    if (result[0]) {
      for (const row of result[0].values) {
        const items = JSON.parse(row[5]);
        const itemsStr = items.map(item => `${item.name}(${item.quantity})`).join('; ');
        csv += `${row[0]},${row[6]},${row[2]},${row[3]},${row[1]},${row[4]},"${itemsStr}"\n`;
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export/sales/json', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM sales ORDER BY created_at DESC');

    const sales = result[0] ? result[0].values.map(row => ({
      id: row[0],
      total: row[1],
      subtotal: row[2],
      tax: row[3],
      payment_method: row[4],
      items: JSON.parse(row[5]),
      created_at: row[6]
    })) : [];

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=sales.json');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🐱 Cat Coin Server running on http://localhost:${PORT}`);
  });
});
