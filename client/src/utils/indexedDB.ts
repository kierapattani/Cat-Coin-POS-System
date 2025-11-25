// IndexedDB wrapper for production use
const DB_NAME = 'CatCoinDB';
const DB_VERSION = 1;

export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  emoji: string;
  created_at?: string;
}

export interface Sale {
  id?: number;
  total: number;
  subtotal: number;
  tax: number;
  payment_method: string;
  items: any[];
  created_at?: string;
}

export interface DailyStat {
  id?: number;
  date: string;
  total_sales: number;
  order_count: number;
  treats_eaten: number;
}

class CatCoinDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
          salesStore.createIndex('created_at', 'created_at', { unique: false });
        }

        if (!db.objectStoreNames.contains('daily_stats')) {
          const statsStore = db.createObjectStore('daily_stats', { keyPath: 'id', autoIncrement: true });
          statsStore.createIndex('date', 'date', { unique: true });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const store = this.getStore('products');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const store = this.getStore('products');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addProduct(product: Product): Promise<number> {
    const store = this.getStore('products', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add({ ...product, created_at: new Date().toISOString() });
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProduct(id: number, product: Product): Promise<void> {
    const store = this.getStore('products', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ ...product, id });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProduct(id: number): Promise<void> {
    const store = this.getStore('products', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter(p => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
  }

  // Sales
  async addSale(sale: Sale): Promise<number> {
    const store = this.getStore('sales', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add({ ...sale, created_at: new Date().toISOString() });
      request.onsuccess = async () => {
        // Update product stock
        for (const item of sale.items) {
          const product = await this.getProduct(item.id);
          if (product) {
            await this.updateProduct(item.id, {
              ...product,
              stock: product.stock - item.quantity
            });
          }
        }

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const treats = Math.floor(sale.total);
        await this.updateDailyStats(today, sale.total, treats);

        resolve(request.result as number);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSales(): Promise<Sale[]> {
    const store = this.getStore('sales');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const sales = request.result;
        sales.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
        resolve(sales);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Daily Stats
  private async updateDailyStats(date: string, sales: number, treats: number): Promise<void> {
    const store = this.getStore('daily_stats', 'readwrite');
    const index = store.index('date');

    return new Promise((resolve, reject) => {
      const request = index.get(date);
      request.onsuccess = () => {
        const existing = request.result;
        if (existing) {
          const updated = {
            ...existing,
            total_sales: existing.total_sales + sales,
            order_count: existing.order_count + 1,
            treats_eaten: existing.treats_eaten + treats
          };
          store.put(updated);
        } else {
          store.add({
            date,
            total_sales: sales,
            order_count: 1,
            treats_eaten: treats
          });
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTodayStats(): Promise<DailyStat> {
    const today = new Date().toISOString().split('T')[0];
    const store = this.getStore('daily_stats');
    const index = store.index('date');

    return new Promise((resolve, reject) => {
      const request = index.get(today);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve({ date: today, total_sales: 0, order_count: 0, treats_eaten: 0 });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStatsRange(start: string, end: string): Promise<DailyStat[]> {
    const store = this.getStore('daily_stats');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const stats = request.result.filter((s: DailyStat) => s.date >= start && s.date <= end);
        stats.sort((a: DailyStat, b: DailyStat) => b.date.localeCompare(a.date));
        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Seed initial data
  async seedData(): Promise<void> {
    const products = await this.getAllProducts();
    if (products.length > 0) return;

    const seedProducts: Product[] = [
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

    for (const product of seedProducts) {
      await this.addProduct(product);
    }
  }
}

export const db = new CatCoinDB();
