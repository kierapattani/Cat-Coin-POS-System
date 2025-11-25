import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';
import { Product } from '../utils/indexedDB';
import KawaiiCard from '../components/KawaiiCard';
import KawaiiButton from '../components/KawaiiButton';
import KawaiiInput from '../components/KawaiiInput';
import CatCharacter from '../components/CatCharacter';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import './Inventory.css';

export default function Inventory() {
  const { products, setProducts, setCatMood } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    emoji: '',
  });

  useEffect(() => {
    loadProducts();
    checkLowStock();
  }, []);

  useEffect(() => {
    if (lowStockProducts.length > 0) {
      setCatMood('worried');
    }
  }, [lowStockProducts]);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const checkLowStock = async () => {
    try {
      const lowStock = await api.getLowStockProducts(10);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Failed to check low stock:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Product = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      emoji: formData.emoji || '📦',
    };

    try {
      if (editingProduct && editingProduct.id) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.createProduct(productData);
      }

      loadProducts();
      checkLowStock();
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      emoji: product.emoji,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        loadProducts();
        checkLowStock();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', stock: '', emoji: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p className="subtitle">Manage your paw-some products</p>
        </div>
        <CatCharacter />
      </div>

      {lowStockProducts.length > 0 && (
        <KawaiiCard className="low-stock-alert">
          <div className="alert-header">
            <AlertTriangle size={24} color="#FF6B7A" />
            <h3>Low Stock Alert!</h3>
          </div>
          <div className="low-stock-items">
            {lowStockProducts.map(product => (
              <div key={product.id} className="low-stock-item">
                <span>{product.emoji} {product.name}</span>
                <span className="stock-count">{product.stock} left</span>
              </div>
            ))}
          </div>
        </KawaiiCard>
      )}

      <div className="inventory-actions">
        <KawaiiButton
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </KawaiiButton>
      </div>

      {showForm && (
        <KawaiiCard className="product-form">
          <h2>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <KawaiiInput
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Catnip Latte"
              />
              <KawaiiInput
                label="Emoji"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="☕"
                maxLength={2}
              />
              <KawaiiInput
                label="Price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="4.50"
              />
              <KawaiiInput
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                placeholder="50"
              />
              <KawaiiInput
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                placeholder="Drinks"
              />
            </div>
            <div className="form-actions">
              <KawaiiButton type="submit" variant="success">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </KawaiiButton>
              <KawaiiButton type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </KawaiiButton>
            </div>
          </form>
        </KawaiiCard>
      )}

      <div className="products-table">
        <KawaiiCard>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className={product.stock <= 10 ? 'low-stock-row' : ''}>
                  <td>
                    <div className="product-cell">
                      <span className="product-emoji-small">{product.emoji}</span>
                      {product.name}
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className="price-cell">${product.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-badge ${product.stock <= 10 ? 'low' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(product.id!)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </KawaiiCard>
      </div>
    </div>
  );
}
