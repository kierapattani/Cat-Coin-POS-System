import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';
import KawaiiCard from '../components/KawaiiCard';
import KawaiiButton from '../components/KawaiiButton';
import CatCharacter from '../components/CatCharacter';
import XReport from '../components/XReport';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, FileText } from 'lucide-react';
import './POSRegister.css';

const TAX_RATE = 0.08;

export default function POSRegister() {
  const { products, setProducts, cart, addToCart, updateCartQuantity, removeFromCart, clearCart, setCatMood, setShowPaymentAnimation, todayStats, setTodayStats } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showXReport, setShowXReport] = useState(false);

  useEffect(() => {
    loadProducts();
    loadTodayStats();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const stats = await api.getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleProcessPayment = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);

    try {
      const sale = {
        subtotal,
        tax,
        total,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      await api.createSale(sale);

      setShowPaymentAnimation(true);
      setCatMood('happy');

      setTimeout(() => {
        setShowPaymentAnimation(false);
        setCatMood('idle');
        clearCart();
        loadProducts();
        loadTodayStats();
        setIsProcessing(false);
      }, 2500);
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="pos-register">
      <div className="pos-header">
        <div className="pos-title">
          <h1>Cat Coin Register</h1>
          <div className="treats-counter">
            <span className="treat-emoji">🍪</span>
            <span className="treat-count">{todayStats?.treats_eaten || 0} treats eaten today</span>
          </div>
          <button className="xreport-btn" onClick={() => setShowXReport(true)}>
            <FileText size={20} />
            <span>X-REPORT</span>
          </button>
        </div>
        <CatCharacter />
      </div>
      <XReport isOpen={showXReport} onClose={() => setShowXReport(false)} />

      <div className="pos-content">
        <div className="products-section">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <KawaiiCard
                key={product.id}
                hoverable
                onClick={() => product.stock > 0 && addToCart(product)}
                className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
              >
                <div className="product-emoji">{product.emoji}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-price">${product.price.toFixed(2)}</div>
                <div className="product-stock">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </KawaiiCard>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <KawaiiCard className="cart-card">
            <div className="cart-header">
              <ShoppingCart size={24} />
              <h2>Cart</h2>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cat">(=｀ω´=)</div>
                  <p>Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-emoji">{item.emoji}</span>
                      <div className="cart-item-details">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateCartQuantity(item.id!, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateCartQuantity(item.id!, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id!)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="cart-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="total-row total">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="payment-method">
                  <label>Payment Method:</label>
                  <div className="payment-buttons">
                    <button
                      className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard size={20} />
                      Card
                    </button>
                    <button
                      className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <DollarSign size={20} />
                      Cash
                    </button>
                  </div>
                </div>

                <KawaiiButton
                  variant="success"
                  size="large"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="checkout-btn"
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </KawaiiButton>
              </>
            )}
          </KawaiiCard>
        </div>
      </div>
    </div>
  );
}
