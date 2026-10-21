require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');

const products = require('./productsData');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany();
  console.log('Cleared existing products');

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log('Skipping admin user: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD');
  } else {
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        name: 'Strideon Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`Created admin user: ${adminEmail}`);
    } else {
      console.log('Admin user already exists');
    }
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
