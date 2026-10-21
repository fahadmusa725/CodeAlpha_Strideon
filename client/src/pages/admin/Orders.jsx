import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { formatPrice, formatDate } from '../../utils/formatters';
import './Dashboard.css';
import './Admin.css';

const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_OPTIONS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_OPTIONS = ['All', 'Paid', 'Pending'];
const DATE_RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: 'All time', value: 0 },
];
const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateRange, setDateRange] = useState(0); // 0 means All time
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer (Order Details)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStatusUpdating, setDrawerStatusUpdating] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/orders');
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: data.status } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: data.status }));
      }
      showToast(`Order status updated to ${data.status}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating order status', 'error');
    }
  };

  // Filtered & Paginated Orders
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      // Search by ID, customer name, customer email
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(q)) ||
        (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
        (o.user?.email && o.user.email.toLowerCase().includes(q));

      // Status
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;

      // Payment
      const matchesPayment =
        paymentFilter === 'All' || o.paymentStatus === paymentFilter;

      // Date Range
      let matchesDate = true;
      if (dateRange > 0 && o.createdAt) {
        const orderDate = new Date(o.createdAt);
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= dateRange;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, dateRange]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, dateRange]);

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const startCount = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endCount = Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length);

  const getPaymentBadgeClass = (paymentStatus) => {
    if (paymentStatus === 'Paid') return 'status-pill--paid';
    if (paymentStatus === 'Failed') return 'status-pill--failed';
    return 'status-pill--pending';
  };

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
              placeholder="Search by order ID, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All payments' : p}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
          >
            {DATE_RANGES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="admin-error-box">
          <span>{error}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchOrders}>
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
                <th style={{ width: '100px' }}>Order ID</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th style={{ minWidth: '150px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="admin-skeleton" style={{ width: '70px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '120px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '150px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '130px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '70px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '60px', height: '16px' }} /></td>
                    <td><div className="admin-skeleton" style={{ width: '140px', height: '24px' }} /></td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="admin-empty-state">
                      No orders match your active search and filter criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const itemCount = order.items?.reduce((sum, item) => sum + item.qty, 0) || order.items?.length || 0;
                  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
                  const firstItemName = order.items?.[0]?.name || '';
                  const statusClass = `order-status-select--${order.status.toLowerCase()}`;

                  return (
                    <tr
                      key={order._id}
                      className="admin-table-row--clickable"
                      onClick={() => openDrawer(order)}
                    >
                      <td className="font-mono text-xs" style={{ fontWeight: 600 }}>
                        {order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="text-xs" style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        <div className="product-row-meta">
                          <span className="product-row-title">
                            {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                          </span>
                          <span className="product-row-brand">
                            {order.user?.email || 'Guest checkout'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="product-row-meta">
                          <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{itemLabel}</span>
                          {firstItemName && (
                            <span className="product-row-brand" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {firstItemName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatPrice(order.total ?? order.subtotal)}
                      </td>
                      <td>
                        <span className={`status-pill ${getPaymentBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`order-status-select ${statusClass}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && filteredOrders.length > 0 && (
          <div className="admin-pagination">
            <span>
              Showing {startCount} to {endCount} of {filteredOrders.length}
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

      {/* Right-Side Drawer (Order Details) */}
      {drawerOpen && selectedOrder && (
        <>
          <div
            className="admin-drawer-backdrop"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside className="admin-drawer" aria-labelledby="order-drawer-heading">
            <div className="admin-drawer__header">
              <div>
                <h2 id="order-drawer-heading" className="admin-drawer__title">
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <span className="text-muted text-xs">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button
                type="button"
                className="admin-drawer__close"
                onClick={closeDrawer}
                aria-label="Close drawer"
              >
                ×
              </button>
            </div>

            <div className="admin-drawer__body">
              {/* Order Status & Payment Status Control */}
              <div className="drawer-section">
                <span className="drawer-section__title">Fulfillment & Payment</span>
                <div className="drawer-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted">PAYMENT:</span>
                    <span className={`status-pill ${getPaymentBadgeClass(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted">STATUS:</span>
                    <select
                      className={`order-status-select order-status-select--${selectedOrder.status.toLowerCase()}`}
                      value={selectedOrder.status}
                      disabled={drawerStatusUpdating}
                      onChange={async (e) => {
                        setDrawerStatusUpdating(true);
                        await handleStatusChange(selectedOrder._id, e.target.value);
                        setDrawerStatusUpdating(false);
                      }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="drawer-section">
                <span className="drawer-section__title">Purchased Items ({selectedOrder.items?.length || 0})</span>
                <div className="drawer-card">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="drawer-item-row">
                      <div className="drawer-item-meta">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="drawer-item-thumb"
                        />
                        <div className="product-row-meta">
                          <span className="product-row-title">{item.name}</span>
                          <span className="product-row-brand">
                            {item.colorway} · Size US {item.size} · Qty {item.qty}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="drawer-section">
                <span className="drawer-section__title">Delivery Address</span>
                <div className="drawer-card text-sm" style={{ lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 600, color: 'var(--clr-text)' }}>
                    {selectedOrder.shippingAddress?.fullName}
                  </div>
                  <div>{selectedOrder.shippingAddress?.address}</div>
                  <div>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                  </div>
                  <div>{selectedOrder.shippingAddress?.country}</div>
                  <div className="text-muted text-xs" style={{ marginTop: '0.35rem' }}>
                    Customer Email: {selectedOrder.user?.email || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Payment & Total Breakdown */}
              <div className="drawer-section">
                <span className="drawer-section__title">Order Summary</span>
                <div className="drawer-card">
                  <div className="drawer-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="drawer-summary-row">
                    <span>Shipping</span>
                    <span>
                      {selectedOrder.shippingCost === 0 ? 'Free' : formatPrice(selectedOrder.shippingCost)}
                    </span>
                  </div>
                  <div className="drawer-summary-row drawer-summary-row--total">
                    <span>Total Paid</span>
                    <span className="text-orange">
                      {formatPrice(selectedOrder.total ?? selectedOrder.subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-drawer__footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={closeDrawer}
              >
                Close
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
