# Phase 4: Payments - Research

**Researched:** 2026-01-21
**Domain:** Payment integration (Square SDK, P2P payment methods, webhook handling)
**Confidence:** MEDIUM

## Summary

This phase implements a flexible payment system for a booth-rental salon where independent stylists handle their own payments. The architecture must support two distinct flows: (1) offline P2P payments (Venmo, Zelle, CashApp, cash) where we only display payment info, and (2) online Square payments for stylists who opt-in.

The key finding is that Square's booth rental support is limited - each stylist who wants Square must have their own Square account and complete OAuth authorization with the app. The recommended approach is to use Square Checkout API (Payment Links) for simplicity rather than embedded Web Payments SDK, since it reduces PCI scope, handles CSP complexity, and provides a consistent mobile experience.

**Primary recommendation:** Use Square Payment Links (redirect flow) for online payments; store P2P handles as structured fields in staff table; handle webhooks via SvelteKit API routes on Cloudflare Pages with Bot Fight Mode workarounds.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `square` | 43.1.0 | Square Node.js SDK | Official SDK, handles API versioning, BigInt serialization |
| Drizzle ORM | (existing) | Database schema for payment config | Already in use, consistency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `nanoid` | (existing) | Generate idempotency keys | For Square API calls |
| `crypto` (Node built-in) | - | Webhook signature verification | Verify Square webhooks |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Square Payment Links | Web Payments SDK (embedded) | Embedded requires CSP config, more code, same result |
| Square per-stylist OAuth | Single salon Square account | Single account means salon collects money for stylists - accounting complexity |

**Installation:**
```bash
pnpm add square
```

## Architecture Patterns

### Recommended Project Structure
```
packages/db/src/schema/
├── staff.ts              # Add payment method fields
├── payments.ts           # NEW: payment records table
└── index.ts              # Export new schema

apps/web/src/routes/
├── api/
│   ├── webhooks/
│   │   └── square/+server.ts      # Square webhook handler
│   └── payments/
│       ├── create-link/+server.ts # Create Square payment link
│       └── status/[id]/+server.ts # Check payment status
├── book/
│   ├── +page.svelte               # Add payment step
│   └── pay/[appointmentId]/+page.svelte  # Payment page
└── admin/
    └── staff/
        └── [id]/payments/+page.svelte  # Stylist payment config
```

### Pattern 1: Square OAuth Flow (Per-Stylist Authorization)
**What:** Each stylist who wants online payments must authorize the app via Square OAuth
**When to use:** Stylist enables Square in their profile
**Example:**
```typescript
// Source: https://developer.squareup.com/docs/oauth-api/overview
// OAuth authorization URL construction
const authUrl = new URL('https://connect.squareup.com/oauth2/authorize');
authUrl.searchParams.set('client_id', SQUARE_APP_ID);
authUrl.searchParams.set('scope', 'PAYMENTS_WRITE CUSTOMERS_WRITE ORDERS_WRITE');
authUrl.searchParams.set('state', staffId); // Track which stylist is authorizing
authUrl.searchParams.set('redirect_uri', `${BASE_URL}/api/square/oauth/callback`);

// After callback, store encrypted tokens in staff_square_config table
// Refresh tokens every 7 days (Square best practice)
```

### Pattern 2: Payment Links (Redirect) Flow
**What:** Create Square-hosted checkout page, redirect customer, handle webhook
**When to use:** For deposit/prepayment during booking
**Example:**
```typescript
// Source: https://developer.squareup.com/docs/checkout-api
import { SquareClient, Environment } from 'square';

const client = new SquareClient({
  accessToken: stylistSquareToken, // From staff_square_config
  environment: Environment.Production,
});

const { result } = await client.checkout.paymentLinks.create({
  idempotencyKey: nanoid(),
  paymentLink: {
    name: `Deposit for ${serviceName}`,
    description: `Appointment with ${stylistName}`,
    checkoutOptions: {
      redirectUrl: `${BASE_URL}/book/pay/complete?appointmentId=${appointmentId}`,
      allowTipping: false,
    },
  },
  order: {
    locationId: stylistLocationId,
    lineItems: [{
      name: `${serviceName} Deposit`,
      quantity: '1',
      basePriceMoney: {
        amount: BigInt(depositAmountCents),
        currency: 'USD',
      },
    }],
  },
});

// Redirect customer to result.paymentLink.url
```

