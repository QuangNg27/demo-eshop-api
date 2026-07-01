const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// In-memory cart store: { [user_id]: [ { product_id, quantity, name, price } ] }
const carts = {};

const getProducts = () => {
  const filePath = path.join(__dirname, '../data/products.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// POST /api/cart — add item to cart (requires auth)
router.post('/', authMiddleware, (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({ error: 'user_id, product_id, and quantity are required' });
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }

  const products = getProducts();
  const product = products.find((p) => p.id === parseInt(product_id));

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.stock < qty) {
    return res.status(400).json({
      error: 'Insufficient stock',
      available: product.stock
    });
  }

  const uid = parseInt(user_id);
  if (!carts[uid]) {
    carts[uid] = [];
  }

  // Check if product already in cart — update quantity
  const existingItem = carts[uid].find((item) => item.product_id === product.id);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    carts[uid].push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty
    });
  }

  res.status(201).json({
    message: 'Item added to cart',
    cart: carts[uid]
  });
});

// GET /api/cart/:user_id — get cart for a user (requires auth)
router.get('/:user_id', authMiddleware, (req, res) => {
  const uid = parseInt(req.params.user_id);
  const userCart = carts[uid] || [];

  const total = userCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    user_id: uid,
    items: userCart,
    total: parseFloat(total.toFixed(2))
  });
});

// Export carts so orders.js can access & clear it
module.exports = router;
module.exports.carts = carts;
