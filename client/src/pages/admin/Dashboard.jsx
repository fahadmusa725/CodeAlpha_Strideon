import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatPrice } from '../../utils/formatters';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders'),
      ]);

      const products = prodRes.data.products || [];
      const orders = orderRes.data || [];

      const revenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

      setStats({
        totalProducts: prodRes.data.total || products.length,
        totalOrders: orders.length,
        totalRevenue: revenue,
        recentOrders: orders.slice(0, 5),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <span className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>Management Portal</span>
          <h1 className="text-headline">Admin Dashboard</h1>
        </div>
        <div className="admin-nav-links">
          <Link to="/admin/products" className="btn btn-outline btn-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">Manage Orders</Link>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '4rem auto' }} />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-val text-orange">{formatPrice(stats.totalRevenue)}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-val">{stats.totalOrders}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Live Products</span>
              <span className="stat-val">{stats.totalProducts}</span>
            </div>
          </div>

          <div className="admin-section" style={{ marginTop: '3rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <h2 className="admin-section__title">Recent Orders</h2>
              <Link to="/admin/orders" className="text-orange text-sm font-semibold">View All Orders →</Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <p className="text-muted">No orders found.</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o._id}>
                        <td className="font-mono text-sm">{o._id.slice(-8)}</td>
                        <td>{o.shippingAddress?.fullName} ({o.user?.email})</td>
                        <td>{o.items?.length} items</td>
                        <td className="font-bold">{formatPrice(o.subtotal)}</td>
                        <td>
                          <span className="badge badge-surface">{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
