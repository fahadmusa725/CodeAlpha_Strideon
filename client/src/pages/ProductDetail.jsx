import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import ProductCard from '../components/ui/ProductCard';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);
  const [cartError, setCartError] = useState('');

  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainBtnRef = useRef(null);
  const mobileGalleryRef = useRef(null);

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  // Monitor visibility of the original Add to bag button for mobile sticky bar
  useEffect(() => {
    const target = mainBtnRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sticky bar appears once original button scrolls out of view
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [product, loading]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.colorways?.length) setSelectedColor(data.colorways[0]);
      if (data.sizes?.length) setSelectedSize(data.sizes[0]);

      const relRes = await api.get(`/products?category=${data.category}&limit=3`);
      setRelated(relRes.data.products.filter((p) => p._id !== data._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const getStockCount = (color, size) => {
    if (!product?.stock) return 0;
    const stockMap = product.stock;
    const formattedSize = size.toString().replace('.', '_');
    const key = `${color}-${formattedSize}`;
    return typeof stockMap === 'object' && !(stockMap instanceof Map)
      ? stockMap[key] || 0
      : 0;
  };

  const currentStock = selectedColor && selectedSize ? getStockCount(selectedColor, selectedSize) : 0;

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) return;
    setAdding(true);
    setCartError('');
    try {
      await addItem(product._id, selectedColor, selectedSize, 1, { product, stock: currentStock });
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 3000);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleMobileGalleryScroll = () => {
    const el = mobileGalleryRef.current;
    if (!el || !product?.images?.length) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== selectedImg && index >= 0 && index < product.images.length) {
      setSelectedImg(index);
    }
  };

  const scrollToImage = (i) => {
    setSelectedImg(i);
    const el = mobileGalleryRef.current;
    if (el) {
      el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="container product-detail-loading" style={{ paddingTop: '8rem', minHeight: '60vh' }}>
        <div className="spinner" style={{ margin: 'auto' }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h2>{error || 'Product Not Found'}</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail container">
      <nav className="breadcrumb text-sm text-muted">
        <Link to="/">Home</Link> / <Link to={`/products?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
      </nav>

      <div className="product-detail__grid">
        <div className="gallery-section">
          {/* Desktop single main image */}
          <div className="gallery-main gallery-main--desktop">
            <img
              src={product.images?.[selectedImg] || product.images?.[0]}
              alt={product.name}
              className="gallery-main__img"
            />
          </div>

          {/* Mobile swipeable image gallery with scroll snap */}
          {product.images?.length > 1 ? (
            <div className="gallery-mobile-wrapper">
              <div
                ref={mobileGalleryRef}
                className="gallery-mobile-slider"
                onScroll={handleMobileGalleryScroll}
              >
                {product.images.map((img, i) => (
                  <div key={i} className="gallery-mobile-slide">
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="gallery-main__img" />
                  </div>
                ))}
              </div>
              <div className="gallery-mobile-dots">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`gallery-mobile-dot ${selectedImg === i ? 'gallery-mobile-dot--active' : ''}`}
                    onClick={() => scrollToImage(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="gallery-main gallery-main--mobile-single">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="gallery-main__img"
              />
            </div>
          )}

          {/* Desktop thumbnails */}
          {product.images?.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${selectedImg === i ? 'gallery-thumb--active' : ''}`}
                  onClick={() => scrollToImage(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <p className="text-upper text-orange text-sm">{product.brand}</p>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">{formatPrice(product.price)}</p>

          <p className="product-desc">{product.description}</p>

          {product.colorways?.length > 0 && (
            <div className="detail-option-group">
              <label className="detail-option-label">
                Colorway: <span className="text-white">{selectedColor}</span>
              </label>
              <div className="colorway-selector">
                {product.colorways.map((cw) => (
                  <button
                    key={cw}
                    className={`color-btn ${selectedColor === cw ? 'color-btn--active' : ''}`}
                    onClick={() => setSelectedColor(cw)}
                  >
                    {cw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="detail-option-group">
              <div className="flex justify-between items-center">
                <label className="detail-option-label">Select Size (US)</label>
                <span className="text-xs text-muted">
                  {currentStock > 0 ? (
                    <span className="text-success">{currentStock} in stock</span>
                  ) : (
                    <span className="text-error">Sold out in this size</span>
                  )}
                </span>
              </div>
              <div className="size-selector-grid">
                {product.sizes.map((sz) => {
                  const szStock = getStockCount(selectedColor, sz);
                  const isOut = szStock <= 0;
                  return (
                    <button
                      key={sz}
                      disabled={isOut}
                      className={`size-choice-btn ${selectedSize === sz ? 'size-choice-btn--active' : ''} ${
                        isOut ? 'size-choice-btn--out' : ''
                      }`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="product-actions" style={{ marginTop: '2rem' }}>
            <button
              ref={mainBtnRef}
              className="btn btn-primary btn-lg btn-full"
              disabled={adding || currentStock <= 0}
              onClick={handleAddToCart}
              id="add-to-cart-btn"
            >
              {adding ? (
                <div className="spinner" />
              ) : currentStock <= 0 ? (
                'Out of Stock'
              ) : (
                'Add to Bag'
              )}
            </button>
            {addedMsg && (
              <p className="added-success-msg text-success text-sm text-center">
                Added to bag.
              </p>
            )}
            {cartError && (
              <p className="text-sm text-center" style={{ color: 'var(--clr-error)', marginTop: '0.5rem' }}>
                {cartError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (appears when main button is out of view) */}
      <div className={`pdp-sticky-bar ${showStickyBar ? 'pdp-sticky-bar--visible' : ''}`}>
        <div className="pdp-sticky-bar__inner">
          <div className="pdp-sticky-bar__info">
            <span className="pdp-sticky-bar__price">{formatPrice(product.price)}</span>
            <span className="pdp-sticky-bar__meta">
              {selectedSize ? `Size ${selectedSize}` : 'Choose size'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary pdp-sticky-bar__btn"
            disabled={adding || currentStock <= 0}
            onClick={handleAddToCart}
            id="mobile-sticky-add-btn"
          >
            {adding ? (
              <div className="spinner" />
            ) : currentStock <= 0 ? (
              'Out of Stock'
            ) : (
              'Add to Bag'
            )}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section related-section">
          <h2 className="text-headline" style={{ marginBottom: '1.5rem' }}>You Might Also Like</h2>
          <div className="grid-4">
            {related.slice(0, 4).map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
