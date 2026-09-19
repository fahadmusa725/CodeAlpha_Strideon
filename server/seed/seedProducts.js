require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');

const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

function buildStock(colorways, sizes, baseQty = 8) {
  const stock = {};
  for (const cw of colorways) {
    for (const sz of sizes) {
      const formattedSize = sz.toString().replace('.', '_');
      stock[`${cw}-${formattedSize}`] = Math.floor(Math.random() * baseQty) + 1;
    }
  }
  return stock;
}

const products = [
  {
    name: 'Air Phantom X3',
    brand: 'Nike',
    slug: 'air-phantom-x3',
    category: 'Running',
    description:
      'Engineered for long-distance runners who refuse to slow down. ReactFoam midsole absorbs impact while propelling every stride forward. Mesh upper locks in your foot without compromise.',
    price: 149.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    colorways: ['Ghost White', 'Volt', 'Midnight Navy'],
    sizes,
    stock: buildStock(['Ghost White', 'Volt', 'Midnight Navy'], sizes),
    tags: ['running', 'foam', 'lightweight'],
    isFeatured: true,
  },
  {
    name: 'Ultraboost 23 Prime',
    brand: 'Adidas',
    slug: 'ultraboost-23-prime',
    category: 'Running',
    description:
      'Continental rubber outsole meets a full-length Boost midsole for a ride that returns every bit of energy you put in. The Primeknit+ upper adapts to your foot like a second skin.',
    price: 189.99,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800',
    ],
    colorways: ['Core Black', 'Cloud White', 'Solar Red'],
    sizes,
    stock: buildStock(['Core Black', 'Cloud White', 'Solar Red'], sizes),
    tags: ['boost', 'primeknit', 'running'],
    isFeatured: true,
  },
  {
    name: 'Fresh Foam X 1080v13',
    brand: 'New Balance',
    slug: 'fresh-foam-x-1080v13',
    category: 'Running',
    description:
      'The gold standard for plush daily training. A generous Fresh Foam X midsole cushions every landing while the Hypoknit upper delivers breathability without sacrificing structure.',
    price: 164.99,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    ],
    colorways: ['Castlerock', 'Neon Dragonfly', 'Wax Blue'],
    sizes,
    stock: buildStock(['Castlerock', 'Neon Dragonfly', 'Wax Blue'], sizes),
    tags: ['daily trainer', 'plush', 'foam'],
    isFeatured: false,
  },
  {
    name: 'Jordan Apex Flux',
    brand: 'Jordan',
    slug: 'jordan-apex-flux',
    category: 'Basketball',
    description:
      'Designed for the explosive guard who thrives in transition. Full-length Zoom Air gives instant response off every cut. Herringbone outsole digs into hardwood and keeps you planted on defensive slides.',
    price: 179.99,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800',
      'https://images.unsplash.com/photo-1512990414788-d97cb4a25db3?w=800',
    ],
    colorways: ['Bred', 'Royal Blue', 'Shadow'],
    sizes,
    stock: buildStock(['Bred', 'Royal Blue', 'Shadow'], sizes),
    tags: ['basketball', 'zoom', 'low-top'],
    isFeatured: true,
  },
  {
    name: 'Kyrie Infinity Low',
    brand: 'Nike',
    slug: 'kyrie-infinity-low',
    category: 'Basketball',
    description:
      'Built for players who change direction faster than defenders can react. 360-degree traction pattern grips the court from every angle, while the Zoom Turbo unit keeps you explosive through four quarters.',
    price: 129.99,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    ],
    colorways: ['Black Infrared', 'Pure Platinum', 'Laser Crimson'],
    sizes,
    stock: buildStock(['Black Infrared', 'Pure Platinum', 'Laser Crimson'], sizes),
    tags: ['basketball', 'low-top', 'traction'],
    isFeatured: false,
  },
  {
    name: 'Harden Vol. 8',
    brand: 'Adidas',
    slug: 'harden-vol-8',
    category: 'Basketball',
    description:
      'Stepback, fadeaway, pull-up — the Harden Vol. 8 handles it all. Full-length Bounce Pro midsole absorbs court contact on those long-distance jumpers and still kicks back energy when it counts.',
    price: 159.99,
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    colorways: ['Better Scarlet', 'Wonder Steel', 'Impact Orange'],
    sizes,
    stock: buildStock(['Better Scarlet', 'Wonder Steel', 'Impact Orange'], sizes),
    tags: ['basketball', 'bounce', 'signature'],
    isFeatured: false,
  },
  {
    name: 'Air Force 1 Shadow',
    brand: 'Nike',
    slug: 'air-force-1-shadow',
    category: 'Lifestyle',
    description:
      'The icon, amplified. Stacked midsole and layered upper details give the classic AF1 silhouette a fresh dimension without losing the clean aesthetic that made it a streetwear staple.',
    price: 119.99,
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    ],
    colorways: ['White / Pale Ivory', 'Black / Dark Smoke Grey', 'Photon Dust'],
    sizes,
    stock: buildStock(['White / Pale Ivory', 'Black / Dark Smoke Grey', 'Photon Dust'], sizes),
    tags: ['lifestyle', 'af1', 'classic'],
    isFeatured: true,
  },
  {
    name: '574 Core',
    brand: 'New Balance',
    slug: '574-core',
    category: 'Lifestyle',
    description:
      'A true archival silhouette that has outlasted every trend cycle. ENCAP midsole technology offers support and durability, while the suede and mesh upper keeps it honest and wearable daily.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    colorways: ['Grey / White', 'Navy / Silver', 'Burgundy'],
    sizes,
    stock: buildStock(['Grey / White', 'Navy / Silver', 'Burgundy'], sizes),
    tags: ['lifestyle', 'retro', 'encap'],
    isFeatured: false,
  },
  {
    name: 'Stan Smith Lux',
    brand: 'Adidas',
    slug: 'stan-smith-lux',
    category: 'Lifestyle',
    description:
      'The most debated sneaker in history, now updated with premium full-grain leather and a slightly elevated midsole. Still minimal, still sharp, still the right answer to almost any outfit.',
    price: 109.99,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    colorways: ['Cloud White / Green', 'Core Black / White', 'Chalk White / Preloved Ink'],
    sizes,
    stock: buildStock(['Cloud White / Green', 'Core Black / White', 'Chalk White / Preloved Ink'], sizes),
    tags: ['lifestyle', 'leather', 'minimal'],
    isFeatured: true,
  },
  {
    name: 'Dunk Low Pro',
    brand: 'Nike',
    slug: 'dunk-low-pro',
    category: 'Skate',
    description:
      'Nike SB engineered the Dunk for street skating. Zoom Air heel unit cushions landings on stairs and ledges, while the toe cap and ankle padding take the punishment that concrete dishes out.',
    price: 104.99,
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
    colorways: ['Black / White', 'University Red', 'Hemp'],
    sizes,
    stock: buildStock(['Black / White', 'University Red', 'Hemp'], sizes),
    tags: ['skate', 'sb', 'zoom'],
    isFeatured: true,
  },
  {
    name: 'Emerica Reynolds G6',
    brand: 'Emerica',
    slug: 'emerica-reynolds-g6',
    category: 'Skate',
    description:
      'Andrew Reynolds designed this with one mandate: survive. Hexlite foam heel, vulcanized outsole, and reinforced ollie zone mean this shoe keeps going long after the session ends.',
    price: 74.99,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
    ],
    colorways: ['Black / White / Gold', 'Dark Grey', 'Brown / Gum'],
    sizes,
    stock: buildStock(['Black / White / Gold', 'Dark Grey', 'Brown / Gum'], sizes),
    tags: ['skate', 'vulc', 'signature'],
    isFeatured: false,
  },
  {
    name: 'Vans Skate Half Cab',
    brand: 'Vans',
    slug: 'vans-skate-half-cab',
    category: 'Skate',
    description:
      'Steve Caballero cut the Cab in half in 1989 and created the blueprint for modern mid-top skating. PopCush insole and UltraCush Lite heel absorber make the 2024 version ready for anything.',
    price: 84.99,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    ],
    colorways: ['Black', 'White', 'Antique White / Black'],
    sizes,
    stock: buildStock(['Black', 'White', 'Antique White / Black'], sizes),
    tags: ['skate', 'mid-top', 'classic'],
    isFeatured: false,
  },
  {
    name: 'Gel-Kayano 30',
    brand: 'ASICS',
    slug: 'gel-kayano-30',
    category: 'Running',
    description:
      'Three decades of stability running research built into a single shoe. LITETRUSS technology guides overpronating runners into a more efficient stride, while the FF BLAST+ ECO midsole keeps the ride smooth mile after mile.',
    price: 159.99,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    colorways: ['Midnight / Pure Silver', 'French Blue / Saffron', 'Black / Pure Silver'],
    sizes,
    stock: buildStock(['Midnight / Pure Silver', 'French Blue / Saffron', 'Black / Pure Silver'], sizes),
    tags: ['running', 'stability', 'gel'],
    isFeatured: false,
  },
  {
    name: 'Adidas Forum 84 Low',
    brand: 'Adidas',
    slug: 'adidas-forum-84-low',
    category: 'Lifestyle',
    description:
      'A basketball archive piece that became a streetwear essential. Full-grain leather upper, T-toe overlay, and ankle strap details keep the 1984 DNA intact while the clean profile works with almost anything.',
    price: 99.99,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    ],
    colorways: ['Cloud White / Royal Blue', 'Core Black / Cloud White', 'Wonder Taupe'],
    sizes,
    stock: buildStock(['Cloud White / Royal Blue', 'Core Black / Cloud White', 'Wonder Taupe'], sizes),
    tags: ['lifestyle', 'retro', 'leather'],
    isFeatured: false,
  },
  {
    name: 'New Balance 990v6',
    brand: 'New Balance',
    slug: 'new-balance-990v6',
    category: 'Lifestyle',
    description:
      'Made in USA. The 990 has been the quiet benchmark for American sneaker craftsmanship since 1982. Version six refines the silhouette with an updated ENCAP midsole and premium pigskin suede without straying from what made it great.',
    price: 199.99,
    images: [
      'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800',
    ],
    colorways: ['M990GL6 Grey', 'M990NV6 Navy', 'M990BK6 Black'],
    sizes,
    stock: buildStock(['M990GL6 Grey', 'M990NV6 Navy', 'M990BK6 Black'], sizes),
    tags: ['lifestyle', 'made-in-usa', 'premium'],
    isFeatured: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany();
  console.log('Cleared existing products');

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  // Upsert admin account
  const existing = await User.findOne({ email: 'admin@strideon.com' });
  if (!existing) {
    await User.create({
      name: 'Strideon Admin',
      email: 'admin@strideon.com',
      passwordHash: 'Admin@1234',
      role: 'admin',
    });
    console.log('Created admin user: admin@strideon.com / Admin@1234');
  } else {
    console.log('Admin user already exists');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
