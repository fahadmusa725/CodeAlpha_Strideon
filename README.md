# Strideon — Sneakers & Streetwear E-Commerce Platform

A production-grade, urban dark-aesthetic MERN stack e-commerce web application.

---

## Tech Stack & Architecture

- **Backend**: Node.js, Express.js (MVC Pattern), MongoDB (Mongoose), JWT Authentication, bcryptjs password hashing, express-validator.
- **Frontend**: React 18, Vite, React Router v6, Context API (Auth & Cart state management), Axios (with auto-auth interceptors), Vanilla CSS custom design system.
- **Aesthetic**: Bold streetwear styling, dark theme, high-contrast electric orange accent (`#FF4D00`), `Space Grotesk` & `Archivo Black` typography, smooth micro-interactions, skeleton loaders, and slide-in cart drawer.

---

## Project Structure

```
Stirdeon/
├── server/
│   ├── config/db.js                 # MongoDB connection handler
│   ├── controllers/                 # auth, product, cart, and order controllers
│   ├── middleware/                  # auth token check, admin guard, central error handler
│   ├── models/                      # User, Product, Cart, Order models
│   ├── routes/                      # RESTful endpoints (/api/auth, /api/products, /api/cart, /api/orders)
│   ├── seed/seedProducts.js         # Real sneaker catalog seed data & admin creator
│   ├── .env.example
│   ├── server.js                    # Express application entry
│   └── vercel.json                  # Serverless Vercel config
└── client/
    ├── src/
    │   ├── api/axios.js             # Axios client with bearer token interceptor
    │   ├── components/              # Layout (Navbar, Footer, CartDrawer), UI (ProductCard, SkeletonCard, RouteGuards)
    │   ├── context/                 # AuthContext, CartContext
    │   ├── pages/                   # Home, ProductListing, ProductDetail, Cart, Checkout, Login, Register, OrderHistory
    │   │   └── admin/               # Dashboard, Products Inventory, Order Fulfillment
    │   ├── utils/formatters.js      # Currency, date, and slug utilities
    │   ├── App.jsx                  # Main router and route definitions
    │   └── index.css                # Core design system & CSS variables
    ├── .env.example
    └── vite.config.js               # Dev server & proxy config
```

---

## Setup & Running Locally

### 1. Backend Setup
1. Open a terminal in `server/`:
   ```bash
   cd server
   npm install
   ```
2. Create `.env` based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
3. Populate database with products and default admin:
   ```bash
   node seed/seedProducts.js
   ```
   *Default Admin credentials:* `admin@strideon.com` / `Admin@1234`
4. Start the backend:
   ```bash
   npm run dev  # or npm start
   ```

### 2. Frontend Setup
1. Open a terminal in `client/`:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## Available Pages & Features

1. **Home (`/`)**: Hero banner, category highlights (Running, Basketball, Lifestyle, Skate), featured drops, animated marquee.
2. **Product Catalog (`/products`)**: Filter by category, interactive price range slider, size picker chips, and sorting (Newest, Price asc/desc).
3. **Product Detail (`/products/:id`)**: High-res multi-image gallery with thumbnails, colorway swatches, size grid with real-time stock availability, and related product recommendations.
4. **Interactive Bag / Cart Drawer**: Slide-in cart accessible anywhere, stepper controls, subtotal computation, server-persisted user carts.
5. **Simulated Checkout (`/checkout`)**: Shipping details form validation, live order calculation, instant placement.
6. **Authentication (`/login`, `/register`)**: JWT auth, instant validation, role extraction.
7. **Order History (`/orders`)**: List of past customer orders with delivery status tags.
8. **Admin Management (`/admin`)**:
   - **Dashboard**: High-level revenue and order metrics.
   - **Inventory Management (`/admin/products`)**: Add new sneaker models with variants and update existing drops.
   - **Order Fulfillment (`/admin/orders`)**: Real-time status update dropdown (Processing → Shipped → Delivered).

---

## Stripe Payments

Strideon supports real Stripe Checkout (hosted payment page). By default the app runs in **Simulated Mode** (no real card required) — great for demos.

### Enable Real Stripe Test Payments

1. Get your test keys from [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Add to `server/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   ```
3. Add to `client/.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   ```
4. Restart both dev servers. The "Proceed to Payment" button will now redirect to Stripe's hosted checkout.

### Stripe Test Card Numbers

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 9995` | ❌ Payment declined (insufficient funds) |
| `4000 0027 6000 3184` | 🔐 3D Secure authentication required |

**CVC**: any 3 digits · **Expiry**: any future date · **ZIP**: any 5 digits

### Payment Flow

1. User fills shipping form on `/checkout` → clicks "Proceed to Payment"
2. Backend creates a Stripe Checkout Session (or simulated order if key is empty)
3. If Stripe: browser redirects to `checkout.stripe.com`
4. On success: Stripe redirects back to `/orders?session_id=...&order_id=...`
5. Frontend calls `/api/orders/verify-session` → marks order `Paid` → clears cart
6. On cancel: redirected back to `/checkout?canceled=true` with a notice

