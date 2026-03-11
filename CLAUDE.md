# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check without building

# Unit tests (Vitest + jsdom)
npm test             # Run once
npm run test:watch   # Watch mode

# E2E tests (Playwright, requires server on :3000)
npm run test:e2e     # Headless
npm run test:e2e:ui  # With UI
npm run test:all     # Unit + E2E
```

Run a single unit test file: `npx vitest run tests/unit/path/to/file.test.ts`

## Architecture

### Route Groups
- `(admin)/` — Admin dashboard, protected by `requireAuth()` in `lib/auth.ts`
- `(public)/` — Public-facing site with shared nav/footer/cart layout
- `api/` — REST API routes, no shared layout

### Page Pattern (all public pages)
Every public listing and detail page uses a **server + client split**:
- `page.tsx` — Server component: exports `metadata` (and `generateMetadata`, `generateStaticParams`, JSON-LD for detail pages)
- `*Content.tsx` — Client component (`"use client"`): all interactive logic, data fetching

This split is mandatory to allow metadata exports alongside client-side interactivity.

### Auth
- **Admin:** `requireAuth()` from `lib/auth.ts` — call with no args, returns `NextResponse | null`. Check result and return early if truthy.
- **Customer:** `requireCustomerAuth()` from `lib/customer-auth.ts` — returns `{ userId } | NextResponse`. HMAC-SHA256 signed cookie `customer_session`.

### Database
- Prisma 7 + SQLite (`prisma/dev.db`) via `better-sqlite3` adapter
- Import client as `{ db }` from `@/lib/db`
- **JSON fields are stored as strings in SQLite.** API GET routes must parse them before returning. Use an inline `safeJson` helper:
  ```ts
  const safeJson = <T>(val: unknown, fallback: T): T => {
    if (typeof val !== "string") return (val as T) ?? fallback;
    try { return JSON.parse(val); } catch { return fallback; }
  };
  ```
  Affected fields: `Artwork.{images,tags,dimensions}`, `Product.{images,tags}`, `Campaign.{channels,targetSegments,metrics}`, `Order.shippingAddress`, `Invoice.lineItems`, `Subscriber.segments`.

### State Management
- Cart: `store/cart.ts` (Zustand)
- Toast: `store/toast.ts` (Zustand)
- Customer auth: `store/auth.ts` (Zustand + localStorage persist)

### Key Libraries
- `lib/api-utils.ts` — `parsePagination`, `paginatedResponse`, `jsonResponse`, `errorResponse`
- `lib/resend.ts` — all email functions
- `lib/cloudinary.ts` — `uploadImage()`, `deleteImage()`
- `lib/utils.ts` — `cn()`, `formatPrice()`, `slugify()`, `truncate()`
- `data/artworks.ts` — static seed data (30 artworks, 3 collections, 28 products, 10 workshops, 5 journal posts)

### Path Alias
`@` maps to `./src` — use `@/lib/...`, `@/components/...`, etc.

## Env Variables
Required in `.env`: `DATABASE_URL`, `ADMIN_PASSWORD_HASH` (fallback: `demo`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CLOUDINARY_*`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Testing Layout
- Unit tests: `tests/unit/**/*.test.{ts,tsx}` — setup in `tests/setup.ts`
- E2E tests: `tests/e2e/**/*.spec.ts` — base URL `http://localhost:3000`, single worker, Chromium only
- Coverage excludes `src/app/api/**`
