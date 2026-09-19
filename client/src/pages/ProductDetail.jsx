import { useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.colorways?.length) setSelectedColor(data.colorways[0]);
      if (data.sizes?.length) setSelectedSize(data.sizes[0]);

      // fetch related products in same category
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
    try {
      await addItem(product._id, selectedColor, selectedSize, 1);
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setAdding(false);
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
      {/* Breadcrumb */}
      <nav className="breadcrumb text-sm text-muted">
        <Link to="/">Home</Link> / <Link to={`/products?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
      </nav>

      <div className="product-detail__grid">
        {/* Gallery */}
        <div className="gallery-section">
          <div className="gallery-main">
            <img
              src={product.images?.[selectedImg] || product.images?.[0]}
              alt={product.name}
              className="gallery-main__img"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${selectedImg === i ? 'gallery-thumb--active' : ''}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div className="product-info-section">
          <p className="text-upper text-orange text-sm">{product.brand}</p>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">{formatPrice(product.price)}</p>

          <p className="product-desc">{product.description}</p>

          {/* Colorways */}
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

          {/* Sizes */}
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

          {/* Actions */}
          <div className="product-actions" style={{ marginTop: '2rem' }}>
            <button
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
                ✓ Added to bag!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
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
