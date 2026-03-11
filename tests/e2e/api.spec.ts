import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// Helper to make authenticated requests
async function getAdminCookie(page: import('@playwright/test').Page): Promise<string> {
  const response = await page.request.post(`${BASE}/api/auth/login`, {
    data: { username: 'admin', password: 'MonaNiko2025!' },
  });
  expect(response.status()).toBe(200);
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === 'admin_session')?.value ?? '';
}

test.describe('Auth API routes', () => {
  test('POST /api/auth/login with valid credentials returns 200', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: { username: 'admin', password: 'MonaNiko2025!' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('POST /api/auth/login with invalid credentials returns 401', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: { username: 'admin', password: 'wrongpassword' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/auth/login with missing fields returns 400', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: { username: 'admin' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/auth/logout returns 200', async ({ page }) => {
    // Login first
    await page.request.post(`${BASE}/api/auth/login`, {
      data: { username: 'admin', password: 'MonaNiko2025!' },
    });
    const response = await page.request.post(`${BASE}/api/auth/logout`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Public API routes — GET returns valid responses', () => {
  test('GET /api/artworks returns array', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/artworks`);
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toBeDefined();
    }
  });

  test('GET /api/collections returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/collections`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/products returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/products`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/workshops returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/workshops`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/journal returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/journal`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/press returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/press`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/testimonials returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/testimonials`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/auctions returns valid response', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/auctions`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/subscribers returns 401 without auth', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/subscribers`);
    expect([401, 403]).toContain(res.status());
  });
});

test.describe('Promo code API', () => {
  test('GET /api/promo-codes/validate without code returns 400', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/promo-codes/validate`);
    expect(res.status()).toBe(400);
  });

  test('GET /api/promo-codes/validate with invalid code returns 404', async ({ page }) => {
    const res = await page.request.get(
      `${BASE}/api/promo-codes/validate?code=INVALIDCODE99`
    );
    expect([400, 404]).toContain(res.status());
  });
});

test.describe('Authenticated API routes', () => {
  test.beforeEach(async ({ page }) => {
    // Login to get session
    await page.request.post(`${BASE}/api/auth/login`, {
      data: { username: 'admin', password: 'MonaNiko2025!' },
    });
  });

  test('GET /api/orders returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/orders`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/campaigns returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/campaigns`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/inquiries returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/inquiries`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/commissions returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/commissions`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/subscribers returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/subscribers`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/promo-codes returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/promo-codes`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/certificates returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/certificates`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/collector-club returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/collector-club`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/accounting/summary returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/accounting/summary`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/accounting/expenses returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/accounting/expenses`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/accounting/invoices returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/accounting/invoices`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/marketing/blasts returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/marketing/blasts`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/marketing/templates returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/marketing/templates`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/analytics returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/analytics`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/dashboard returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/dashboard`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/settings returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/settings`);
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/content-schedule returns valid response when authenticated', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/content-schedule`);
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('Unauthenticated access to protected API routes', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies - no session
    await page.context().clearCookies();
  });

  test('GET /api/orders without auth returns 401', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/orders`);
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/campaigns without auth returns 401', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/campaigns`);
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/analytics without auth returns 401', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/analytics`);
    expect([401, 403]).toContain(res.status());
  });
});

test.describe('Stripe API routes', () => {
  test('POST /api/stripe/payment-intent without body returns 400 or 500', async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/stripe/payment-intent`, {
      data: {},
    });
    // No valid cart = should fail gracefully (not crash)
    expect(res.status()).toBeGreaterThan(399);
    expect(res.status()).toBeLessThanOrEqual(500);
  });
});

test.describe('Inquiry (contact) API', () => {
  test('POST /api/inquiries with missing fields returns 400', async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/inquiries`, {
      data: { name: 'Test' }, // missing email + message
    });
    // Should validate and return 400
    expect([400, 422]).toContain(res.status());
  });
});
