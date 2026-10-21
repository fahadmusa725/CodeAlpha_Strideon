import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { formatPrice, slugify } from '../../utils/formatters';
import './Dashboard.css';
import './Admin.css';

const CATEGORIES = ['All', 'Running', 'Basketball', 'Lifestyle', 'Skate'];
const STOCK_FILTERS = ['All', 'In stock', 'Low stock', 'Out of stock'];
const DEFAULT_SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];
const ITEMS_PER_PAGE = 10;

function computeTotalStock(stock) {
  if (!stock) return 0;
  if (stock instanceof Map) {
    let sum = 0;
    for (const val of stock.values()) {
      sum += Number(val) || 0;
    }
    return sum;
  }
  return Object.values(stock).reduce((acc, val) => acc + (Number(val) || 0), 0);
}

function getStockIndicator(total) {
  if (total <= 0) return { label: 'Out of stock', dotClass: 'stock-dot--out', key: 'out' };
  if (total <= 15) return { label: 'Low stock', dotClass: 'stock-dot--low', key: 'low' };
  return { label: 'In stock', dotClass: 'stock-dot--ok', key: 'ok' };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer (Add / Edit)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formGlobalError, setFormGlobalError] = useState('');

  // Form State
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
    stock: {},
  });

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All' || p.category === categoryFilter;

      const totalStock = computeTotalStock(p.stock);
      const indicator = getStockIndicator(totalStock);

      let matchesStock = true;
      if (stockFilter === 'In stock') matchesStock = totalStock > 15;
      else if (stockFilter === 'Low stock') matchesStock = totalStock > 0 && totalStock <= 15;
      else if (stockFilter === 'Out of stock') matchesStock = totalStock <= 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter]);

  // Open Drawer for Add
  const openCreateDrawer = () => {
    setEditingProduct(null);
    setFormErrors({});
    setFormGlobalError('');
    const defaultColorways = ['Black', 'White'];
    const initialStock = {};
    for (const cw of defaultColorways) {
      for (const sz of DEFAULT_SIZES) {
        const key = `${cw}-${sz.toString().replace('.', '_')}`;
        initialStock[key] = 10;
      }
    }

    setFormData({
      name: '',
      brand: '',
      slug: '',
      category: 'Lifestyle',
      description: '',
      price: '',
      images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      colorways: defaultColorways.join(', '),
      isFeatured: false,
      stock: initialStock,
    });
    setDrawerOpen(true);
  };

  // Open Drawer for Edit
  const openEditDrawer = (p) => {
    setEditingProduct(p);
    setFormErrors({});
    setFormGlobalError('');

    const existingStock = p.stock instanceof Map
      ? Object.fromEntries(p.stock)
      : (p.stock || {});

    setFormData({
      name: p.name,
      brand: p.brand,
      slug: p.slug,
      category: p.category,
      description: p.description,
      price: p.price.toString(),
      images: p.images?.join(', ') || '',
      colorways: p.colorways?.join(', ') || '',
      isFeatured: !!p.isFeatured,
      stock: { ...existingStock },
    });
    setDrawerOpen(true);
  };

  // Handle Featured Toggle directly from Table
  const handleToggleFeatured = async (p, e) => {
    e.stopPropagation();
    const newFeatured = !p.isFeatured;
    try {
      const { data } = await api.put(`/products/${p._id}`, { isFeatured: newFeatured });
      setProducts(products.map((item) => (item._id === data._id ? data : item)));
      showToast(newFeatured ? 'Product marked as featured' : 'Product unfeatured');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update featured flag', 'error');
    }
  };

  // Stock editor change handler
  const handleStockCellChange = (colorway, size, val) => {
    const key = `${colorway}-${size.toString().replace('.', '_')}`;
    const num = Math.max(0, parseInt(val, 10) || 0);
    setFormData((prev) => ({
      ...prev,
      stock: {
        ...prev.stock,
        [key]: num,
      },
    }));
  };

  // Form Validation & Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.brand.trim()) errors.brand = 'Brand is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.description.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormGlobalError('');

    const colorwaysArr = formData.colorways
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      slug: formData.slug.trim() || slugify(formData.name),
      category: formData.category,
      description: formData.description.trim(),
      price: Number(formData.price),
      images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
      colorways: colorwaysArr,
      sizes: DEFAULT_SIZES,
      isFeatured: formData.isFeatured,
    };

    // Ensure stock has keys for all colorways and sizes
    const stockMap = { ...formData.stock };
    for (const cw of colorwaysArr) {
      for (const sz of DEFAULT_SIZES) {
        const key = `${cw}-${sz.toString().replace('.', '_')}`;
        if (stockMap[key] === undefined) {
          stockMap[key] = 10;
        }
      }
    }
    payload.stock = stockMap;

    try {
      if (editingProduct) {
        const { data } = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts(products.map((p) => (p._id === data._id ? data : p)));
        showToast('Product updated successfully');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts([data, ...products]);
        showToast('Product created successfully');
      }
      setDrawerOpen(false);
    } catch (err) {
      setFormGlobalError(err.response?.data?.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      setProducts(products.filter((p) => p._id !== deleteTarget._id));
      showToast('Product removed');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Colorways parsed for stock matrix
  const currentColorways = useMemo(() => {
    return formData.colorways
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formData.colorways]);

  const startCount = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endCount = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <div className="admin-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          <div className="admin-search-wrap">
            <span className="admin-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="admin-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            {STOCK_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All stock levels' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-toolbar__actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreateDrawer}>
            + Add product
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="admin-error-box">
          <span>{error}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="admin-card--table">
        <div className="admin-table-wrap" style={{ border: 'none' }}>
          <table className="admin-dense-table">
            <thead>
              <tr>
                <th style={{ width: '56px' }}>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th className="th-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="admin-skeleton" style={{ width: '38px', height: '38px', borderRadius: '4px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '160px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '70px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '60px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '90px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '50px', height: '16px' }} /></td>
                    <td className="td-action"><div className="admin-skeleton" style={{ width: '100px', height: '24px', marginLeft: 'auto' }} /></td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="admin-empty-state">
                      No products match your active search and filter criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const totalStock = computeTotalStock(p.stock);
                  const ind = getStockIndicator(totalStock);
                  return (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.images?.[0] || '/placeholder.png'}
                          alt={p.name}
                          className="product-row-thumb"
                        />
                      </td>
                      <td>
                        <div className="product-row-meta">
                          <span className="product-row-title">{p.name}</span>
                          <span className="product-row-brand">{p.brand}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-cat-badge">{p.category}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(p.price)}</td>
                      <td>
                        <div className="stock-indicator" title={`${totalStock} total units across all sizes`}>
                          <span className={`stock-dot ${ind.dotClass}`} />
                          <span>{totalStock} units</span>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="featured-toggle-btn"
                          onClick={(e) => handleToggleFeatured(p, e)}
                          title="Toggle featured drop"
                        >
                          {p.isFeatured ? (
                            <span className="badge-featured">Featured</span>
                          ) : (
                            <span className="badge-not-featured">Standard</span>
                          )}
                        </button>
                      </td>
                      <td className="td-action">
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditDrawer(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#ef4444', borderColor: 'transparent' }}
                            onClick={() => setDeleteTarget(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && filteredProducts.length > 0 && (
          <div className="admin-pagination">
            <span>
              Showing {startCount} to {endCount} of {filteredProducts.length}
            </span>

            <div className="admin-pagination__controls">
              <button
                type="button"
                className="admin-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`admin-page-btn ${currentPage === pageNum ? 'admin-page-btn--active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className="admin-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right-Side Drawer (Add / Edit) */}
      {drawerOpen && (
        <>
          <div
            className="admin-drawer-backdrop"
            onClick={() => !submitting && setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="admin-drawer" aria-labelledby="drawer-heading">
            <div className="admin-drawer__header">
              <h2 id="drawer-heading" className="admin-drawer__title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                className="admin-drawer__close"
                onClick={() => !submitting && setDrawerOpen(false)}
                aria-label="Close drawer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="admin-drawer__body">
                {formGlobalError && (
                  <div className="admin-error-box" style={{ padding: '0.65rem 1rem' }}>
                    <span>{formGlobalError}</span>
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          name: val,
                          slug: editingProduct ? formData.slug : slugify(val),
                        });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                      }}
                      placeholder="Air Max Pulse"
                    />
                    {formErrors.name && <span className="form-field-error">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand *</label>
                    <input
                      className={`form-input ${formErrors.brand ? 'error' : ''}`}
                      value={formData.brand}
                      onChange={(e) => {
                        setFormData({ ...formData, brand: e.target.value });
                        if (formErrors.brand) setFormErrors({ ...formErrors, brand: '' });
                      }}
                      placeholder="Nike"
                    />
                    {formErrors.brand && <span className="form-field-error">{formErrors.brand}</span>}
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
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-input ${formErrors.price ? 'error' : ''}`}
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: e.target.value });
                        if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                      }}
                      placeholder="149.99"
                    />
                    {formErrors.price && <span className="form-field-error">{formErrors.price}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    placeholder="air-max-pulse"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URLs (comma separated)</label>
                  <input
                    className="form-input"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="/products/running1.avif, /products/running2.jpeg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Colorways (comma separated)</label>
                  <input
                    className="form-input"
                    value={formData.colorways}
                    onChange={(e) => setFormData({ ...formData, colorways: e.target.value })}
                    placeholder="Core Black, Cloud White, Volt"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    rows="3"
                    className={`form-input ${formErrors.description ? 'error' : ''}`}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                    }}
                    placeholder="Craftsmanship, silhouette details, and materials..."
                  />
                  {formErrors.description && <span className="form-field-error">{formErrors.description}</span>}
                </div>

                {/* Per-Colorway and Size Stock Editor */}
                <div className="drawer-section">
                  <span className="drawer-section__title">Per-Size Stock Matrix</span>
                  <div className="stock-matrix-wrap">
                    {currentColorways.length === 0 ? (
                      <span className="text-muted text-xs">Enter colorways above to configure inventory.</span>
                    ) : (
                      currentColorways.map((cw) => (
                        <div key={cw} className="stock-colorway-block">
                          <span className="stock-colorway-name">{cw}</span>
                          <div className="stock-sizes-grid">
                            {DEFAULT_SIZES.map((sz) => {
                              const key = `${cw}-${sz.toString().replace('.', '_')}`;
                              const val = formData.stock[key] ?? 10;
                              return (
                                <div key={sz} className="stock-size-cell">
                                  <span className="stock-size-label">US {sz}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    className="stock-size-input"
                                    value={val}
                                    onChange={(e) => handleStockCellChange(cw, sz, e.target.value)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <label htmlFor="featured-check" className="text-sm font-semibold">
                    Highlight as Featured Drop
                  </label>
                </div>
              </div>

              <div className="admin-drawer__footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={submitting}
                  onClick={() => setDrawerOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      {/* Confirmation Dialog for Delete */}
      {deleteTarget && (
        <div className="admin-dialog-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-dialog__title">Delete Product</h3>
            <p className="admin-dialog__desc">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the catalog? This action cannot be undone.
            </p>
            <div className="admin-dialog__actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? 'Deleting...' : 'Delete product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
