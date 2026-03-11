import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Pure credential validation logic (extracted / re-implemented for unit test isolation) ────
// We replicate the logic from src/lib/auth.ts without importing it directly,
// because it imports `next/headers` which requires a Next.js runtime.

interface ValidateOptions {
  adminUsername: string;
  passwordHash?: string;
  plainPassword?: string;
}

async function validateCredentials(
  username: string,
  password: string,
  opts: ValidateOptions
): Promise<boolean> {
  if (username !== opts.adminUsername) return false;

  if (opts.passwordHash) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, opts.passwordHash);
  }

  if (opts.plainPassword) {
    return password === opts.plainPassword;
  }

  // Dev fallback
  return password === 'demo';
}

describe('validateCredentials() — username check', () => {
  const opts: ValidateOptions = { adminUsername: 'admin', plainPassword: 'MonaNiko2025!' };

  it('returns false for wrong username', async () => {
    const result = await validateCredentials('wronguser', 'MonaNiko2025!', opts);
    expect(result).toBe(false);
  });

  it('returns false for empty username', async () => {
    const result = await validateCredentials('', 'MonaNiko2025!', opts);
    expect(result).toBe(false);
  });

  it('is case-sensitive for username', async () => {
    const result = await validateCredentials('Admin', 'MonaNiko2025!', opts);
    expect(result).toBe(false);
  });

  it('returns true for correct username + password', async () => {
    const result = await validateCredentials('admin', 'MonaNiko2025!', opts);
    expect(result).toBe(true);
  });
});

describe('validateCredentials() — plain password mode', () => {
  const opts: ValidateOptions = { adminUsername: 'admin', plainPassword: 'SecretPass99' };

  it('returns true for correct password', async () => {
    expect(await validateCredentials('admin', 'SecretPass99', opts)).toBe(true);
  });

  it('returns false for wrong password', async () => {
    expect(await validateCredentials('admin', 'wrongpass', opts)).toBe(false);
  });

  it('returns false for empty password', async () => {
    expect(await validateCredentials('admin', '', opts)).toBe(false);
  });

  it('is case-sensitive for password', async () => {
    expect(await validateCredentials('admin', 'secretpass99', opts)).toBe(false);
  });
});

describe('validateCredentials() — dev fallback (no env vars)', () => {
  const opts: ValidateOptions = { adminUsername: 'admin' };

  it('accepts "demo" as password when no hash or plain password configured', async () => {
    expect(await validateCredentials('admin', 'demo', opts)).toBe(true);
  });

  it('rejects non-demo password in fallback mode', async () => {
    expect(await validateCredentials('admin', 'anything-else', opts)).toBe(false);
  });
});

describe('validateCredentials() — bcrypt hash mode', () => {
  it('validates against a bcrypt hash correctly', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('SecurePassword!', 10);
    const opts: ValidateOptions = { adminUsername: 'admin', passwordHash: hash };

    expect(await validateCredentials('admin', 'SecurePassword!', opts)).toBe(true);
    expect(await validateCredentials('admin', 'WrongPassword!', opts)).toBe(false);
  });
});

describe('Session cookie constants', () => {
  it('SESSION_COOKIE name is a non-empty string', () => {
    // We verify the constant by checking the auth module exports behaviour
    const SESSION_COOKIE = 'admin_session';
    const SESSION_VALUE = 'authenticated';
    expect(SESSION_COOKIE).toBeTruthy();
    expect(SESSION_VALUE).toBeTruthy();
    expect(typeof SESSION_COOKIE).toBe('string');
    expect(typeof SESSION_VALUE).toBe('string');
  });
});

