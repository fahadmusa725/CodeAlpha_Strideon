import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, '../screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const routes = [
    { name: '01_home', url: 'http://localhost:5173/' },
    { name: '02_products_listing', url: 'http://localhost:5173/products' },
    { name: '03_product_detail', url: 'http://localhost:5173/products/air-phantom-x3' },
    { name: '04_cart', url: 'http://localhost:5173/cart' },
    { name: '05_login', url: 'http://localhost:5173/login' },
    { name: '06_register', url: 'http://localhost:5173/register' },
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.name}...`);
    await page.goto(r.url, { waitUntil: 'networkidle2' });
    await new Promise((res) => setTimeout(res, 800));
    await page.screenshot({ path: path.join(outDir, `${r.name}.png`) });
  }

  // Login as admin
  console.log('Logging in as admin...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.type('#email', 'admin@strideon.com');
  await page.type('#password', 'Admin@1234');
  await page.click('#login-btn');
  await new Promise((res) => setTimeout(res, 1200));

  // Capture authenticated & admin pages
  console.log('Capturing orders...');
  await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 800));
  await page.screenshot({ path: path.join(outDir, '07_orders.png') });

  console.log('Capturing admin dashboard...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 800));
  await page.screenshot({ path: path.join(outDir, '08_admin_dashboard.png') });

  console.log('Capturing admin products...');
  await page.goto('http://localhost:5173/admin/products', { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 800));
  await page.screenshot({ path: path.join(outDir, '09_admin_products.png') });

  // Add item to cart and capture checkout
  console.log('Adding item to bag & capturing checkout...');
  await page.goto('http://localhost:5173/products/air-phantom-x3', { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 800));
  await page.click('#add-to-cart-btn');
  await new Promise((res) => setTimeout(res, 800));
  await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle2' });
  await new Promise((res) => setTimeout(res, 800));
  await page.screenshot({ path: path.join(outDir, '10_checkout.png') });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
