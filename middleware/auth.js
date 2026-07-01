const jwt = require('jsonwebtoken');

const JWT_SECRET = 'demo-secret-key';

/**
 * JWT Authentication Middleware
 * Reads Bearer token from Authorization header, verifies it,
 * and attaches req.user = { id, username } for downstream routes.
 *
 * Applied to: /api/cart, /api/orders, /api/coupon
 * NOT applied to: /api/auth/login, /api/products
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header. Expected: Bearer <token>' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