### Pattern 3: Webhook Verification
**What:** Verify Square webhook signatures using HMAC-SHA256
**When to use:** All webhook endpoints
**Example:**
```typescript
// Source: https://developer.squareup.com/docs/webhooks/step3validate
import { WebhooksHelper } from 'square';

export const POST: RequestHandler = async ({ request }) => {
  const signature = request.headers.get('x-square-hmacsha256-signature');
  const body = await request.text();

  const isValid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature!,
    signatureKey: SQUARE_WEBHOOK_SIGNATURE_KEY,
    notificationUrl: `${BASE_URL}/api/webhooks/square`,
  });

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);
  // Process event...
};
```

### Pattern 4: P2P Payment Deep Links
**What:** Generate clickable links that open payment apps
**When to use:** Pay-at-salon flow display
**Example:**
```typescript
// Source: https://venmo.com/paymentlinks/ + community research
const paymentLinks = {
  venmo: (handle: string, amount?: number, note?: string) => {
    const url = new URL(`https://venmo.com/${handle}`);
    if (amount) url.pathname += `/${amount}`;
    if (note) url.searchParams.set('note', note);
    return url.toString();
  },

  cashapp: (cashtag: string, amount?: number) => {
    // CashApp format: https://cash.app/$cashtag/amount
    let url = `https://cash.app/${cashtag}`;
    if (amount) url += `/${amount}`;
    return url;
  },

  zelle: (email: string) => {
    // Zelle has no deep link - display info only
    return null;
  },
};
```

### Anti-Patterns to Avoid
- **Storing card numbers:** Never store PCI data; use Square's tokenization
- **Single Square account for all stylists:** Creates tax/accounting nightmare for booth rental
- **Embedded Web Payments SDK without CSP:** Will fail starting Oct 2025
- **Polling for payment status:** Use webhooks instead
- **Trusting client-side payment status:** Always verify via webhook or API

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card tokenization | Custom input fields | Square Web Payments SDK | PCI compliance, liability |
| Hosted checkout page | Custom payment form | Square Payment Links | Less code, full features |
| Webhook verification | Manual HMAC | `WebhooksHelper.verifySignature` | Timing-safe, maintained |
| Payment status tracking | Polling loop | Square webhooks | Real-time, reliable |
| Currency formatting | String manipulation | `Intl.NumberFormat` | Locale-aware |

**Key insight:** Payment integrations have regulatory requirements. Square's hosted solutions shift PCI compliance burden to them.

## Common Pitfalls

### Pitfall 1: Bot Fight Mode Blocking Webhooks
**What goes wrong:** Cloudflare's Bot Fight Mode blocks Square webhook POST requests
**Why it happens:** Webhooks look like bot traffic (no browser, automated)
**How to avoid:**
- Option 1: Upgrade to Cloudflare Pro and create WAF rule to skip Bot Fight Mode for `/api/webhooks/*`
- Option 2: Add Square's IPs (54.245.1.154, 34.202.99.168) to IP Access Rules as "Allow"
- Option 3: Disable Bot Fight Mode entirely (not recommended)
**Warning signs:** Webhooks silently fail, payment status never updates

### Pitfall 2: BigInt Serialization in Square SDK v40+
**What goes wrong:** `TypeError: Do not know how to serialize a BigInt` when returning Square responses to client
**Why it happens:** Square SDK v40+ returns BigInt for money amounts; JSON.stringify fails on BigInt
**How to avoid:**
```typescript
// When sending Square data to client, convert BigInt to number/string
const sanitizedPayment = JSON.parse(
  JSON.stringify(result.payment, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  )
);
```
**Warning signs:** Server crash on payment creation response

### Pitfall 3: OAuth Token Expiration
**What goes wrong:** Payments fail after 30 days
**Why it happens:** Square OAuth access tokens expire after 30 days
**How to avoid:**
- Store refresh_token along with access_token
- Implement automatic token refresh (Square recommends every 7 days)
- Add token expiration date to staff_square_config table
**Warning signs:** Sudden payment failures for stylists who authorized long ago

### Pitfall 4: Missing Webhook Idempotency
**What goes wrong:** Duplicate payments recorded, double-booking marked as paid
**Why it happens:** Square retries webhooks up to 24 hours; same event received multiple times
**How to avoid:** Track `event_id` in a processed_webhooks table; skip if already seen
**Warning signs:** Duplicate records in payments table

### Pitfall 5: CSP Violations with Web Payments SDK
**What goes wrong:** Payment form doesn't load or errors in console
**Why it happens:** Missing CSP directives for Square's domains (required as of Oct 2025)
**How to avoid:** If using embedded SDK, add all required CSP directives:
```
script-src https://web.squarecdn.com;
frame-src https://web.squarecdn.com;
connect-src https://pci-connect.squareup.com https://o160250.ingest.sentry.io;
```
**Warning signs:** Console errors about blocked resources

### Pitfall 6: Zelle Has No API/Deep Links
**What goes wrong:** Attempting to build Zelle payment links fails
**Why it happens:** Zelle is bank-integrated only; no public API or universal deep link
**How to avoid:** Display Zelle email/phone only; customer initiates from their bank app
**Warning signs:** N/A - just don't try to build it

## Code Examples

Verified patterns from official sources:

### Square SDK Initialization
```typescript
// Source: https://developer.squareup.com/docs/sdks/nodejs/setup-project
import { SquareClient, Environment } from 'square';

// Per-stylist client (using their OAuth token)
function getSquareClientForStaff(accessToken: string) {
  return new SquareClient({
    accessToken,
    environment: process.env.NODE_ENV === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  });
}
```

### Database Schema for Payment Config
```typescript
// Drizzle schema addition for staff payment methods
import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Supported P2P payment method enum
export const paymentMethodTypeEnum = pgEnum('payment_method_type', [
  'venmo',
  'cashapp',
  'zelle',
  'cash',
]);

// Staff payment methods (P2P)
export const staffPaymentMethods = pgTable('staff_payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  methodType: paymentMethodTypeEnum('method_type').notNull(),
  handle: text('handle'), // @username for Venmo/CashApp, email for Zelle
  displayName: text('display_name'), // Optional custom display text
  isEnabled: boolean('is_enabled').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Staff Square OAuth config (encrypted tokens)
export const staffSquareConfig = pgTable('staff_square_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().unique().references(() => staff.id),
  merchantId: text('merchant_id').notNull(),
  locationId: text('location_id').notNull(),
  accessToken: text('access_token').notNull(), // Encrypt at rest
  refreshToken: text('refresh_token').notNull(), // Encrypt at rest
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Payment records (for Square payments)
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id),
  squarePaymentId: text('square_payment_id').unique(),
  squareOrderId: text('square_order_id'),
  amountCents: integer('amount_cents').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'refunded'
  paymentMethod: text('payment_method').notNull(), // 'square', 'pay_at_salon'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// Webhook event tracking for idempotency
export const processedWebhooks = pgTable('processed_webhooks', {
  eventId: text('event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Webhook Handler Skeleton
```typescript
// Source: https://developer.squareup.com/docs/webhooks/overview
// apps/web/src/routes/api/webhooks/square/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WebhooksHelper } from 'square';

export const POST: RequestHandler = async ({ request }) => {
  const signature = request.headers.get('x-square-hmacsha256-signature');
  if (!signature) {
    throw error(401, 'Missing signature');
  }

  const body = await request.text();

  // Verify signature (timing-safe)
  const isValid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature,
    signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
    notificationUrl: `${process.env.PUBLIC_BASE_URL}/api/webhooks/square`,
  });

  if (!isValid) {
    throw error(401, 'Invalid signature');
  }

  const event = JSON.parse(body);

  // Idempotency check
  const { db, processedWebhooks } = await import('@repo/db');
  const { eq } = await import('drizzle-orm');

  const existing = await db.query.processedWebhooks.findFirst({
    where: eq(processedWebhooks.eventId, event.event_id),
  });

  if (existing) {
    // Already processed - acknowledge but skip
    return json({ received: true });
  }

  // Process based on event type
  switch (event.type) {
    case 'payment.completed':
      await handlePaymentCompleted(event.data.object.payment);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.data.object.payment);
      break;
    // ... other event types
  }

  // Mark as processed
  await db.insert(processedWebhooks).values({
    eventId: event.event_id,
    eventType: event.type,
  });

  return json({ received: true });
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CreateCheckout endpoint | CreatePaymentLink endpoint | 2023 | Simpler API, more features |
| Web Payments SDK without CSP | CSP required | Oct 2025 | Must configure headers |
| Square SDK v39 | Square SDK v40+ (full rewrite) | 2024 | Breaking changes, new patterns |
| WebhooksHelper.isValidWebhookEventSignature | WebhooksHelper.verifySignature | SDK v40 | New method name/signature |

**Deprecated/outdated:**
- `CreateCheckout` endpoint: Replaced by `CreatePaymentLink`
- `BigInt.prototype.toJSON` workaround: Don't use with SDK v40+
- Reader SDK: Retired Dec 31, 2025; replaced by Mobile Payments SDK

## Open Questions

Things that couldn't be fully resolved:

1. **Token Encryption at Rest**
   - What we know: Square OAuth tokens must be stored securely
   - What's unclear: Best approach for encryption in Supabase (column-level vs Vault)
   - Recommendation: Research Supabase Vault for secrets, or use `pgcrypto` for column encryption

2. **Cloudflare Bot Fight Mode - Exact Workaround**
   - What we know: Free tier can't skip BFM; Pro allows WAF rules to skip
   - What's unclear: Current Cloudflare plan for this project; whether IP allowlist is sufficient
   - Recommendation: Test webhook delivery in staging; have backup plan (IP allowlist or disable BFM for /api/webhooks path)

3. **Square Sandbox Testing for OAuth**
   - What we know: Sandbox exists; OAuth flow works similarly
   - What's unclear: Whether each tester needs sandbox Square account
   - Recommendation: Use Square's sandbox seller test account; document test credentials

## Sources

### Primary (HIGH confidence)
- [Square Web Payments SDK Overview](https://developer.squareup.com/docs/web-payments/overview) - SDK capabilities, Oct 2025 CSP requirement
- [Square Checkout API](https://developer.squareup.com/docs/checkout-api) - Payment Links vs CreateCheckout
- [Square Webhooks](https://developer.squareup.com/docs/webhooks/overview) - Event types, retry policy, signature verification
- [Square OAuth API](https://developer.squareup.com/docs/oauth-api/overview) - Per-seller authorization flow
- [Square Node.js SDK](https://developer.squareup.com/docs/sdks/nodejs/setup-project) - v43.1.0, BigInt handling
- [Webhook Signature Validation](https://developer.squareup.com/docs/webhooks/step3validate) - HMAC verification code

### Secondary (MEDIUM confidence)
- [Square + Svelte Blog Post](https://developer.squareup.com/blog/accept-payments-with-square-and-svelte/) - SvelteKit integration patterns
- [Square Community - Booth Rental](https://community.squareup.com/t5/Beauty-and-Wellness/Can-I-use-Square-Appointments-with-booth-renters-at-my-salon/td-p/111118) - Booth rental limitations confirmed
- [SvelteKit Cloudflare Adapter](https://svelte.dev/docs/kit/adapter-cloudflare) - Environment variables, platform object
- [Venmo Payment Links](https://venmo.com/paymentlinks/) - Deep link format

### Tertiary (LOW confidence)
- [Cloudflare Bot Fight Mode workarounds](https://community.cloudflare.com/t/issue-with-bot-fight-mode-blocking-a-critical-webhook/830410) - Community workarounds, not official
- [CashApp deep link format](https://thenextweb.com/news/square-cashtags-now-let-you-set-payment-amounts-right-in-the-url) - Older article, format may change

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Square SDK docs, verified versions
- Architecture (Square flow): HIGH - Official docs, established patterns
- Architecture (P2P links): MEDIUM - Venmo official, CashApp unofficial
- Pitfalls: MEDIUM - Mix of official docs and community reports
- Webhook handling on Cloudflare: MEDIUM - Community workarounds, needs testing

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - Square updates quarterly)
