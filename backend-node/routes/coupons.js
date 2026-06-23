const express = require('express');
const router  = express.Router();
const { validateCoupon } = require('../controllers/couponController');

// GET /api/coupons/validate/:code
router.get('/validate/:code', validateCoupon);

module.exports = router;
