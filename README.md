# Strideon

Footwear e-commerce application covering running, basketball, lifestyle and skate, built with the MERN stack.

![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat)
![Vite](https://img.shields.io/badge/Vite-8.3.0-646C9A?style=flat)
![React Router](https://img.shields.io/badge/React_Router-7.18.4-CA4245?style=flat)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat)
![Express](https://img.shields.io/badge/Express-4.19.2-000000?style=flat)
![MongoDB](https://img.shields.io/badge/MongoDB_with_Mongoose-8.4.0-47A248?style=flat)
![Stripe](https://img.shields.io/badge/Stripe-22.6.2-008CDD?style=flat)
![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat)

**Live demo:** https://strideon-store.vercel.app

Built during the CodeAlpha internship.

## Overview

Strideon is an online store specializing in athletic and lifestyle footwear across running, basketball, lifestyle and skate categories. Customers can search the catalog, filter by category, size or price, view stock per colorway and size, save items to a server-synced cart, and complete purchases using Stripe Checkout test mode or simulated checkout. An authenticated admin panel allows store operators to monitor performance metrics such as revenue, order volume, low-stock alerts and top-selling products, as well as manage inventory and update order fulfillment statuses.

## Features

- Product catalog with category, size, and price filters, product search, plus sorting
- Product pages with colorway and size selection and stock levels
- Slide-in cart, with carts saved to the server for logged-in users
- Checkout with Stripe Checkout (test mode), or a simulated order when no Stripe key is set
- Register and login with JWT authentication
- Order history
- Admin dashboard with overview stats (revenue, orders, top products, low stock), product inventory management and order status updates

## Project Structure

```
Strideon/
├── server/
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Admin, auth, cart, order and product controllers
│   │   └── adminController.js # Admin dashboard aggregation stats
│   ├── middleware/            # Auth, admin guard, async handler, error handler
│   ├── models/                # User, Product, Cart, Order
│   ├── routes/                # /api/admin, /api/auth, /api/cart, /api/orders, /api/products
│   ├── seed/
│   │   ├── productsData.js    # Catalog definitions with colorways, sizes and stock
│   │   └── seedProducts.js    # Reseeds catalog and creates admin account
│   ├── utils/
│   │   └── stock.js           # Stock key formatting utility
│   ├── .env.example
│   ├── server.js              # Express entry point
│   └── vercel.json            # Vercel config
└── client/
    ├── public/
    │   └── products/          # Product catalog images
    ├── src/
    │   ├── api/axios.js       # Axios client with auth header
    │   ├── components/        # Layout (Navbar, Footer, CartDrawer) and UI components
    │   ├── context/           # AuthContext, CartContext, ThemeContext
    │   ├── pages/             # Storefront, cart, checkout, auth, order history
    │   │   └── admin/         # Dashboard, products, orders
    │   ├── utils/             # Formatters and country list
    │   ├── App.jsx            # Routes
    │   └── index.css          # Design system and CSS variables
    ├── .env.example
    └── vite.config.js         # Dev server and proxy config
```

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string. Server will not start without it. |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWT authentication tokens. Server will not start without it. |
| `PORT` | No | Port on which the Express server listens. Defaults to `5000`. |
| `CLIENT_URL` | No | Allowed frontend origin for CORS and checkout redirect URLs. Defaults to `http://localhost:5173`. |
| `JWT_EXPIRES_IN` | No | Token expiration duration (for example, `7d`). Defaults to `7d`. |
| `NODE_ENV` | No | Current runtime environment (`development` or `production`). In production, detailed error stacks are omitted. |
| `STRIPE_SECRET_KEY` | No | Stripe test secret key (`sk_test_...`). If omitted, checkout runs in simulated mode. |
| `SEED_ADMIN_EMAIL` | No | Email address for the admin account created during database seed. |
| `SEED_ADMIN_PASSWORD` | No | Password for the admin account created during database seed. |

### Client (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Base URL for backend API requests. Defaults to `/api` (proxied by Vite dev server). |
| `VITE_EMAILJS_SERVICE_ID` | No | EmailJS service ID used by the contact form. |
| `VITE_EMAILJS_TEMPLATE_ID` | No | EmailJS template ID used by the contact form. |
| `VITE_EMAILJS_PUBLIC_KEY` | No | EmailJS public key used by the contact form. |

## Local Setup

You need Node.js and a MongoDB connection string.

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your values, then start the API:

```bash
npm run dev
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` in your browser.

On Windows, use `copy .env.example .env` instead of `cp`.

### 3. Seed the database

The seed script replaces existing products with the catalog defined in `server/seed/productsData.js` and creates an admin account. Product images are served directly from `client/public/products`. Because reseeding deletes and replaces products, existing carts and past orders in the database may reference removed product IDs.

Set these two variables in `server/.env` before running the seed script:

```env
SEED_ADMIN_EMAIL=your_admin_email
SEED_ADMIN_PASSWORD=your_admin_password
```

Then run:

```bash
cd server
npm run seed
```

If either variable is missing, the seed script still loads the products and skips creating the admin account.

## Stripe Test Mode

By default the app runs in simulated mode, so no real card is needed. To use Stripe Checkout in test mode:

1. Get your test secret key from the [Stripe test dashboard](https://dashboard.stripe.com/test/apikeys).
2. Set `STRIPE_SECRET_KEY=sk_test_...` in `server/.env`.
3. Restart the server.

With a key set, "Proceed to Payment" redirects to Stripe's hosted checkout page. Order payment is confirmed through the success redirect, and there is no Stripe webhook yet.

### Test Cards

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0027 6000 3184` | 3D Secure authentication required |

Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP code.
