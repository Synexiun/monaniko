import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// Helper: assert a page loads without a 500 error
async function expectPageOk(page: import('@playwright/test').Page, url: string) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  const status = response?.status() ?? 0;
  expect(
    status,
    `Expected ${url} to return 2xx or 3xx but got ${status}`
  ).toBeLessThan(500);
}

test.describe('Public pages — load without errors', () => {
  test('Home page loads with site name', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title).toMatch(/mona niko/i);
  });

  test('Gallery page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/gallery`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Collections page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/collections`);
  });

  test('Shop page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/shop`);
  });

  test('Shop — Originals page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/shop/originals`);
  });

  test('Shop — Prints page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/shop/prints`);
  });

  test('Shop — Merch page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/shop/merch`);
  });

  test('Shop — Designers page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/shop/designers`);
  });

  test('Workshops page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/workshops`);
  });

  test('About page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/about`);
  });

  test('Contact page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/contact`);
  });

  test('FAQ page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/faq`);
  });

  test('Press page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/press`);
  });

  test('Journal page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/journal`);
  });

  test('Policies page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/policies`);
  });

  test('Kids Club page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/kids-club`);
  });

  test('Commissions page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/commissions`);
  });

  test('Collector Club page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/collector-club`);
  });

  test('Auctions page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/auctions`);
  });

  test('Account page renders (may redirect to login)', async ({ page }) => {
    const response = await page.goto(`${BASE}/account`, { waitUntil: 'domcontentloaded' });
    const status = response?.status() ?? 0;
    expect(status).toBeLessThan(500);
  });

  test('Checkout page renders', async ({ page }) => {
    const response = await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
    const status = response?.status() ?? 0;
    expect(status).toBeLessThan(500);
  });

  test('sitemap.xml returns XML content', async ({ page }) => {
    const response = await page.goto(`${BASE}/sitemap.xml`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toMatch(/<urlset|<sitemapindex/i);
  });

  test('robots.txt returns valid content', async ({ page }) => {
    const response = await page.goto(`${BASE}/robots.txt`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    const text = await response?.text() ?? '';
    expect(text).toMatch(/user-agent/i);
  });
});

test.describe('Navigation — links visible in header', () => {
  test('Gallery link appears in nav', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const galleryLink = page.locator('a[href="/gallery"]').first();
    await expect(galleryLink).toBeVisible();
  });

  test('Shop link appears in nav', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const shopLink = page.locator('a[href="/shop"]').first();
    await expect(shopLink).toBeVisible();
  });

  test('Workshops link appears in nav', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const workshopsLink = page.locator('a[href="/workshops"]').first();
    await expect(workshopsLink).toBeVisible();
  });

  test('About link appears in nav', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const aboutLink = page.locator('a[href="/about"]').first();
    await expect(aboutLink).toBeVisible();
  });
});

test.describe('Public pages — page content smoke tests', () => {
  test('Home page has hero section or main content', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    // Check that main content area exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const text = await body.innerText();
    expect(text.toLowerCase()).toMatch(/mona|gallery|art/i);
  });

  test('About page contains content about the artist', async ({ page }) => {
    await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded' });
    const body = page.locator('body');
    const text = await body.innerText();
    expect(text.length).toBeGreaterThan(50);
  });

  test('Contact page has a form or contact info', async ({ page }) => {
    await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' });
    // Should have either a form element or contact information
    const hasForm = await page.locator('form').count() > 0;
    const hasEmail = (await page.locator('body').innerText()).match(
      /contact|email|@|message/i
    );
    expect(hasForm || !!hasEmail).toBe(true);
  });

  test('Commissions page mentions commissions', async ({ page }) => {
    await page.goto(`${BASE}/commissions`, { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    expect(text.toLowerCase()).toMatch(/commission/i);
  });

  test('Cart page renders', async ({ page }) => {
    await expectPageOk(page, `${BASE}/cart`);
  });
});

test.describe('404 handling', () => {
  test('Non-existent page returns 404 status', async ({ page }) => {
    const response = await page.goto(`${BASE}/this-page-does-not-exist-xyz`, {
      waitUntil: 'domcontentloaded',
    });
    const status = response?.status() ?? 0;
    // Next.js returns 404 for unknown routes
    expect(status).toBe(404);
  });
});
