import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation for unit tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/headers for server-side functions
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
    })
  ),
}));

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('Warning:') || msg.includes('React does not recognize'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
