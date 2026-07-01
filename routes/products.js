const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const getProducts = () => {
  const filePath = path.join(__dirname, '../data/products.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// GET /api/products — return all products
router.get('/', (req, res) => {
  const products = getProducts();
  res.json(products);
});

// GET /api/products/:id — return a single product by id
router.get('/:id', (req, res) => {
  const products = getProducts();
  const product = products.find((p) => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

module.exports = router;
