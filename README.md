# EShop Demo API

> Minimal Node.js/Express REST API — built for Postman testing activity.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# Server runs at http://localhost:3000
```

> **Tip:** Use `npm run dev` for hot-reload during development (requires nodemon).

---

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login, get JWT token |
| GET | `/api/products` | ❌ | Get all products |
| GET | `/api/products/:id` | ❌ | Get product by ID |
| POST | `/api/cart` | ✅ | Add item to cart |
| GET | `/api/cart/:user_id` | ✅ | Get user's cart |
| POST | `/api/orders` | ✅ | Create order from cart |
| GET | `/api/orders` | ✅ | Get all orders |
| POST | `/api/coupon/redeem` | ✅ | Redeem a coupon |

> ✅ Requires `Authorization: Bearer <token>` header.

---

## Test Users

| Username | Password | Email |
|----------|----------|-------|
| alice | password123 | alice@test.com |
| bob | password456 | bob@test.com |
| charlie | password789 | charlie@test.com |

---

## Example Flow

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}
```
→ Copy the `token` from the response.

### 2. Get Products
```http
GET /api/products
```

### 3. Add to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "product_id": 1,
  "quantity": 2
}
```

### 4. Place Order (with coupon)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "coupon_code": "SAVE20"
}
```

### 5. Redeem Coupon Directly
```http
POST /api/coupon/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "coupon_code": "SAVE20",
  "user_id": 1
}
```

---

## Available Coupons

| Code | Discount | Status |
|------|----------|--------|
| `SAVE20` | 20% off | ✅ Valid |
| `HALF` | 50% off | ✅ Valid |
| `EXPIRED10` | 10% off | ❌ Expired |

---

## Technical Notes

- **No database** — data loaded from `data/*.json` files. Cart & Orders are in-memory (reset on server restart).
- **JWT secret:** `demo-secret-key` (hardcoded — demo only, never use in production)
- **Port:** Default `3000`. Override with `PORT` env variable: `PORT=4000 npm start`
- **CORS:** Enabled for all origins.

---

## API Reference

See [`api_specification.yaml`](./api_specification.yaml) for the full OpenAPI 3.0 spec.
