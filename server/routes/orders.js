const express = require('express');
const { body } = require('express-validator');
const {
  createCheckoutSession,
  verifySession,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

const shippingValidators = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name required'),
  body('shippingAddress.address').notEmpty().withMessage('Address required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  body('shippingAddress.state').notEmpty().withMessage('State required'),
  body('shippingAddress.zip').notEmpty().withMessage('ZIP code required'),
  body('shippingAddress.country').notEmpty().withMessage('Country required'),
];

router.use(protect);

router.post('/create-checkout-session', shippingValidators, createCheckoutSession);
router.post('/verify-session', verifySession);
router.get('/mine', getUserOrders);
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
