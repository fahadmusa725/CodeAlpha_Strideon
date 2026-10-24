const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

// Stock keys are "colorway-size" with "." replaced by "_", e.g. "Slate Blue-9_5".
// Quantities are deterministic so reseeding gives the same catalog every time.
function buildStock(colorways, offset) {
  const stock = {};
  colorways.forEach((colorway, ci) => {
    sizes.forEach((size, si) => {
      const key = `${colorway}-${size.toString().replace('.', '_')}`;
      stock[key] = 4 + ((ci * 5 + si * 3 + offset) % 9);
    });
  });
  return stock;
}

const catalog = [
  {
    name: 'Stratus Stability 2',
    brand: 'Altura',
    slug: 'stratus-stability-2',
    category: 'Running',
    description:
      'Daily trainer with a structured heel and a breathable mesh upper. A wide base keeps landings stable on long road runs.',
    price: 139.99,
    images: ['/products/running1.jpg'],
    colorways: ['Slate Blue', 'Graphite'],
    tags: ['running', 'stability', 'road'],
    isFeatured: false,
  },
  {
    name: 'Cloudline Max',
    brand: 'Altura',
    slug: 'cloudline-max',
    category: 'Running',
    description:
      'Maximum cushioning with a tall, rockered midsole for easy miles and recovery days. Lightweight mesh upper with a padded collar.',
    price: 159.99,
    images: ['/products/running2.jpg'],
    colorways: ['Teal', 'Ink Black', 'Sand'],
    tags: ['running', 'cushioned', 'road'],
    isFeatured: true,
  },
  {
    name: 'Pacer 24',
    brand: 'Kestrel',
    slug: 'pacer-24',
    category: 'Running',
    description:
      'Responsive everyday runner with an engineered mesh upper and a flat, durable outsole. Suited to tempo runs and daily mileage.',
    price: 129.99,
    images: ['/products/running3.jpg'],
    colorways: ['Cobalt', 'Black'],
    tags: ['running', 'tempo', 'road'],
    isFeatured: true,
  },
  {
    name: 'Lumen Tempo',
    brand: 'Kestrel',
    slug: 'lumen-tempo',
    category: 'Running',
    description:
      'Lightweight trainer with a seamless knit upper and reflective trim. Low-profile cushioning for faster workouts.',
    price: 134.99,
    images: ['/products/running4.jpg'],
    colorways: ['Pale Lime', 'Stone'],
    tags: ['running', 'lightweight', 'tempo'],
    isFeatured: false,
  },
  {
    name: 'Wavecrest 3',
    brand: 'Northfield',
    slug: 'wavecrest-3',
    category: 'Running',
    description:
      'Neutral road shoe with a soft midsole and a secure lace-up fit. Open mesh keeps the foot cool on warm days.',
    price: 119.99,
    images: ['/products/running5.jpg'],
    colorways: ['Aqua', 'Navy'],
    tags: ['running', 'neutral', 'road'],
    isFeatured: false,
  },
  {
    name: 'Ridgeline Trail',
    brand: 'Northfield',
    slug: 'ridgeline-trail',
    category: 'Running',
    description:
      'Trail runner with a deep-lugged outsole, a reinforced toe cap and a protective upper for rocky, uneven ground.',
    price: 149.99,
    images: ['/products/running6.jpg'],
    colorways: ['Navy Sand', 'Charcoal'],
    tags: ['running', 'trail', 'grip'],
    isFeatured: false,
  },
  {
    name: 'Cadence Flow',
    brand: 'Kestrel',
    slug: 'cadence-flow',
    category: 'Running',
    description:
      'Smooth-riding trainer with a thick foam midsole and a breathable upper. A good fit for steady long runs.',
    price: 124.99,
    images: ['/products/running7.jpg'],
    colorways: ['Sky Blue', 'White'],
    tags: ['running', 'cushioned', 'daily'],
    isFeatured: false,
  },
  {
    name: 'Court Rival High',
    brand: 'Halden',
    slug: 'court-rival-high',
    category: 'Basketball',
    description:
      'High-top court shoe with a padded ankle collar, a strap-assisted lockdown and a rubber cupsole for traction on hardwood.',
    price: 119.99,
    images: ['/products/basketball1.jpg'],
    colorways: ['Black White', 'Cream'],
    tags: ['basketball', 'high-top', 'court'],
    isFeatured: true,
  },
  {
    name: 'Baseline Low',
    brand: 'Halden',
    slug: 'baseline-low',
    category: 'Basketball',
    description:
      'Low-cut leather court shoe with a perforated toe box for ventilation. Works on the court and as an everyday sneaker.',
    price: 99.99,
    images: ['/products/basketball2.jpg'],
    colorways: ['Triple White', 'Grey'],
    tags: ['basketball', 'low-top', 'leather'],
    isFeatured: false,
  },
  {
    name: 'Tipoff Hi Canvas',
    brand: 'Halden',
    slug: 'tipoff-hi-canvas',
    category: 'Basketball',
    description:
      'Classic high-top in durable canvas with a vulcanized rubber sole and metal eyelets. Simple, flat and easy to wear.',
    price: 79.99,
    images: ['/products/basketball3.jpg'],
    colorways: ['Optic White', 'Black'],
    tags: ['basketball', 'high-top', 'canvas'],
    isFeatured: false,
  },
  {
    name: 'Mosaic Trainer',
    brand: 'Marlow',
    slug: 'mosaic-trainer',
    category: 'Lifestyle',
    description:
      'Chunky trainer built from mixed suede, mesh and leather panels with a buckle strap across the vamp. Cushioned platform sole.',
    price: 129.99,
    images: ['/products/lifestyle1.jpg'],
    colorways: ['Multi', 'Bone'],
    tags: ['lifestyle', 'chunky', 'colorblock'],
    isFeatured: true,
  },
  {
    name: 'Chrome Heritage Runner',
    brand: 'Marlow',
    slug: 'chrome-heritage-runner',
    category: 'Lifestyle',
    description:
      'Retro running silhouette in metallic silver and cream with layered overlays and a cushioned heel. Made for daily wear.',
    price: 149.99,
    images: ['/products/lifestyle2.jpg'],
    colorways: ['Silver', 'Cream Black'],
    tags: ['lifestyle', 'retro', 'metallic'],
    isFeatured: true,
  },
  {
    name: 'Cloud Chunk',
    brand: 'Vero',
    slug: 'cloud-chunk',
    category: 'Lifestyle',
    description:
      'Layered chunky sneaker in soft grey and white with a thick sole and padded tongue. Easy to pair with most outfits.',
    price: 109.99,
    images: ['/products/lifestyle3.jpg'],
    colorways: ['Grey White', 'Ivory'],
    tags: ['lifestyle', 'chunky', 'neutral'],
    isFeatured: false,
  },
  {
    name: 'Oat Platform Trainer',
    brand: 'Vero',
    slug: 'oat-platform-trainer',
    category: 'Lifestyle',
    description:
      'Tonal platform trainer with a molded sole and a cushioned footbed. Muted colors that suit everyday wear.',
    price: 99.99,
    images: ['/products/lifestyle4.jpg'],
    colorways: ['Oat', 'White'],
    tags: ['lifestyle', 'platform', 'tonal'],
    isFeatured: false,
  },
  {
    name: 'Tempo Street',
    brand: 'Marlow',
    slug: 'tempo-street',
    category: 'Lifestyle',
    description:
      'Sporty lifestyle sneaker with a mesh and synthetic upper, an orange midsole accent and a flexible outsole.',
    price: 114.99,
    images: ['/products/lifestyle5.jpg'],
    colorways: ['Grey Orange', 'White'],
    tags: ['lifestyle', 'sporty', 'mesh'],
    isFeatured: false,
  },
  {
    name: 'Pulse Knit',
    brand: 'Vero',
    slug: 'pulse-knit',
    category: 'Lifestyle',
    description:
      'Sock-like knit upper with a contrast heel and a springy foam sole. Light enough for all-day wear.',
    price: 139.99,
    images: ['/products/lifestyle6.jpg'],
    colorways: ['White Pink', 'Grey'],
    tags: ['lifestyle', 'knit', 'lightweight'],
    isFeatured: false,
  },
  {
    name: 'Sunday Canvas Low',
    brand: 'Ridgeway',
    slug: 'sunday-canvas-low',
    category: 'Skate',
    description:
      'Low-profile canvas shoe with a vulcanized sole and a padded collar. Flat, grippy and built to take board wear.',
    price: 64.99,
    images: ['/products/skate1.jpg'],
    colorways: ['Mustard', 'Off White'],
    tags: ['skate', 'canvas', 'low-top'],
    isFeatured: false,
  },
  {
    name: 'Crimson Hi Suede',
    brand: 'Ridgeway',
    slug: 'crimson-hi-suede',
    category: 'Skate',
    description:
      'High-top in soft suede with a reinforced toe cap and a vulcanized rubber sole. Extra ankle coverage for rough sessions.',
    price: 74.99,
    images: ['/products/skate2.jpg'],
    colorways: ['Crimson', 'Black'],
    tags: ['skate', 'suede', 'high-top'],
    isFeatured: false,
  },
  {
    name: 'Sidestripe Low',
    brand: 'Ridgeway',
    slug: 'sidestripe-low',
    category: 'Skate',
    description:
      'Low-top skate shoe in canvas and suede with a contrast side stripe, a padded tongue and a waffle-textured sole.',
    price: 69.99,
    images: ['/products/skate3.jpg'],
    colorways: ['Burgundy', 'Navy'],
    tags: ['skate', 'low-top', 'durable'],
    isFeatured: true,
  },
];

// A few products with an out-of-stock and a nearly sold-out size.
const limited = ['pacer-24', 'court-rival-high', 'crimson-hi-suede'];

const products = catalog.map((product, index) => {
  const stock = buildStock(product.colorways, index);
  if (limited.includes(product.slug)) {
    const [first] = product.colorways;
    stock[`${first}-7`] = 0;
    stock[`${first}-11_5`] = 2;
  }
  return { ...product, sizes, stock };
});

module.exports = products;