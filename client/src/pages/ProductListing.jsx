import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import './ProductListing.css';

const CATEGORIES = ['All', 'Running', 'Basketball', 'Lifestyle', 'Skate'];
const SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];
const SORT_OPTIONS = [
  { label: 'Newest Drops', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSize = searchParams.get('size') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [maxPrice, setMaxPrice] = useState(maxPriceParam || 250);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCategory && currentCategory !== 'All') params.set('category', currentCategory);
      if (currentSort) params.set('sort', currentSort);
      if (currentSize) params.set('size', currentSize);
      if (maxPriceParam) params.set('maxPrice', maxPriceParam);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'All') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next);
  };

  const handlePriceCommit = () => {
    updateParam('maxPrice', maxPrice);
  };

  const clearFilters = () => {
    setMaxPrice(250);
    setSearchParams({});
  };

  return (
    <div className="product-listing container">
      <div className="product-listing__header">
        <div>
          <h1 className="text-headline">
            {currentCategory === 'All' ? 'All Sneaker Drops' : `${currentCategory} Collection`}
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>
            Showing {loading ? '...' : products.length} of {total} products
          </p>
        </div>

        <div className="sort-wrapper">
          <label htmlFor="sort-select" className="text-upper text-muted text-xs">Sort By</label>
          <select
            id="sort-select"
            className="form-select sort-select"
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="product-listing__grid-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-sidebar__head">
            <h3 className="filters-sidebar__title">Filters</h3>
            <button className="filters-clear-btn" onClick={clearFilters}>
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-group__title">Category</h4>
            <div className="filter-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip ${currentCategory === cat ? 'filter-chip--active' : ''}`}
                  onClick={() => updateParam('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
              <h4 className="filter-group__title">Max Price</h4>
              <span className="price-tag font-mono text-orange">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onMouseUp={handlePriceCommit}
              onTouchEnd={handlePriceCommit}
              className="price-range-slider"
            />
            <div className="flex justify-between text-xs text-muted" style={{ marginTop: '0.25rem' }}>
              <span>$50</span>
              <span>$300</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="filter-group">
            <h4 className="filter-group__title">Size (US)</h4>
            <div className="size-filter-grid">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  className={`size-filter-btn ${Number(currentSize) === sz ? 'size-filter-btn--active' : ''}`}
                  onClick={() => updateParam('size', Number(currentSize) === sz ? '' : sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="product-grid-area">
          {loading ? (
            <div className="grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-listing">
              <span className="empty-listing__icon">⚡</span>
              <h3>No kicks match your filter criteria</h3>
              <p className="text-muted">Try relaxing your price limits or switching categories.</p>
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
