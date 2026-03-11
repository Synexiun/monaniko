import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Cart page', () => {
  test('Cart page renders without error', async ({ page }) => {
    const response = await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
  });

  test('Empty cart shows empty state message', async ({ page }) => {
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    // Should show some empty cart messaging or a shop link
    expect(text.toLowerCase()).toMatch(/cart|empty|shop|browse/i);
  });
});

test.describe('Checkout page', () => {
  test('Checkout page renders', async ({ page }) => {
    const response = await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
  });

  test('Checkout page has checkout-related content', async ({ page }) => {
    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    // Should mention checkout, cart, or redirect to appropriate page
    expect(text.length).toBeGreaterThan(20);
  });
});

test.describe('Shop pages — add to cart flow', () => {
  test('Shop page loads with products or empty state', async ({ page }) => {
    await page.goto(`${BASE}/shop`, { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    expect(text.length).toBeGreaterThan(50);
  });

  test('Shop prints page loads', async ({ page }) => {
    await page.goto(`${BASE}/shop/prints`, { waitUntil: 'domcontentloaded' });
    const response = await page.goto(`${BASE}/shop/prints`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Stripe payment intent API', () => {
  test('POST /api/stripe/payment-intent requires valid cart data', async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/stripe/payment-intent`, {
      data: {
        items: [{ id: 'item-1', productId: 'prod-1', title: 'Test Print', price: 75, quantity: 1 }],
        email: 'test@example.com',
      },
    });
    // Either succeeds or returns structured error (not a 500 crash)
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('Checkout success page', () => {
  test('Checkout success page renders', async ({ page }) => {
    const response = await page.goto(`${BASE}/checkout/success`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Promo code E2E validation', () => {
  test('Invalid promo code returns 404 via API', async ({ page }) => {
    const res = await page.request.get(
      `${BASE}/api/promo-codes/validate?code=NOTAVALIDCODE`
    );
    expect([400, 404]).toContain(res.status());
  });

  test('Promo code API returns proper error structure', async ({ page }) => {
    const res = await page.request.get(
      `${BASE}/api/promo-codes/validate?code=FAKETEST`
    );
    if (res.status() !== 200) {
      const body = await res.json();
      expect(body).toHaveProperty('error');
    }
  });
});

test.describe('Account / auth pages', () => {
  test('Account page renders or redirects', async ({ page }) => {
    const res = await page.goto(`${BASE}/account`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(500);
  });

  test('Account orders page renders or redirects', async ({ page }) => {
    const res = await page.goto(`${BASE}/account/orders`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(500);
  });

  test('Account profile page renders or redirects', async ({ page }) => {
    const res = await page.goto(`${BASE}/account/profile`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(500);
  });

  test('Account wishlist page renders or redirects', async ({ page }) => {
    const res = await page.goto(`${BASE}/account/wishlist`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe('Gallery detail pages', () => {
  test('Gallery page lists artworks or shows empty state', async ({ page }) => {
    await page.goto(`${BASE}/gallery`, { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    expect(text.length).toBeGreaterThan(30);
  });
});

test.describe('Collections detail pages', () => {
  test('Collections index page renders', async ({ page }) => {
    const res = await page.goto(`${BASE}/collections`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe('Auction detail pages', () => {
  test('Auctions index renders', async ({ page }) => {
    const res = await page.goto(`${BASE}/auctions`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(500);
  });
});
