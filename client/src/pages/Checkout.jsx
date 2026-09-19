import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../api/axios';
import { formatPrice } from '../utils/formatters';
import COUNTRIES from '../utils/countries';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartSubtotal, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [cancelNotice, setCancelNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('canceled')) {
      setCancelNotice(true);
    }
  }, [searchParams]);

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h2>Your bag is empty</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  const shipping = cartSubtotal > 150 ? 0 : 15;
  const grandTotal = cartSubtotal + shipping;

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.address.trim()) errs.address = 'Street Address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State / Province is required';
    if (!formData.zip.trim()) errs.zip = 'Postal code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setOrderError('');

    try {
      const { data } = await api.post('/orders/create-checkout-session', {
        shippingAddress: formData,
      });

      if (data.url) {
        // Redirect to Stripe Hosted Checkout
        window.location.href = data.url;
      } else {
        // Fallback for simulated checkout mode
        await fetchCart();
        navigate('/orders', {
          state: {
            newOrderPlaced: true,
            orderId: data.order?._id || data._id,
          },
        });
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to initiate checkout. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page container">
      <h1 className="text-headline" style={{ marginBottom: '2rem' }}>Checkout</h1>

      {cancelNotice && (
        <div className="alert-error" style={{ marginBottom: '1.5rem', borderColor: 'var(--clr-accent)', color: 'var(--clr-accent)', background: 'rgba(255, 90, 31, 0.1)' }}>
          ⚠️ Payment was canceled. You can modify your details and try again whenever you are ready.
        </div>
      )}

      {orderError && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          {orderError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkout-page__layout">
        {/* Shipping Form */}
        <div className="checkout-form-area">
          <div className="checkout-card">
            <h2 className="checkout-section-title">Shipping Address</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Street Address</label>
              <input
                id="address"
                name="address"
                className={`form-input ${errors.address ? 'error' : ''}`}
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Streetwear Ave, Apt 4B"
              />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  className={`form-input ${errors.city ? 'error' : ''}`}
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">State / Province</label>
                <input
                  id="state"
                  name="state"
                  className={`form-input ${errors.state ? 'error' : ''}`}
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
                {errors.state && <span className="form-error">{errors.state}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="zip">ZIP / Postal Code</label>
                <input
                  id="zip"
                  name="zip"
                  className={`form-input ${errors.zip ? 'error' : ''}`}
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="10001"
                />
                {errors.zip && <span className="form-error">{errors.zip}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  className="form-select"
                  value={formData.country}
                  onChange={handleChange}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="checkout-card" style={{ marginTop: '1.5rem' }}>
            <h2 className="checkout-section-title">Payment Method</h2>
            <div className="simulated-payment-badge">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-orange font-bold">💳 Stripe Secure Checkout</span>
                <span className="badge badge-orange text-xs">Stripe 256-Bit SSL</span>
              </div>
              <p className="text-sm text-muted">
                Supports Visa, Mastercard, American Express, Apple Pay, and Google Pay. You will be redirected to complete your payment securely.
              </p>
            </div>
          </div>
        </div>

        {/* Order Preview */}
        <aside className="checkout-summary">
          <h2 className="summary-title">Items ({cart.items.length})</h2>

          <div className="checkout-item-preview-list">
            {cart.items.map((item, idx) => {
              const product = item.product;
              const name = typeof product === 'object' ? product?.name : 'Product';
              const image = typeof product === 'object' ? product?.images?.[0] : '';

              return (
                <div key={idx} className="checkout-item-preview">
                  <div className="checkout-item-thumb">
                    <img src={image} alt={name} />
                  </div>
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{name}</p>
                    <p className="checkout-item-sub text-xs text-muted">
                      {item.colorway} · Size {item.size} · Qty: {item.qty}
                    </p>
                  </div>
                  <span className="checkout-item-price text-sm font-semibold">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cartSubtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span className="text-success">FREE</span> : formatPrice(shipping)}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row summary-row--total">
            <span>Total</span>
            <span className="text-orange">{formatPrice(grandTotal)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '1.5rem' }}
            id="place-order-btn"
          >
            {submitting ? <div className="spinner" /> : 'Proceed to Payment'}
          </button>
        </aside>
      </form>
    </div>
  );
}
