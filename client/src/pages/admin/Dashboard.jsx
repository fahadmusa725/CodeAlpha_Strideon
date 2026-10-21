import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatPrice } from '../../utils/formatters';
import './Dashboard.css';

export default function AdminDashboard() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  const fetchStats = async (selectedRange) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/stats?range=${selectedRange}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // SVG Chart Geometry
  const renderRevenueChart = () => {
    const series = data?.timeSeries || [];
    if (series.length === 0) {
      return <div className="admin-empty-state">No revenue data for this period.</div>;
    }

    const width = 640;
    const height = 220;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...series.map((d) => d.revenue), 100);

    const getX = (index) => {
      if (series.length <= 1) return paddingLeft + chartW / 2;
      return paddingLeft + (index / (series.length - 1)) * chartW;
    };

    const getY = (val) => {
      return paddingTop + chartH - (val / maxVal) * chartH;
    };

    const points = series.map((d, i) => ({
      x: getX(i),
      y: getY(d.revenue),
      date: d.date,
      revenue: d.revenue,
      orders: d.orders,
    }));

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaD = points.length
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`
      : '';

    // Generate 4 horizontal grid ticks
    const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

    // X-axis ticks (sample 5 dates)
    const step = Math.max(1, Math.floor(series.length / 5));
    const xTicks = series.filter((_, idx) => idx % step === 0 || idx === series.length - 1);

    return (
      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-svg"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--clr-orange)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--clr-orange)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y axis */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="chart-grid-line"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-text"
                >
                  ${Math.round(tick)}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {xTicks.map((item, idx) => {
            const originalIndex = series.findIndex((s) => s.date === item.date);
            const x = getX(originalIndex);
            const label = item.date.slice(5); // MM-DD
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="chart-axis-text"
              >
                {label}
              </text>
            );
          })}

          {/* Area & Line */}
          {areaD && <path d={areaD} className="chart-area" />}
          {pathD && <path d={pathD} className="chart-line" />}

          {/* Interactive Dots */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.date === pt.date ? 5 : 3}
              className="chart-dot"
              onMouseEnter={() => setHoveredPoint(pt)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="chart-tooltip-date">{hoveredPoint.date}</div>
            <div className="chart-tooltip-val">
              {formatPrice(hoveredPoint.revenue)} ({hoveredPoint.orders} {hoveredPoint.orders === 1 ? 'order' : 'orders'})
            </div>
          </div>
        )}
      </div>
    );
  };

  // Orders By Status (horizontal bars)
  const renderOrdersByStatus = () => {
    const list = data?.ordersByStatus || [];
    if (list.length === 0) {
      return <div className="admin-empty-state">No orders in this range.</div>;
    }
    const maxCount = Math.max(...list.map((s) => s.count), 1);
    const colorClass = (st) => {
      switch (st) {
        case 'Delivered':
          return 'bar-fill--green';
        case 'Shipped':
          return 'bar-fill--blue';
        case 'Processing':
          return 'bar-fill';
        case 'Cancelled':
          return 'bar-fill--gray';
        default:
          return 'bar-fill--amber';
      }
    };

    return (
      <div className="bar-list">
        {list.map((item) => {
          const pct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={item.status} className="bar-item">
              <div className="bar-item__header">
                <span className="bar-item__label">{item.status}</span>
                <span className="bar-item__val">{item.count}</span>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${colorClass(item.status)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Revenue By Category
  const renderRevenueByCategory = () => {
    const list = data?.revenueByCategory || [];
    if (list.length === 0) {
      return <div className="admin-empty-state">No categorized sales found.</div>;
    }
    const maxRev = Math.max(...list.map((c) => c.revenue), 1);

    return (
      <div className="bar-list">
        {list.map((cat) => {
          const pct = Math.round((cat.revenue / maxRev) * 100);
          return (
            <div key={cat.category} className="bar-item">
              <div className="bar-item__header">
                <span className="bar-item__label">{cat.category} ({cat.units} sold)</span>
                <span className="bar-item__val">{formatPrice(cat.revenue)}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Top Selling Products Table
  const renderTopSelling = () => {
    const list = data?.topSelling || [];
    if (list.length === 0) {
      return <div className="admin-empty-state">No products sold in this period.</div>;
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-dense-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: 'right' }}>Units sold</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.productId || item.name}>
                <td>
                  <div className="product-row-name">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="product-row-thumb" />
                    )}
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.unitsSold}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatPrice(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Low Stock List
  const renderLowStock = () => {
    const list = data?.lowStock || [];
    if (list.length === 0) {
      return <div className="admin-empty-state">All catalog sizes are well stocked.</div>;
    }

    return (
      <div className="low-stock-list">
        {list.map((item) => (
          <Link
            to="/admin/products"
            key={item._id}
            className="low-stock-item"
            title="Manage product stock"
          >
            <div className="low-stock-item__main">
              {item.image && (
                <img src={item.image} alt={item.name} className="product-row-thumb" />
              )}
              <div className="low-stock-item__info">
                <span className="low-stock-item__name">{item.name}</span>
                <span className="text-muted text-xs">{item.brand}</span>
              </div>
            </div>

            <div className="low-stock-item__chips">
              {item.lowVariants.map((v) => (
                <span
                  key={v.key}
                  className={`stock-chip ${v.isSoldOut ? 'stock-chip--soldout' : ''}`}
                >
                  {v.colorway} sz {v.size}: {v.quantity === 0 ? 'Out' : `${v.quantity} left`}
                </span>
              ))}
              {item.totalLowVariants > item.lowVariants.length && (
                <span className="text-muted text-xs">
                  +{item.totalLowVariants - item.lowVariants.length} more
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Recent Orders Table
  const renderRecentOrders = () => {
    const list = data?.recentOrders || [];
    if (list.length === 0) {
      return <div className="admin-empty-state">No orders recorded yet.</div>;
    }

    const paymentPillClass = (p) => {
      if (p === 'Paid') return 'status-pill--paid';
      if (p === 'Pending') return 'status-pill--pending';
      return 'status-pill--failed';
    };

    const orderPillClass = (s) => {
      if (s === 'Delivered') return 'status-pill--delivered';
      if (s === 'Shipped') return 'status-pill--shipped';
      if (s === 'Processing') return 'status-pill--processing';
      return 'status-pill--cancelled';
    };

    return (
      <div className="admin-table-wrap">
        <table className="admin-dense-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => {
              const itemLabel = o.itemCount === 1 ? '1 item' : `${o.itemCount} items`;
              return (
                <tr key={o._id}>
                  <td className="font-mono text-xs">{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div>{o.customerName}</div>
                    {o.customerEmail && (
                      <div className="text-muted text-xs">{o.customerEmail}</div>
                    )}
                  </td>
                  <td>{itemLabel}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`status-pill ${paymentPillClass(o.paymentStatus)}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${orderPillClass(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dash-header">
        <div>
          <p className="admin-dash-header__desc">
            Performance overview and inventory alerts for your footwear catalog.
          </p>
        </div>

        <div className="range-selector">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              type="button"
              className={`range-btn ${range === r ? 'range-btn--active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-error-box">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fetchStats(range)}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        {loading ? (
          <>
            <div className="admin-skeleton admin-skeleton-kpi" />
            <div className="admin-skeleton admin-skeleton-kpi" />
            <div className="admin-skeleton admin-skeleton-kpi" />
            <div className="admin-skeleton admin-skeleton-kpi" />
          </>
        ) : (
          <>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Revenue</span>
              <span className="admin-kpi-value text-orange">
                {formatPrice(data?.kpi?.revenue || 0)}
              </span>
              <span className="admin-kpi-sub">Paid orders ({range}d)</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Orders</span>
              <span className="admin-kpi-value">{data?.kpi?.orders || 0}</span>
              <span className="admin-kpi-sub">Paid transactions</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Average Order Value</span>
              <span className="admin-kpi-value">
                {formatPrice(data?.kpi?.averageOrderValue || 0)}
              </span>
              <span className="admin-kpi-sub">Revenue per paid order</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Low Stock Products</span>
              <span className="admin-kpi-value">{data?.kpi?.lowStockCount || 0}</span>
              <span className="admin-kpi-sub">Sizes with 2 or fewer units</span>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid: Revenue Over Time + Orders by Status */}
      <div className="admin-charts-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Revenue over time</h2>
          </div>
          {loading ? (
            <div className="admin-skeleton admin-skeleton-block" />
          ) : (
            renderRevenueChart()
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Orders by status</h2>
          </div>
          {loading ? (
            <div className="admin-skeleton admin-skeleton-block" />
          ) : (
            renderOrdersByStatus()
          )}
        </div>
      </div>

      {/* Split Grid: Revenue by Category + Top Selling Products */}
      <div className="admin-split-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Revenue by category</h2>
          </div>
          {loading ? (
            <div className="admin-skeleton admin-skeleton-block" />
          ) : (
            renderRevenueByCategory()
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Top selling products</h2>
          </div>
          {loading ? (
            <div className="admin-skeleton admin-skeleton-block" />
          ) : (
            renderTopSelling()
          )}
        </div>
      </div>

      {/* Split Grid: Low Stock Alert + Recent Orders */}
      <div className="admin-split-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Low stock alert</h2>
            <Link to="/admin/products" className="admin-card-action">
              View all products →
            </Link>
          </div>
          {loading ? (
            <div className="admin-skeleton admin-skeleton-block" />
          ) : (
            renderLowStock()
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent orders</h2>
            <Link to="/admin/orders" className="admin-card-action">
              Manage all orders →
            </Link>
          </div>
          {loading ? (
            <div className="admin-skeleton admin-skeleton-block" />
          ) : (
            renderRecentOrders()
          )}
        </div>
      </div>
    </div>
  );
}
