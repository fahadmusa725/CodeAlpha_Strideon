const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeatured,
} = require('../controllers/productController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:id', getProduct);

router.post(
  '/',
  protect,
  admin,
  [
    body('name').notEmpty().withMessage('Name required'),
    body('brand').notEmpty().withMessage('Brand required'),
    body('slug').notEmpty().withMessage('Slug required'),
    body('category').isIn(['Running', 'Basketball', 'Lifestyle', 'Skate']).withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  createProduct
);

router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
