import { db, Product, Sale, DailyStat } from './indexedDB';

const API_URL = 'http://localhost:3000/api';
const USE_INDEXEDDB = import.meta.env.PROD;

// Database initialization promise
let dbInitPromise: Promise<void> | null = null;

// Initialize database if using IndexedDB
if (USE_INDEXEDDB) {
  dbInitPromise = db.init().then(() => db.seedData());
}

async function ensureDbReady() {
  if (USE_INDEXEDDB && dbInitPromise) {
    await dbInitPromise;
  }
}

export const api = {
  // Products
  async getProducts(): Promise<Product[]> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      return db.getAllProducts();
    }
    const response = await fetch(`${API_URL}/products`);
    return response.json();
  },

  async getProduct(id: number): Promise<Product> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      const product = await db.getProduct(id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    const response = await fetch(`${API_URL}/products/${id}`);
    return response.json();
  },

  async createProduct(product: Product): Promise<Product> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      const id = await db.addProduct(product);
      return { ...product, id };
    }
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  async updateProduct(id: number, product: Product): Promise<Product> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      await db.updateProduct(id, product);
      return { ...product, id };
    }
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  async deleteProduct(id: number): Promise<void> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      await db.deleteProduct(id);
      return;
    }
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  },

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      return db.getLowStockProducts(threshold);
    }
    const response = await fetch(`${API_URL}/products/low-stock?threshold=${threshold}`);
    return response.json();
  },

  // Sales
  async createSale(sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      const id = await db.addSale(sale as Sale);
      return { ...sale, id, created_at: new Date().toISOString() };
    }
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    return response.json();
  },

  async getSales(): Promise<Sale[]> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      return db.getAllSales();
    }
    const response = await fetch(`${API_URL}/sales`);
    return response.json();
  },

  // Stats
  async getTodayStats(): Promise<DailyStat> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      return db.getTodayStats();
    }
    const response = await fetch(`${API_URL}/stats/today`);
    return response.json();
  },

  async getStatsRange(start: string, end: string): Promise<DailyStat[]> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      return db.getStatsRange(start, end);
    }
    const response = await fetch(`${API_URL}/stats/range?start=${start}&end=${end}`);
    return response.json();
  },

  // Export
  async exportSalesCSV(): Promise<void> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      const sales = await db.getAllSales();
      let csv = 'ID,Date,Subtotal,Tax,Total,Payment Method,Items\n';
      sales.forEach((sale) => {
        const itemsStr = sale.items.map(item => `${item.name}(${item.quantity})`).join('; ');
        csv += `${sale.id},${sale.created_at},${sale.subtotal},${sale.tax},${sale.total},${sale.payment_method},"${itemsStr}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sales.csv';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    window.open(`${API_URL}/export/sales/csv`, '_blank');
  },

  async exportSalesJSON(): Promise<void> {
    if (USE_INDEXEDDB) {
      await ensureDbReady();
      const sales = await db.getAllSales();
      const json = JSON.stringify(sales, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sales.json';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    window.open(`${API_URL}/export/sales/json`, '_blank');
  },
};
