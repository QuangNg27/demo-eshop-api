const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const JWT_SECRET = 'demo-secret-key';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const usersPath = path.join(__dirname, '../data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

module.exports = router;
