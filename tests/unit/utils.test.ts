import { describe, it, expect } from 'vitest';
import { cn, formatPrice, slugify, truncate } from '@/lib/utils';

describe('cn() — className merger', () => {
  it('merges two class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind conflicts — last wins', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles conditional classes (falsy ignored)', () => {
    expect(cn('base', false && 'should-not-appear', 'end')).toBe('base end');
  });

  it('handles undefined and null inputs', () => {
    expect(cn(undefined, null as unknown as string, 'valid')).toBe('valid');
  });

  it('handles empty string input', () => {
    expect(cn('', 'only')).toBe('only');
  });

  it('deduplicates conflicting padding', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });
});

describe('formatPrice() — USD currency formatter', () => {
  it('formats whole number dollars', () => {
    expect(formatPrice(1200)).toBe('$1,200');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });

  it('formats large amounts with commas', () => {
    expect(formatPrice(12500)).toBe('$12,500');
  });

  it('formats small amounts', () => {
    expect(formatPrice(50)).toBe('$50');
  });

  it('formats amounts with cents (rounds to nearest dollar per config)', () => {
    // minimumFractionDigits: 0, maximumFractionDigits: 0 means no decimals
    expect(formatPrice(99.99)).toBe('$100');
  });

  it('formats six-figure amounts correctly', () => {
    expect(formatPrice(250000)).toBe('$250,000');
  });

  it('formats negative values', () => {
    expect(formatPrice(-100)).toMatch(/-?\$100|\(\$100\)/);
  });
});

describe('slugify() — URL slug generator', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('lowercases the input', () => {
    expect(slugify('UPPERCASE')).toBe('uppercase');
  });

  it('strips special characters', () => {
    expect(slugify('Art & Soul!')).toBe('art-soul');
  });

  it('handles multiple spaces', () => {
    expect(slugify('too   many   spaces')).toBe('too-many-spaces');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  leading trailing  ')).toBe('leading-trailing');
  });

  it('handles underscores as word separators', () => {
    expect(slugify('my_artwork_title')).toBe('my-artwork-title');
  });

  it('handles already-slugified input', () => {
    expect(slugify('already-good')).toBe('already-good');
  });

  it('handles apostrophes', () => {
    expect(slugify("Mona's Art")).toBe('monas-art');
  });

  it('handles numbers', () => {
    expect(slugify('Summer 2024 Collection')).toBe('summer-2024-collection');
  });
});

describe('truncate() — text truncation', () => {
  it('returns the string unchanged if shorter than limit', () => {
    expect(truncate('Short text', 50)).toBe('Short text');
  });

  it('returns the string unchanged if exactly at limit', () => {
    expect(truncate('exact', 5)).toBe('exact');
  });

  it('truncates and appends ellipsis when over limit', () => {
    const result = truncate('This is a long description', 10);
    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(13); // 10 + '...'
  });

  it('respects the length parameter', () => {
    const result = truncate('Hello World', 5);
    expect(result.startsWith('Hello')).toBe(true);
    expect(result).toContain('...');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('trims trailing whitespace before ellipsis', () => {
    const result = truncate('Hello World Test', 11);
    // "Hello World" is 11 chars, trimEnd should remove trailing space if any
    expect(result).not.toMatch(/\s\.\.\./);
  });
});
