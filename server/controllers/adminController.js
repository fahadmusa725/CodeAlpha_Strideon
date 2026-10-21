const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/admin/stats?range=30
const getAdminStats = asyncHandler(async (req, res) => {
  const rangeParam = Number(req.query.range) || 30;
  if (![7, 30, 90].includes(rangeParam)) {
    return res.status(400).json({ message: 'Invalid range parameter. Expected 7, 30, or 90' });
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (rangeParam - 1));
  startDate.setHours(0, 0, 0, 0);

  // Run aggregations and queries in parallel
  const [
    kpiAgg,
    timeSeriesAgg,
    statusAgg,
    categoryAgg,
    topSellingAgg,
    recentOrders,
    products,
  ] = await Promise.all([
    // 1. KPI Aggregation for paid orders in range
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]),

    // 2. Daily revenue time series for paid orders in range (UTC grouped by YYYY-MM-DD)
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // 3. Orders by lifecycle status in range (all orders in window, not just paid)
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // 4. Revenue by category in range (unwind items, lookup product category, paid orders only)
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$productDoc.category', 'Uncategorized'] },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          units: { $sum: '$items.qty' },
        },
      },
      { $sort: { revenue: -1 } },
    ]),

    // 5. Top selling products in range (paid orders only)
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 5 },
    ]),

    // 6. Recent orders in the database
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),

    // 7. All products to evaluate low stock variants (<= 2 or 0)
    Product.find({}, 'name brand slug images stock').lean(),
  ]);

  // Construct day-by-day complete time series
  const timeSeriesMap = new Map();
  for (const row of timeSeriesAgg) {
    timeSeriesMap.set(row._id, {
      date: row._id,
      revenue: Number(row.revenue.toFixed(2)),
      orders: row.orders,
    });
  }

  const timeSeries = [];
  const cur = new Date(startDate);
  while (cur <= now) {
    const key = cur.toISOString().slice(0, 10);
    const existing = timeSeriesMap.get(key);
    if (existing) {
      timeSeries.push(existing);
    } else {
      timeSeries.push({ date: key, revenue: 0, orders: 0 });
    }
    cur.setDate(cur.getDate() + 1);
  }

  // Scan products for low stock or sold-out variants
  const lowStockProducts = [];
  let lowStockProductsCount = 0;

  for (const prod of products) {
    const stockObj = prod.stock instanceof Map
      ? Object.fromEntries(prod.stock)
      : (prod.stock || {});

    const lowVariants = [];
    for (const [key, qty] of Object.entries(stockObj)) {
      if (typeof qty === 'number' && qty <= 2) {
        const lastDash = key.lastIndexOf('-');
        const colorway = lastDash !== -1 ? key.slice(0, lastDash) : key;
        const sizeRaw = lastDash !== -1 ? key.slice(lastDash + 1) : '';
        const size = sizeRaw.replace('_', '.');
        lowVariants.push({
          key,
          colorway,
          size,
          quantity: qty,
          isSoldOut: qty === 0,
        });
      }
    }

    if (lowVariants.length > 0) {
      lowStockProductsCount += 1;
      lowStockProducts.push({
        _id: prod._id,
        name: prod.name,
        brand: prod.brand,
        slug: prod.slug,
        image: prod.images?.[0] || '',
        lowVariants: lowVariants.slice(0, 6),
        totalLowVariants: lowVariants.length,
      });
    }
  }

  const kpiData = kpiAgg[0] || { totalRevenue: 0, totalOrders: 0 };
  const revenue = Number((kpiData.totalRevenue || 0).toFixed(2));
  const ordersCount = kpiData.totalOrders || 0;
  const aov = ordersCount > 0 ? Number((revenue / ordersCount).toFixed(2)) : 0;

  res.json({
    range: rangeParam,
    kpi: {
      revenue,
      orders: ordersCount,
      averageOrderValue: aov,
      lowStockCount: lowStockProductsCount,
    },
    timeSeries,
    ordersByStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
    revenueByCategory: categoryAgg.map((c) => ({
      category: c._id,
      revenue: Number(c.revenue.toFixed(2)),
      units: c.units,
    })),
    topSelling: topSellingAgg.map((t) => ({
      productId: t._id,
      name: t.name || 'Unnamed',
      image: t.image || '',
      unitsSold: t.unitsSold,
      revenue: Number(t.revenue.toFixed(2)),
    })),
    lowStock: lowStockProducts.slice(0, 10),
    recentOrders: recentOrders.map((o) => ({
      _id: o._id,
      customerName: o.shippingAddress?.fullName || o.user?.name || 'Customer',
      customerEmail: o.user?.email || '',
      itemCount: (o.items || []).reduce((sum, item) => sum + (item.qty || 1), 0),
      total: o.total,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt,
    })),
  });
});

module.exports = { getAdminStats };
