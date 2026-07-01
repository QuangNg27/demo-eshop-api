const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const cartModule = require('./cart');

const router = express.Router();

// In-memory orders store
const orders = [];
let orderIdCounter = 1;

const getProducts = () => {
  const filePath = path.join(__dirname, '../data/products.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const saveProducts = (products) => {
  const filePath = path.join(__dirname, '../data/products.json');
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
};

const getCoupons = () => {
  const filePath = path.join(__dirname, '../data/coupons.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// POST /api/orders — create order from user's cart (requires auth)
router.post('/', authMiddleware, (req, res) => {
  const { user_id, coupon_code } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const uid = parseInt(user_id);
  const carts = cartModule.carts;
  const userCart = carts[uid];

  if (!userCart || userCart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Add items to cart first.' });
  }

  const products = getProducts();

  // Validate stock for all cart items
  for (const item of userCart) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for product: ${item.name}`,
        available: product ? product.stock : 0
      });
    }
  }

  // Calculate total
  const total = userCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Apply coupon if provided
  let discount = 0;
  let couponApplied = null;

  if (coupon_code) {
    const coupons = getCoupons();
    const coupon = coupons.find((c) => c.code === coupon_code);

    if (!coupon) {
      return res.status(400).json({ error: 'Coupon not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiry_date < today) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (coupon.redeemed_by.includes(uid)) {
      return res.status(409).json({ error: 'Coupon already redeemed by this user' });
    }

    discount = parseFloat(((total * coupon.discount_percent) / 100).toFixed(2));
    couponApplied = coupon_code;

    // Mark coupon as redeemed
    coupon.redeemed_by.push(uid);
    const couponsPath = path.join(__dirname, '../data/coupons.json');
    fs.writeFileSync(couponsPath, JSON.stringify(coupons, null, 2));
  }

  const final_total = parseFloat((total - discount).toFixed(2));

  // Reduce stock
  for (const item of userCart) {
    const product = products.find((p) => p.id === item.product_id);
    product.stock -= item.quantity;
  }
  saveProducts(products);

  // Create order
  const order = {
    order_id: orderIdCounter++,
    user_id: uid,
    items: [...userCart],
    total: parseFloat(total.toFixed(2)),
    discount,
    coupon_applied: couponApplied,
    final_total,
    created_at: new Date().toISOString()
  };

  orders.push(order);

  // Clear cart
  carts[uid] = [];

  res.status(201).json(order);
});

// GET /api/orders — return all orders (requires auth)
router.get('/', authMiddleware, (req, res) => {
  res.json(orders);
});

module.exports = router;
