const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

const ALLOWED_UPDATE_FIELDS = [
  'name', 'brand', 'slug', 'category', 'description',
  'price', 'images', 'colorways', 'sizes', 'stock', 'tags', 'isFeatured',
];

const getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, size, sort, page = 1, limit = 12 } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (size) filter.sizes = Number(size);

  let sortObj = { createdAt: -1 };
  if (sort === 'price_asc') sortObj = { price: 1 };
  if (sort === 'price_desc') sortObj = { price: -1 };
  if (sort === 'newest') sortObj = { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = id.match(/^[a-f\d]{24}$/i)
    ? await Product.findById(id)
    : await Product.findOne({ slug: id });

  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product removed' });
});

const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(6);
  res.json(products);
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeatured };
