import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'screenshots');

const BASE = 'http://localhost:5173';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // ── 1. Home footer ──────────────────────────────────────────
  console.log('→ Home page / footer...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(600);
  const footer = await page.$('footer.footer');
  if (footer) {
    await footer.screenshot({ path: `${OUT}/footer_redesign.png` });
    console.log('   ✓ footer_redesign.png');
  }

  // ── 2. Checkout — country dropdown ──────────────────────────
  // First: log in
  console.log('→ Logging in...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.type('#email', 'admin@strideon.com');
  await page.type('#password', 'Admin@1234');
  await page.click('button[type="submit"]');
  await sleep(1500);

  // Add a product to cart if empty - go to first product
  console.log('→ Adding product to cart...');
  await page.goto(`${BASE}/products`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  // Click the first product card
  const firstCard = await page.$('.product-card');
  if (firstCard) {
    await firstCard.click();
    await sleep(1200);
    // Select a size
    const sizeBtn = await page.$('.size-btn:not([disabled])');
    if (sizeBtn) await sizeBtn.click();
    await sleep(300);
    // Click add to cart
    const addBtn = await page.$('#add-to-cart-btn');
    if (addBtn) await addBtn.click();
    await sleep(800);
  }

  // Navigate to checkout
  console.log('→ Checkout page...');
  await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Screenshot: full checkout page
  await page.screenshot({ path: `${OUT}/checkout_payment.png`, fullPage: false });
  console.log('   ✓ checkout_payment.png');

  // Open country dropdown
  const countrySelect = await page.$('#country');
  if (countrySelect) {
    await page.evaluate(() => {
      const el = document.getElementById('country');
      el.size = 8; // temporarily show as listbox
    });
    await sleep(300);
    await page.screenshot({ path: `${OUT}/checkout_country_dropdown.png` });
    console.log('   ✓ checkout_country_dropdown.png');
  }

  // ── 3. Orders page ─────────────────────────────────────────
  console.log('→ Orders page...');
  await page.goto(`${BASE}/orders`, { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/orders_page_final.png` });
  console.log('   ✓ orders_page_final.png');

  // ── 4. Footer on products page ──────────────────────────────
  console.log('→ Products page footer...');
  await page.goto(`${BASE}/products`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(600);
  const footer2 = await page.$('footer.footer');
  if (footer2) {
    await footer2.screenshot({ path: `${OUT}/footer_products.png` });
    console.log('   ✓ footer_products.png');
  }

  await browser.close();
  console.log('\n✅ All screenshots saved to:', OUT);
}

run().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
