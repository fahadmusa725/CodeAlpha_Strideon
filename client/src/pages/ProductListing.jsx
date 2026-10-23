import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import './ProductListing.css';

const CATEGORIES = ['All', 'Running', 'Basketball', 'Lifestyle', 'Skate'];
const SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filterButtonRef = useRef(null);
  const sheetRef = useRef(null);
  const closeButtonRef = useRef(null);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSize = searchParams.get('size') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentBrandParam = searchParams.get('brand') || '';
  const inStockParam = searchParams.get('inStock') || '';
  const isInStockOnly = inStockParam === 'true';

  const selectedBrands = currentBrandParam
    ? currentBrandParam
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)
    : [];

  const [maxPrice, setMaxPrice] = useState(maxPriceParam || 250);

  // Load available brands from full product set once
  useEffect(() => {
    let isMounted = true;
    api
      .get('/products?limit=100')
      .then(({ data }) => {
        if (!isMounted) return;
        const brandSet = new Set();
        (data.products || []).forEach((p) => {
          if (p.brand) brandSet.add(p.brand);
        });
        setAvailableBrands(Array.from(brandSet).sort());
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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
      if (currentSearch) params.set('q', currentSearch);
      if (currentBrandParam) params.set('brand', currentBrandParam);
      if (isInStockOnly) params.set('inStock', 'true');

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

  const toggleBrand = (brand) => {
    const exists = selectedBrands.some((b) => b.toLowerCase() === brand.toLowerCase());
    let nextBrands;
    if (exists) {
      nextBrands = selectedBrands.filter((b) => b.toLowerCase() !== brand.toLowerCase());
    } else {
      nextBrands = [...selectedBrands, brand];
    }
    updateParam('brand', nextBrands.join(','));
  };

  const toggleInStock = () => {
    updateParam('inStock', isInStockOnly ? '' : 'true');
  };

  const handlePriceCommit = () => {
    updateParam('maxPrice', maxPrice);
  };

  const clearFilters = () => {
    setMaxPrice(250);
    const next = new URLSearchParams();
    if (currentSearch) next.set('q', currentSearch);
    if (currentSort && currentSort !== 'newest') next.set('sort', currentSort);
    setSearchParams(next);
  };

  // Count active filter groups (excluding search query and sorting)
  let activeFilterCount = 0;
  if (currentCategory && currentCategory !== 'All') activeFilterCount += 1;
  if (currentSize) activeFilterCount += 1;
  if (maxPriceParam && Number(maxPriceParam) < 250) activeFilterCount += 1;
  if (selectedBrands.length > 0) activeFilterCount += selectedBrands.length;
  if (isInStockOnly) activeFilterCount += 1;

  // Handle focus trapping and body scroll locking for the mobile bottom sheet
  useEffect(() => {
    if (!sheetOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button inside sheet
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSheetOpen(false);
        return;
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusableElements = sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to opener button
      if (filterButtonRef.current) {
        filterButtonRef.current.focus();
      }
    };
  }, [sheetOpen]);

  const getPageTitle = () => {
    if (currentSearch) return `Search results for "${currentSearch}"`;
    if (currentCategory === 'All') return 'All products';
    return `${currentCategory} collection`;
  };

  const renderFilterGroups = (isMobileSheet = false) => (
    <>
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

      {availableBrands.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-group__title">Brand</h4>
          <div className="filter-chips">
            {availableBrands.map((b) => {
              const active = selectedBrands.some((sb) => sb.toLowerCase() === b.toLowerCase());
              return (
                <button
                  key={b}
                  className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
                  onClick={() => toggleBrand(b)}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          aria-label="Filter by maximum price"
        />
        <div className="flex justify-between text-xs text-muted" style={{ marginTop: '0.25rem' }}>
          <span>$50</span>
          <span>$300</span>
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-group__title">Availability</h4>
        <label className="instock-toggle-label">
          <input
            type="checkbox"
            className="instock-toggle-input"
            checked={isInStockOnly}
            onChange={toggleInStock}
          />
          <span className="instock-toggle-custom" />
          <span className="instock-toggle-text">In stock only</span>
        </label>
      </div>

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
    </>
  );

  return (
    <div className="product-listing container">
      <div className="product-listing__header">
        <div>
          <h1 className="text-headline">{getPageTitle()}</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>
            Showing {loading ? '...' : products.length} of {total} products
          </p>
        </div>

        <div className="sort-wrapper sort-wrapper--desktop">
          <label htmlFor="sort-select-desktop" className="text-upper text-muted text-xs">Sort by</label>
          <select
            id="sort-select-desktop"
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

      {/* Mobile Toolbar (up to 900px) */}
      <div className="mobile-toolbar">
        <button
          ref={filterButtonRef}
          type="button"
          className="btn btn-outline mobile-filter-btn"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          id="mobile-filters-trigger"
        >
          <FilterIcon />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="mobile-filter-badge">{activeFilterCount}</span>
          )}
        </button>

        <div className="mobile-sort-wrapper">
          <select
            id="sort-select-mobile"
            className="form-select mobile-sort-select"
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="mobile-active-chips" aria-label="Active filters">
          {currentCategory && currentCategory !== 'All' && (
            <button
              type="button"
              className="active-filter-chip"
              onClick={() => updateParam('category', 'All')}
            >
              <span>Category: {currentCategory}</span>
              <span className="active-filter-chip__remove">x</span>
            </button>
          )}

          {selectedBrands.map((b) => (
            <button
              key={b}
              type="button"
              className="active-filter-chip"
              onClick={() => toggleBrand(b)}
            >
              <span>Brand: {b}</span>
              <span className="active-filter-chip__remove">x</span>
            </button>
          ))}

          {maxPriceParam && Number(maxPriceParam) < 250 && (
            <button
              type="button"
              className="active-filter-chip"
              onClick={() => {
                setMaxPrice(250);
                updateParam('maxPrice', '');
              }}
            >
              <span>Max: ${maxPriceParam}</span>
              <span className="active-filter-chip__remove">x</span>
            </button>
          )}

          {currentSize && (
            <button
              type="button"
              className="active-filter-chip"
              onClick={() => updateParam('size', '')}
            >
              <span>Size: {currentSize}</span>
              <span className="active-filter-chip__remove">x</span>
            </button>
          )}

          {isInStockOnly && (
            <button
              type="button"
              className="active-filter-chip"
              onClick={toggleInStock}
            >
              <span>In stock only</span>
              <span className="active-filter-chip__remove">x</span>
            </button>
          )}

          <button
            type="button"
            className="active-filter-clear-all"
            onClick={clearFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet Modal */}
      {sheetOpen && (
        <>
          <div
            className="bottom-sheet-backdrop"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={sheetRef}
            className="bottom-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
          >
            <div className="bottom-sheet__header">
              <h3 id="sheet-title" className="bottom-sheet__title">Filters</h3>
              <button
                ref={closeButtonRef}
                type="button"
                className="bottom-sheet__close"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="bottom-sheet__body">
              {renderFilterGroups(true)}
            </div>

            <div className="bottom-sheet__footer">
              <button
                type="button"
                className="btn btn-outline btn-lg bottom-sheet__reset-btn"
                onClick={clearFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg bottom-sheet__apply-btn"
                onClick={() => setSheetOpen(false)}
              >
                Show {total} products
              </button>
            </div>
          </div>
        </>
      )}

      <div className="product-listing__grid-layout">
        <aside className="filters-sidebar">
          <div className="filters-sidebar__head">
            <h3 className="filters-sidebar__title">Filters</h3>
            <button className="filters-clear-btn" onClick={clearFilters}>
              Reset
            </button>
          </div>

          {renderFilterGroups(false)}
        </aside>

        <main className="product-grid-area">
          {loading ? (
            <div className="grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-listing">
              <h3>No products match your criteria</h3>
              <p className="text-muted">Try clearing search terms or relaxing filter options.</p>
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                Clear filters
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

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}
