import { create } from 'zustand';
import { Product, Sale, DailyStat } from '../utils/indexedDB';

export interface CartItem extends Product {
  quantity: number;
}

interface AppState {
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: number, product: Product) => void;
  removeProduct: (id: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  // Sales
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  addSale: (sale: Sale) => void;

  // Stats
  todayStats: DailyStat | null;
  setTodayStats: (stats: DailyStat) => void;

  // UI State
  catMood: 'idle' | 'happy' | 'worried' | 'sleeping';
  setCatMood: (mood: 'idle' | 'happy' | 'worried' | 'sleeping') => void;
  showPaymentAnimation: boolean;
  setShowPaymentAnimation: (show: boolean) => void;
  currentView: 'pos' | 'inventory' | 'dashboard';
  setCurrentView: (view: 'pos' | 'inventory' | 'dashboard') => void;
}

export const useStore = create<AppState>((set) => ({
  // Products
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...product, id } : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Cart
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  updateCartQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.id !== productId) };
      }
      return {
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        ),
      };
    }),
  clearCart: () => set({ cart: [] }),

  // Sales
  sales: [],
  setSales: (sales) => set({ sales }),
  addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),

  // Stats
  todayStats: null,
  setTodayStats: (stats) => set({ todayStats: stats }),

  // UI State
  catMood: 'idle',
  setCatMood: (mood) => set({ catMood: mood }),
  showPaymentAnimation: false,
  setShowPaymentAnimation: (show) => set({ showPaymentAnimation: show }),
  currentView: 'pos',
  setCurrentView: (view) => set({ currentView: view }),
}));
