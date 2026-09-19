const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const createCheckoutSession = async (req, res, next) => {
  try {
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

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = subtotal > 150 ? 0 : 15;

    // If Stripe secret key is configured, create a real Stripe Checkout Session
    if (stripe) {
      const line_items = items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `${item.colorway} · Size ${item.size}`,
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
            product_data: {
              name: 'Standard Shipping',
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Create pre-order record in Pending status
      const order = await Order.create({
        user: req.user._id,
        items,
        shippingAddress,
        subtotal: subtotal + shippingCost,
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

    // If Stripe is not configured, fall back to simulated instant placement
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal: subtotal + shippingCost,
      paymentStatus: 'Paid',
      paymentMethod: 'Simulated',
      status: 'Processing',
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.status(201).json({ order, isSimulated: true });
  } catch (err) {
    next(err);
  }
};

const verifySession = async (req, res, next) => {
  try {
    const { sessionId, orderId } = req.body;
    if (!sessionId || !orderId) {
      return res.status(400).json({ message: 'Session ID and Order ID required' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        order.paymentStatus = 'Paid';
        order.status = 'Processing';
        await order.save();
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
      }
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

const placeOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.images[0] ?? '',
      colorway: i.colorway,
      size: i.size,
      qty: i.qty,
      price: i.price,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: req.body.shippingAddress,
      subtotal,
      paymentStatus: 'Paid',
      paymentMethod: 'Simulated',
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCheckoutSession,
  verifySession,
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
