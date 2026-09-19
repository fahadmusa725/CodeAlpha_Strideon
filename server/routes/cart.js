const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All cart routes require auth

router.get('/', getCart);
router.post('/add', addItem);
router.put('/update', updateItem);
router.delete('/remove', removeItem);
router.delete('/clear', clearCart);

module.exports = router;
