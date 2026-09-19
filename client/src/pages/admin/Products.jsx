import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice, slugify } from '../../utils/formatters';
import './Admin.css';

const CATEGORIES = ['Running', 'Basketball', 'Lifestyle', 'Skate'];
const DEFAULT_SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    slug: '',
    category: 'Lifestyle',
    description: '',
    price: '',
    images: '',
    colorways: '',
    isFeatured: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      slug: '',
      category: 'Lifestyle',
      description: '',
      price: '',
      images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      colorways: 'Black, White',
      isFeatured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      brand: p.brand,
      slug: p.slug,
      category: p.category,
      description: p.description,
      price: p.price,
      images: p.images?.join(', ') || '',
      colorways: p.colorways?.join(', ') || '',
      isFeatured: !!p.isFeatured,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      slug: formData.slug || slugify(formData.name),
      images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
      colorways: formData.colorways.split(',').map((s) => s.trim()).filter(Boolean),
      sizes: DEFAULT_SIZES,
    };

    try {
      if (editingProduct) {
        const { data } = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts(products.map((p) => (p._id === data._id ? data : p)));
      } else {
        // build base variant stock map
        const stockMap = {};
        for (const cw of payload.colorways) {
          for (const sz of payload.sizes) {
            const formattedSize = sz.toString().replace('.', '_');
            stockMap[`${cw}-${formattedSize}`] = 10;
          }
        }
        payload.stock = stockMap;

        const { data } = await api.post('/products', payload);
        setProducts([data, ...products]);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <h1 className="text-headline">Product Inventory</h1>
          <p className="text-muted text-sm">Manage sneaker catalog, prices, and drop features.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          + Add New Product
        </button>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '4rem auto' }} />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="admin-table-thumb">
                      <img src={p.images?.[0]} alt={p.name} />
                    </div>
                  </td>
                  <td className="font-semibold">{p.name}</td>
                  <td>{p.brand}</td>
                  <td><span className="badge badge-surface">{p.category}</span></td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.isFeatured ? <span className="badge badge-orange">Featured</span> : 'No'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(p)}>
                        Edit
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--clr-error)' }} onClick={() => handleDelete(p._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal__title">{editingProduct ? 'Edit Sneaker' : 'New Drop Registration'}</h2>
            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="Air Max Pulse"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    required
                    className="form-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Nike"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="149.99"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URLs (comma separated)</label>
                <input
                  className="form-input"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..., https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Colorways (comma separated)</label>
                <input
                  className="form-input"
                  value={formData.colorways}
                  onChange={(e) => setFormData({ ...formData, colorways: e.target.value })}
                  placeholder="Volt, Core Black, Cloud White"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description and craftsmanship details..."
                />
              </div>

              <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <label htmlFor="featured-check" className="text-sm">Highlight as Featured Drop</label>
              </div>

              <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
