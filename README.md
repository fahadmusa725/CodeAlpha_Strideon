# Strideon

Strideon is a sneaker and streetwear e-commerce app built with the MERN stack (MongoDB, Express, React, Node.js). It includes a storefront, a cart, checkout with Stripe test mode, order history, and an admin area.

Built during the CodeAlpha internship.

## Features

- Product catalog with category, size, and price filters, plus sorting
- Product pages with colorway and size selection and stock levels
- Slide-in cart, with carts saved to the server for logged-in users
- Checkout with Stripe Checkout (test mode), or a simulated order when no Stripe key is set
- Register and login with JWT authentication
- Order history
- Admin dashboard, product inventory management, and order status updates

## Tech Stack

- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT, bcryptjs
- **Frontend:** React 18, Vite, React Router, Context API, Axios
- **Payments:** Stripe Checkout
- **Contact form:** EmailJS

## Project Structure

```
Stirdeon/
├── server/
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Auth, product, cart, and order controllers
│   ├── middleware/            # Auth, admin guard, error handler
│   ├── models/                # User, Product, Cart, Order
│   ├── routes/                # /api/auth, /api/products, /api/cart, /api/orders
│   ├── seed/seedProducts.js   # Product seed data and admin account
│   ├── .env.example
│   ├── server.js              # Express entry point
│   └── vercel.json            # Vercel config
└── client/
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

The seed script replaces the existing products with the sneaker catalog and creates an admin account. Set these two variables in `server/.env` before running it:

```env
SEED_ADMIN_EMAIL=your_admin_email
SEED_ADMIN_PASSWORD=your_admin_password
```

Then run:

```bash
cd server
npm run seed
```

If either variable is missing, the seed still loads the products and skips creating the admin account.

## Stripe Test Mode

By default the app runs in simulated mode, so no real card is needed. To use Stripe Checkout in test mode:

1. Get your test keys from the [Stripe test dashboard](https://dashboard.stripe.com/test/apikeys).
2. Set `STRIPE_SECRET_KEY=sk_test_...` in `server/.env`.
3. Set `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` in `client/.env`.
4. Restart both dev servers.

With a key set, "Proceed to Payment" redirects to Stripe's hosted checkout page.

### Test Cards

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0027 6000 3184` | 3D Secure authentication required |

Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP code.
