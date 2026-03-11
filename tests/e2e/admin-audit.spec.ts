import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

async function login(page: any) {
  await page.request.post(`${BASE}/api/auth/login`, {
    data: { username: 'admin', password: 'MonaNiko2025!' },
    headers: { 'Content-Type': 'application/json' },
  });
}

const adminLinks = [
  { label: 'Dashboard',        href: '/admin' },
  { label: 'Artworks',         href: '/admin/artworks' },
  { label: 'Collections',      href: '/admin/collections' },
  { label: 'Journal',          href: '/admin/journal' },
  { label: 'Press',            href: '/admin/press' },
  { label: 'Products',         href: '/admin/products' },
  { label: 'Workshops',        href: '/admin/workshops' },
  { label: 'Orders',           href: '/admin/orders' },
  { label: 'Promo Codes',      href: '/admin/promo-codes' },
  { label: 'Campaigns',        href: '/admin/campaigns' },
  { label: 'Email Blasts',     href: '/admin/marketing/blasts' },
  { label: 'Email Templates',  href: '/admin/marketing/templates' },
  { label: 'Content Scheduler',href: '/admin/content' },
  { label: 'Audience',         href: '/admin/audience' },
  { label: 'Inquiries',        href: '/admin/inquiries' },
  { label: 'Commissions',      href: '/admin/commissions' },
  { label: 'Testimonials',     href: '/admin/testimonials' },
  { label: 'Collector Club',   href: '/admin/collector-club' },
  { label: 'Certificates',     href: '/admin/certificates' },
  { label: 'Auctions',         href: '/admin/auctions' },
  { label: 'Accounting',       href: '/admin/accounting' },
  { label: 'Expenses',         href: '/admin/accounting/expenses' },
  { label: 'Invoices',         href: '/admin/accounting/invoices' },
  { label: 'Analytics',        href: '/admin/analytics' },
  { label: 'Settings',         href: '/admin/settings' },
];

for (const { label, href } of adminLinks) {
  test(`[${label}] sidebar link navigates and page loads`, async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });

    // Check sidebar link exists
    const link = page.locator(`a[href="${href}"]`).first();
    await expect(link, `Sidebar link for ${label} not found`).toBeVisible({ timeout: 5000 });

    // Click it
    await link.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Should not redirect to login
    expect(page.url(), `${label} redirected to login`).not.toContain('/login');

    // Should be on the right URL
    expect(page.url(), `${label} wrong URL`).toContain(href);

    // Page body should have real content (more than 200 chars)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length, `${label} page body is empty`).toBeGreaterThan(200);

    // No JS crash overlay (nextjs-portal is always present in dev mode for dev tools;
    // an actual error shows a <dialog> inside it)
    const errorOverlay = await page.locator('nextjs-portal dialog').count();
    expect(errorOverlay, `${label} has error overlay`).toBe(0);
  });
}
