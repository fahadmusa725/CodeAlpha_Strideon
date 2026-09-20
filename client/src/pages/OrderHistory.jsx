import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';
import { formatPrice, formatDate } from '../utils/formatters';
import './OrderHistory.css';

export default function OrderHistory() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchCart } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  useEffect(() => {
    const handleStripeReturn = async () => {
      const sessionId = searchParams.get('session_id');
      const orderId = searchParams.get('order_id');

      if (sessionId && orderId) {
        console.log('[OrderHistory] Stripe redirect detected — verifying session:', { sessionId, orderId });
        try {
          const { data } = await api.post('/orders/verify-session', { sessionId, orderId });
          console.log('[OrderHistory] verify-session response:', data);
          await fetchCart();
          setStripeSuccess(true);
          // Remove Stripe query params from URL without a full reload
          setSearchParams({});
        } catch (err) {
          const status = err?.response?.status;
          const message = err?.response?.data?.message || err.message;
          console.error('[OrderHistory] verify-session failed — status:', status, 'message:', message, err);
          // Only show error banner if it wasn't already verified (idempotency)
          if (status !== 400) {
            setVerifyError(true);
          }
          // Still remove params so user doesn't loop on refresh
          setSearchParams({});
        }
      }
      fetchOrders();
    };

    handleStripeReturn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/mine');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Shipped':
        return 'badge-orange';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'Paid':
        return 'badge-success';
      case 'Pending':
        return 'badge-warning';
      case 'Failed':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="orders-page container">
      {(location.state?.newOrderPlaced || stripeSuccess) && (
        <div className="order-success-banner">
          <span className="order-success-banner__icon">🎉</span>
          <div>
            <h3>Payment Confirmed & Order Placed!</h3>
            <p className="text-sm">Your order has been logged and is currently processing in our warehouse.</p>
          </div>
        </div>
      )}

      {verifyError && (
        <div className="order-success-banner" style={{ borderColor: 'var(--clr-warning)', background: 'rgba(245,158,11,0.08)' }}>
          <span className="order-success-banner__icon">⚠️</span>
          <div>
            <h3 style={{ color: 'var(--clr-warning)' }}>Payment verification encountered an issue</h3>
            <p className="text-sm">Your payment may still have been processed. Please refresh in a moment or contact support if your order still shows as Pending.</p>
          </div>
        </div>
      )}

      <div className="orders-page__header">
        <h1 className="text-headline">Order History</h1>
        <p className="text-muted text-sm">Review your past drops and track order statuses.</p>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '4rem auto' }} />
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <span>📦</span>
          <h3>No Orders Yet</h3>
          <p className="text-muted">You haven't purchased any items yet.</p>
          <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card__header">
                <div className="order-meta-col">
                  <span className="order-meta-label">Order Placed</span>
                  <span className="order-meta-value">{formatDate(order.createdAt)}</span>
                </div>

                <div className="order-meta-col">
                  <span className="order-meta-label">Total</span>
                  <span className="order-meta-value text-orange">{formatPrice(order.subtotal)}</span>
                </div>

                <div className="order-meta-col">
                  <span className="order-meta-label">Ship To</span>
                  <span className="order-meta-value">{order.shippingAddress?.fullName}</span>
                </div>

                <div className="order-meta-col">
                  <span className="order-meta-label">Payment</span>
                  <span className={`badge ${getPaymentBadgeClass(order.paymentStatus || 'Paid')}`}>
                    {order.paymentStatus || 'Paid'} ({order.paymentMethod || 'Stripe'})
                  </span>
                </div>

                <div className="order-meta-col order-meta-col--status">
                  <span className="order-meta-label">Status</span>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-card__items">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <div className="order-item-thumb">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="order-item-details">
                      <p className="order-item-name">{item.name}</p>
                      <p className="order-item-variant text-xs text-muted">
                        Color: {item.colorway} · Size: {item.size} · Qty: {item.qty}
                      </p>
                    </div>
                    <div className="order-item-price font-semibold">
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
