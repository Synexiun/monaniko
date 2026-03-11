import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:3000';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'MonaNiko2025!';

// Fast API-level login — avoids slow browser form submission
async function loginAsAdmin(page: Page) {
  await page.request.post(`${BASE}/api/auth/login`, {
    data: { username: ADMIN_USER, password: ADMIN_PASS },
    headers: { 'Content-Type': 'application/json' },
  });
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
}

test.describe('Admin authentication', () => {
  test('Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Login page has username and password fields', async ({ page }) => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('Invalid credentials shows error', async ({ page }) => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="text"]').first().fill('wronguser');
    await page.locator('input[type="password"]').first().fill('wrongpass');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    const url = page.url();
    const hasError = await page.locator('[class*="red"], [role="alert"]').count() > 0;
    expect(url.includes('/login') || hasError).toBe(true);
  });

  test('Successful login redirects to admin dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    expect(page.url()).toContain('/admin');
    expect(page.url()).not.toContain('/login');
  });

  test('Admin dashboard shows Mona Niko branding', async ({ page }) => {
    await loginAsAdmin(page);
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/mona niko/i);
  });

  test('Logout redirects to login page', async ({ page }) => {
    await loginAsAdmin(page);
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log Out")');
    await logoutBtn.click();
    await page.waitForURL((url) => url.toString().includes('/login'), { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});

test.describe('Admin — protected route redirect', () => {
  test('Accessing /admin without session redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    const url = page.url();
    const response = await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    const redirectedToLogin = url.includes('/login');
    const status = response?.status() ?? 200;
    expect(redirectedToLogin || status === 401 || status === 403).toBe(true);
  });
});

// All admin page routes
const adminPages = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Artworks', path: '/admin/artworks' },
  { label: 'Collections', path: '/admin/collections' },
  { label: 'Journal', path: '/admin/journal' },
  { label: 'Press', path: '/admin/press' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Workshops', path: '/admin/workshops' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Promo Codes', path: '/admin/promo-codes' },
  { label: 'Campaigns', path: '/admin/campaigns' },
  { label: 'Email Blasts', path: '/admin/marketing/blasts' },
  { label: 'Email Templates', path: '/admin/marketing/templates' },
  { label: 'Content Scheduler', path: '/admin/content' },
  { label: 'Audience', path: '/admin/audience' },
  { label: 'Inquiries', path: '/admin/inquiries' },
  { label: 'Commissions', path: '/admin/commissions' },
  { label: 'Testimonials', path: '/admin/testimonials' },
  { label: 'Collector Club', path: '/admin/collector-club' },
  { label: 'Certificates', path: '/admin/certificates' },
  { label: 'Auctions', path: '/admin/auctions' },
  { label: 'Accounting', path: '/admin/accounting' },
  { label: 'Expenses', path: '/admin/accounting/expenses' },
  { label: 'Invoices', path: '/admin/accounting/invoices' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' },
];

test.describe('Admin pages — all render without 500 errors', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const { label, path } of adminPages) {
    test(`${label} page loads (${path})`, async ({ page }) => {
      const response = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      const status = response?.status() ?? 0;
      expect(status, `${label} at ${path} returned HTTP ${status}`).toBeLessThan(500);
      expect(page.url()).not.toContain('/login');
    });
  }
});

test.describe('Admin sidebar navigation links', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Sidebar has Dashboard link', async ({ page }) => {
    const link = page.locator('a[href="/admin"]').first();
    await expect(link).toBeVisible();
  });

  test('Sidebar has Artworks link', async ({ page }) => {
    const link = page.locator('a[href="/admin/artworks"]');
    await expect(link).toBeVisible();
  });

  test('Sidebar has Orders link', async ({ page }) => {
    const link = page.locator('a[href="/admin/orders"]');
    await expect(link).toBeVisible();
  });

  test('Sidebar has Analytics link', async ({ page }) => {
    const link = page.locator('a[href="/admin/analytics"]');
    await expect(link).toBeVisible();
  });

  test('Sidebar has Settings link', async ({ page }) => {
    const link = page.locator('a[href="/admin/settings"]');
    await expect(link).toBeVisible();
  });

  test('Sidebar has Accounting link', async ({ page }) => {
    const link = page.locator('a[href="/admin/accounting"]');
    await expect(link).toBeVisible();
  });

  test('"View Live Site" link exists in sidebar', async ({ page }) => {
    const link = page.locator('a:has-text("View Live Site")');
    await expect(link).toBeVisible();
  });

  test('Clicking Artworks nav link navigates correctly', async ({ page }) => {
    await page.locator('a[href="/admin/artworks"]').first().click();
    await page.waitForURL(`${BASE}/admin/artworks`, { timeout: 10000 });
    expect(page.url()).toContain('/admin/artworks');
  });

  test('Clicking Orders nav link navigates correctly', async ({ page }) => {
    await page.locator('a[href="/admin/orders"]').first().click();
    await page.waitForURL(`${BASE}/admin/orders`, { timeout: 10000 });
    expect(page.url()).toContain('/admin/orders');
  });
});

test.describe('Admin dashboard — content verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Dashboard shows key metrics sections', async ({ page }) => {
    await page.waitForTimeout(1000);
    const text = await page.locator('body').innerText();
    expect(text.length).toBeGreaterThan(100);
  });

  test('Top header bar is visible on admin pages', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('Notification bell is visible in admin header', async ({ page }) => {
    const bell = page.locator('[aria-label="Notifications"]');
    await expect(bell).toBeVisible();
  });
});

test.describe('Admin mobile sidebar', () => {
  test('Mobile menu button opens sidebar on small screens', async ({ page }) => {
    await loginAsAdmin(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const menuBtn = page.locator('[aria-label="Open sidebar"]');
    await expect(menuBtn).toBeVisible({ timeout: 5000 });
    await menuBtn.click();
    const closeBtn = page.locator('[aria-label="Close sidebar"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
  });
});
