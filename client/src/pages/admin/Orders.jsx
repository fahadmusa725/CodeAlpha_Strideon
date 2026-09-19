import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice, formatDate } from '../../utils/formatters';
import './Admin.css';

const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: data.status } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <h1 className="text-headline">Order Management</h1>
          <p className="text-muted text-sm">Fulfill customer purchases and adjust delivery lifecycle statuses.</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '4rem auto' }} />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Items Ordered</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="font-mono text-sm">{order._id.slice(-8)}</td>
                  <td className="text-sm text-muted">{formatDate(order.createdAt)}</td>
                  <td>
                    <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-muted">{order.user?.email}</p>
                  </td>
                  <td className="text-sm">
                    {order.shippingAddress?.city}, {order.shippingAddress?.country}
                  </td>
                  <td className="text-sm">
                    {order.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.qty}x {item.name} ({item.colorway}, {item.size})
                      </div>
                    ))}
                  </td>
                  <td className="font-bold text-orange">{formatPrice(order.subtotal)}</td>
                  <td>
                    <select
                      className="form-select status-select-sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
