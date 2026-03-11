import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/utils';

// ─── Cart Calculation Helpers (mirrors cart store logic) ───────────────────────
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  type: string;
}

function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function addItem(items: CartItem[], newItem: CartItem): CartItem[] {
  const existing = items.find(
    (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
  );
  if (existing) {
    return items.map((i) =>
      i.productId === newItem.productId && i.variantId === newItem.variantId
        ? { ...i, quantity: i.quantity + newItem.quantity }
        : i
    );
  }
  return [...items, newItem];
}

function updateQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.id !== id);
  return items.map((i) => (i.id === id ? { ...i, quantity } : i));
}

function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id);
}

// ─── Promo Code Discount Logic ─────────────────────────────────────────────────
type DiscountType = 'percentage' | 'fixed';

function applyDiscount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number,
  minPurchase: number | null = null
): number {
  if (minPurchase !== null && subtotal < minPurchase) {
    throw new Error(`Minimum purchase of $${minPurchase} required`);
  }
  if (discountType === 'percentage') {
    const discount = (subtotal * discountValue) / 100;
    return Math.max(0, subtotal - discount);
  }
  return Math.max(0, subtotal - discountValue);
}

function calculateShipping(subtotal: number, freeShippingThreshold = 150): number {
  return subtotal >= freeShippingThreshold ? 0 : 9.99;
}

function calculateTax(subtotal: number, taxRate = 0.0875): number {
  return parseFloat((subtotal * taxRate).toFixed(2));
}

// ─── Test Suite ────────────────────────────────────────────────────────────────

const sampleItem: CartItem = {
  id: 'item-1',
  productId: 'prod-1',
  variantId: 'var-a',
  title: 'Art Print 12x16',
  image: '/img.jpg',
  price: 75,
  quantity: 1,
  type: 'print',
};

describe('Cart — total calculation', () => {
  it('returns 0 for empty cart', () => {
    expect(cartTotal([])).toBe(0);
  });

  it('calculates total for single item', () => {
    expect(cartTotal([sampleItem])).toBe(75);
  });

  it('calculates total for multiple items', () => {
    const items: CartItem[] = [
      { ...sampleItem, id: '1', price: 75, quantity: 1 },
      { ...sampleItem, id: '2', productId: 'prod-2', variantId: 'var-b', price: 200, quantity: 2 },
    ];
    expect(cartTotal(items)).toBe(75 + 200 * 2); // 475
  });

  it('calculates total with quantities > 1', () => {
    const items: CartItem[] = [{ ...sampleItem, price: 50, quantity: 3 }];
    expect(cartTotal(items)).toBe(150);
  });

  it('handles fractional prices', () => {
    const items: CartItem[] = [{ ...sampleItem, price: 19.99, quantity: 2 }];
    expect(cartTotal(items)).toBeCloseTo(39.98);
  });
});

describe('Cart — item count', () => {
  it('returns 0 for empty cart', () => {
    expect(cartItemCount([])).toBe(0);
  });

  it('counts single item with quantity 1', () => {
    expect(cartItemCount([sampleItem])).toBe(1);
  });

  it('sums quantities across multiple items', () => {
    const items: CartItem[] = [
      { ...sampleItem, id: '1', quantity: 2 },
      { ...sampleItem, id: '2', productId: 'prod-2', variantId: 'var-b', quantity: 3 },
    ];
    expect(cartItemCount(items)).toBe(5);
  });
});

describe('Cart — addItem()', () => {
  it('adds a new item to empty cart', () => {
    const result = addItem([], sampleItem);
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe('prod-1');
  });

  it('adds a different product to cart', () => {
    const item2: CartItem = { ...sampleItem, id: 'item-2', productId: 'prod-2', variantId: 'var-b' };
    const result = addItem([sampleItem], item2);
    expect(result).toHaveLength(2);
  });

  it('increments quantity when same productId + variantId', () => {
    const duplicate: CartItem = { ...sampleItem, id: 'item-2', quantity: 2 };
    const result = addItem([sampleItem], duplicate);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3); // 1 + 2
  });

  it('treats same product with different variants as separate items', () => {
    const differentVariant: CartItem = { ...sampleItem, id: 'item-3', variantId: 'var-b' };
    const result = addItem([sampleItem], differentVariant);
    expect(result).toHaveLength(2);
  });

  it('treats undefined variantId as a unique key', () => {
    const withoutVariant: CartItem = { ...sampleItem, id: 'item-4', variantId: undefined };
    const result = addItem([sampleItem], withoutVariant);
    // var-a vs undefined = different
    expect(result).toHaveLength(2);
  });
});

