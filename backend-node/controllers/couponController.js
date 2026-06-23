const Coupon = require('../models/Coupon');

const DEMO_WHATSAPP = process.env.WHATSAPP_NUMBER || '917418702397';

exports.validateCoupon = async (req, res) => {
  const code = (req.params.code || '').toUpperCase().trim();
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  try {
    const coupon = await Coupon.findOne({ code, status: 'active' });

    if (!coupon) {
      return res.json({ success: true, valid: false, message: 'Invalid or inactive coupon code' });
    }

    if (coupon.startDate && new Date() < coupon.startDate) {
      return res.json({ success: true, valid: false, message: 'This coupon is not active yet' });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.json({ success: true, valid: false, message: 'This coupon has expired' });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ success: true, valid: false, message: 'This coupon has reached its usage limit' });
    }

    return res.json({
      success:        true,
      valid:          true,
      whatsappNumber: coupon.whatsappNumber,
      description:    coupon.description,
      bulkMinQty:     coupon.bulkMinQty,
      bulkMinAmount:  coupon.bulkMinAmount,
    });
  } catch {
    // DB offline — treat any valid-looking code as accepted and use env fallback
    return res.json({
      success:        true,
      valid:          true,
      whatsappNumber: DEMO_WHATSAPP,
      description:    'Bulk order enquiry',
      bulkMinQty:     10,
      bulkMinAmount:  5000,
    });
  }
};
