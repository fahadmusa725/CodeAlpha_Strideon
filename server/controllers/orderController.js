const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { stockKey } = require('../utils/stock');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

async function validateStock(items) {
  const ids = [...new Set(items.map((i) => i.product))];
  const products = await Product.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  for (const item of items) {
    const product = productMap.get(item.product.toString());
    if (!product) return `Product ${item.name} no longer exists`;
    const available = product.stock.get(stockKey(item.colorway, item.size)) ?? 0;
    if (available < item.qty) {
      return `Insufficient stock for ${item.name} (${item.colorway}, size ${item.size})`;
    }
  }
  return null;
}

async function decrementStock(items) {
  for (const item of items) {
    const key = stockKey(item.colorway, item.size);
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        [`stock.${key}`]: { $gte: item.qty },
      },
      {
        $inc: { [`stock.${key}`]: -item.qty },
      }
    );
  }
}

const createCheckoutSession = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const { shippingAddress } = req.body;

  const items = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.images[0] ?? '',
    colorway: i.colorway,
    size: i.size,
    qty: i.qty,
    price: i.price,
  }));

  const stockError = await validateStock(items);
  if (stockError) {
    return res.status(400).json({ message: stockError });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingCost = subtotal > 150 ? 0 : 15;
  const total = subtotal + shippingCost;

  if (stripe) {
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `${item.colorway} / Size ${item.size}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Standard Shipping' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      paymentStatus: 'Pending',
      paymentMethod: 'Stripe',
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: req.user.email,
      success_url: `${clientUrl}/orders?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${clientUrl}/checkout?canceled=true`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.json({ url: session.url, sessionId: session.id, orderId: order._id });
  }

  // Simulated (no Stripe key): mark paid and decrement stock immediately.
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    subtotal,
    shippingCost,
    total,
    paymentStatus: 'Paid',
    paymentMethod: 'Simulated',
    status: 'Processing',
  });

  await decrementStock(items);
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ order, isSimulated: true });
});

const verifySession = asyncHandler(async (req, res) => {
  const { sessionId, orderId } = req.body;
  if (!sessionId || !orderId) {
    return res.status(400).json({ message: 'Session ID and Order ID required' });
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (!stripe) {
    return res.json(order);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === 'paid') {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, user: req.user._id, paymentStatus: 'Pending' },
      { paymentStatus: 'Paid', status: 'Processing' },
      { new: true }
    );

    if (updatedOrder) {
      await decrementStock(updatedOrder.items);
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
      return res.json(updatedOrder);
    }
  }

  res.json(order);
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

module.exports = {
  createCheckoutSession,
  verifySession,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