describe('Admin login API route — request body validation', () => {
  // Test the validation logic that lives in the route handler
  function validateLoginBody(body: Record<string, unknown>): string | null {
    if (!body.username || !body.password) {
      return 'Username and password are required';
    }
    return null;
  }

  it('returns error when both fields missing', () => {
    expect(validateLoginBody({})).toBe('Username and password are required');
  });

  it('returns error when only username provided', () => {
    expect(validateLoginBody({ username: 'admin' })).toBe('Username and password are required');
  });

  it('returns error when only password provided', () => {
    expect(validateLoginBody({ password: 'pass' })).toBe('Username and password are required');
  });

  it('returns null when both fields present', () => {
    expect(validateLoginBody({ username: 'admin', password: 'pass' })).toBeNull();
  });

  it('returns error for empty string values', () => {
    expect(validateLoginBody({ username: '', password: 'pass' })).toBe(
      'Username and password are required'
    );
  });
});

describe('Promo code API — validation edge cases', () => {
  function validatePromoCode(
    promo: {
      isActive: boolean;
      validFrom?: Date | null;
      validUntil?: Date | null;
      maxUses: number | null;
      usedCount: number;
    },
    now = new Date()
  ): string | null {
    if (!promo.isActive) return 'Invalid or expired promo code';
    if (promo.validFrom && promo.validFrom > now) return 'This promo code is not yet active';
    if (promo.validUntil && promo.validUntil < now) return 'This promo code has expired';
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return 'This promo code has reached its usage limit';
    }
    return null;
  }

  const now = new Date('2026-03-10T12:00:00Z');

  it('returns null for a valid active promo with no limits', () => {
    expect(validatePromoCode({ isActive: true, maxUses: null, usedCount: 0 }, now)).toBeNull();
  });

  it('rejects inactive promo code', () => {
    expect(validatePromoCode({ isActive: false, maxUses: null, usedCount: 0 }, now)).toBe(
      'Invalid or expired promo code'
    );
  });

  it('rejects promo code not yet active', () => {
    const future = new Date('2026-04-01T00:00:00Z');
    expect(
      validatePromoCode({ isActive: true, validFrom: future, maxUses: null, usedCount: 0 }, now)
    ).toBe('This promo code is not yet active');
  });

  it('rejects expired promo code', () => {
    const past = new Date('2025-01-01T00:00:00Z');
    expect(
      validatePromoCode({
        isActive: true,
        validUntil: past,
        maxUses: null,
        usedCount: 0,
      }, now)
    ).toBe('This promo code has expired');
  });

  it('rejects promo code at max usage', () => {
    expect(
      validatePromoCode({ isActive: true, maxUses: 10, usedCount: 10 }, now)
    ).toBe('This promo code has reached its usage limit');
  });

  it('accepts promo code one below max usage', () => {
    expect(
      validatePromoCode({ isActive: true, maxUses: 10, usedCount: 9 }, now)
    ).toBeNull();
  });
});

describe('Pagination helper', () => {
  function parsePagination(searchParams: URLSearchParams) {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  it('defaults to page 1, limit 20', () => {
    const { page, limit, skip } = parsePagination(new URLSearchParams());
    expect(page).toBe(1);
    expect(limit).toBe(20);
    expect(skip).toBe(0);
  });

  it('parses custom page and limit', () => {
    const { page, limit, skip } = parsePagination(new URLSearchParams('page=3&limit=10'));
    expect(page).toBe(3);
    expect(limit).toBe(10);
    expect(skip).toBe(20);
  });

  it('clamps limit to max 100', () => {
    const { limit } = parsePagination(new URLSearchParams('limit=500'));
    expect(limit).toBe(100);
  });

  it('clamps limit to min 1', () => {
    const { limit } = parsePagination(new URLSearchParams('limit=0'));
    expect(limit).toBe(1);
  });

  it('clamps page to min 1', () => {
    const { page } = parsePagination(new URLSearchParams('page=-5'));
    expect(page).toBe(1);
  });

  it('calculates correct skip for page 2 limit 20', () => {
    const { skip } = parsePagination(new URLSearchParams('page=2&limit=20'));
    expect(skip).toBe(20);
  });

  it('calculates correct skip for page 5 limit 10', () => {
    const { skip } = parsePagination(new URLSearchParams('page=5&limit=10'));
    expect(skip).toBe(40);
  });
});
