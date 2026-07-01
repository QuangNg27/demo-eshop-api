const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const getCoupons = () => {
  const filePath = path.join(__dirname, '../data/coupons.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const saveCoupons = (coupons) => {
  const filePath = path.join(__dirname, '../data/coupons.json');
  fs.writeFileSync(filePath, JSON.stringify(coupons, null, 2));
};

// POST /api/coupon/redeem — validate and apply a coupon (requires auth)
router.post('/redeem', authMiddleware, (req, res) => {
  const { coupon_code, user_id } = req.body;

  if (!coupon_code || !user_id) {
    return res.status(400).json({ error: 'coupon_code and user_id are required' });
  }

  const uid = parseInt(user_id);
  const coupons = getCoupons();
  const coupon = coupons.find((c) => c.code === coupon_code);

  // 1. Coupon không tồn tại
  if (!coupon) {
    return res.status(400).json({ error: 'Coupon not found' });
  }

  // 2. Coupon hết hạn
  const today = new Date().toISOString().split('T')[0];
  if (coupon.expiry_date < today) {
    return res.status(400).json({ error: 'Coupon has expired' });
  }

  // 3. User đã redeem coupon này rồi
  if (coupon.redeemed_by.includes(uid)) {
    return res.status(409).json({ error: 'Coupon already redeemed by this user' });
  }

  // Success — add user to redeemed_by list
  coupon.redeemed_by.push(uid);
  saveCoupons(coupons);

  res.json({
    success: true,
    discount_percent: coupon.discount_percent,
    message: `Coupon ${coupon_code} applied successfully. You get ${coupon.discount_percent}% off!`
  });
});

module.exports = router;
