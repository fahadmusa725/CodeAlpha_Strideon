const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images slug brand');
    res.json(cart || { user: req.user._id, items: [] });
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { productId, colorway, size, qty = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const formattedSize = size.toString().replace('.', '_');
    const stockKey = `${colorway}-${formattedSize}`;
    const available = product.stock.get(stockKey) ?? 0;
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
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { productId, colorway, size } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === productId && i.colorway === colorway && i.size === size)
    );

    await cart.save();
    await cart.populate('items.product', 'name images slug brand');
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
