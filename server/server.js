require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('Fatal: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('Fatal: MONGO_URI environment variable is required');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const connect = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
