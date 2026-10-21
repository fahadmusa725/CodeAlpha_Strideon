# Strideon

Strideon is a footwear e-commerce app covering running, basketball, lifestyle and skate, built with the MERN stack (MongoDB, Express, React, Node.js). It includes a storefront, a cart, checkout with Stripe test mode, order history and an admin area.

Built during the CodeAlpha internship.

## Features

- Product catalog with category, size, and price filters, product search, plus sorting
- Product pages with colorway and size selection and stock levels
- Slide-in cart, with carts saved to the server for logged-in users
- Checkout with Stripe Checkout (test mode), or a simulated order when no Stripe key is set
- Register and login with JWT authentication
- Order history
- Admin dashboard with overview stats (revenue, orders, top products, low stock), product inventory management and order status updates

## Tech Stack

- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT, bcryptjs
- **Frontend:** React 19, Vite, React Router, Context API, Axios
- **Payments:** Stripe Checkout
- **Contact form:** EmailJS

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
