const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const { stockKey } = require('../utils/stock');

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images slug brand');
  res.json(cart || { user: req.user._id, items: [] });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, colorway, size, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const available = product.stock.get(stockKey(colorway, size)) ?? 0;
  if (available < qty) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(
    (i) => i.product.toString() === productId && i.colorway === colorway && i.size === size
  );

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, available);
  } else {
    cart.items.push({ product: productId, colorway, size, qty, price: product.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name images slug brand');
  res.json(cart);
});

const updateItem = asyncHandler(async (req, res) => {
  const { productId, colorway, size, qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(
    (i) => i.product.toString() === productId && i.colorway === colorway && i.size === size
  );
  if (!item) return res.status(404).json({ message: 'Item not in cart' });

  if (qty <= 0) {
    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === productId && i.colorway === colorway && i.size === size)
    );
  } else {
    item.qty = qty;
  }

  await cart.save();
  await cart.populate('items.product', 'name images slug brand');
  res.json(cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const { productId, colorway, size } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(
    (i) => !(i.product.toString() === productId && i.colorway === colorway && i.size === size)
  );

  await cart.save();
  await cart.populate('items.product', 'name images slug brand');
  res.json(cart);
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