describe('Cart — updateQuantity()', () => {
  it('updates quantity of an existing item', () => {
    const result = updateQuantity([sampleItem], 'item-1', 5);
    expect(result[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    const result = updateQuantity([sampleItem], 'item-1', 0);
    expect(result).toHaveLength(0);
  });

  it('removes item when quantity set to negative', () => {
    const result = updateQuantity([sampleItem], 'item-1', -1);
    expect(result).toHaveLength(0);
  });

  it('does not modify other items', () => {
    const items: CartItem[] = [
      sampleItem,
      { ...sampleItem, id: 'item-2', productId: 'prod-2', variantId: 'var-b', quantity: 3 },
    ];
    const result = updateQuantity(items, 'item-1', 10);
    expect(result.find((i) => i.id === 'item-2')?.quantity).toBe(3);
    expect(result.find((i) => i.id === 'item-1')?.quantity).toBe(10);
  });
});

describe('Cart — removeItem()', () => {
  it('removes an item by id', () => {
    const result = removeItem([sampleItem], 'item-1');
    expect(result).toHaveLength(0);
  });

  it('does not remove items with a different id', () => {
    const items: CartItem[] = [
      sampleItem,
      { ...sampleItem, id: 'item-2', productId: 'prod-2', variantId: 'var-b' },
    ];
    const result = removeItem(items, 'item-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-2');
  });

  it('handles removal on empty cart gracefully', () => {
    const result = removeItem([], 'item-1');
    expect(result).toHaveLength(0);
  });
});

describe('Promo code — applyDiscount()', () => {
  it('applies percentage discount correctly', () => {
    expect(applyDiscount(200, 'percentage', 10)).toBe(180); // 10% off $200
  });

  it('applies fixed amount discount correctly', () => {
    expect(applyDiscount(200, 'fixed', 25)).toBe(175);
  });

  it('does not go below 0 for large percentage discount', () => {
    expect(applyDiscount(50, 'percentage', 150)).toBe(0);
  });

  it('does not go below 0 for large fixed discount', () => {
    expect(applyDiscount(20, 'fixed', 50)).toBe(0);
  });

  it('throws when subtotal is below minimum purchase', () => {
    expect(() => applyDiscount(50, 'percentage', 20, 100)).toThrow();
  });

  it('succeeds when subtotal meets minimum purchase exactly', () => {
    expect(applyDiscount(100, 'percentage', 10, 100)).toBe(90);
  });

  it('applies 20% off $500 correctly', () => {
    expect(applyDiscount(500, 'percentage', 20)).toBe(400);
  });

  it('handles 0% discount (no-op)', () => {
    expect(applyDiscount(300, 'percentage', 0)).toBe(300);
  });

  it('handles $0 fixed discount (no-op)', () => {
    expect(applyDiscount(300, 'fixed', 0)).toBe(300);
  });
});

describe('Shipping calculation', () => {
  it('returns free shipping for orders >= $150', () => {
    expect(calculateShipping(150)).toBe(0);
    expect(calculateShipping(200)).toBe(0);
  });

  it('returns $9.99 shipping for orders < $150', () => {
    expect(calculateShipping(149.99)).toBe(9.99);
    expect(calculateShipping(50)).toBe(9.99);
  });

  it('returns free shipping at exactly the threshold', () => {
    expect(calculateShipping(150, 150)).toBe(0);
  });

  it('uses custom threshold when provided', () => {
    expect(calculateShipping(100, 200)).toBe(9.99);
    expect(calculateShipping(200, 200)).toBe(0);
  });
});

describe('Tax calculation', () => {
  it('calculates 8.75% CA tax on $100', () => {
    expect(calculateTax(100)).toBeCloseTo(8.75);
  });

  it('calculates tax on $250', () => {
    expect(calculateTax(250)).toBeCloseTo(21.88);
  });

  it('returns 0 tax on $0', () => {
    expect(calculateTax(0)).toBe(0);
  });

  it('uses custom tax rate when provided', () => {
    expect(calculateTax(100, 0.1)).toBeCloseTo(10);
  });
});

describe('Full order total calculation', () => {
  it('computes correct grand total with discount, shipping, and tax', () => {
    const subtotal = 200; // items
    const afterDiscount = applyDiscount(subtotal, 'percentage', 10); // $180
    const shipping = calculateShipping(afterDiscount); // $0 (>= $150)
    const tax = calculateTax(afterDiscount); // $15.75
    const grandTotal = afterDiscount + shipping + tax;
    expect(grandTotal).toBeCloseTo(195.75);
  });

  it('applies shipping for orders under threshold after discount', () => {
    const subtotal = 160;
    const afterDiscount = applyDiscount(subtotal, 'fixed', 20); // $140
    const shipping = calculateShipping(afterDiscount); // $9.99 (< $150)
    const tax = calculateTax(afterDiscount); // $12.25
    const grandTotal = afterDiscount + shipping + tax;
    expect(grandTotal).toBeCloseTo(162.24);
  });
});

describe('formatPrice integration', () => {
  it('formats cart total correctly', () => {
    const items: CartItem[] = [
      { ...sampleItem, price: 1200, quantity: 1 },
      { ...sampleItem, id: 'item-2', productId: 'prod-2', variantId: 'var-b', price: 300, quantity: 2 },
    ];
    const total = cartTotal(items); // 1200 + 600 = 1800
    expect(formatPrice(total)).toBe('$1,800');
  });
});
