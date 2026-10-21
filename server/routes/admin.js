const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getAdminStats);

module.exports = router;
