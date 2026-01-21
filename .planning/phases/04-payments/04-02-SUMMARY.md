---
phase: 04-payments
plan: 02
subsystem: payments
tags: [square, oauth, webhooks, payment-links, sdk]

# Dependency graph
requires:
  - phase: 04-01
    provides: payments schema (staffSquareConfig, payments, processedWebhooks tables)
provides:
  - Square SDK integration with client helpers
  - OAuth flow for per-stylist Square authorization
  - Payment Link creation endpoint
  - Webhook handler with signature verification and idempotency
affects: [04-03, booking-flow, admin-dashboard]

# Tech tracking
tech-stack:
  added: [square@43.2.1]
  patterns: [per-stylist-oauth, payment-links-redirect, webhook-idempotency]

key-files:
  created:
    - apps/web/src/lib/payments/square.ts
    - apps/web/src/routes/api/square/oauth/+server.ts
    - apps/web/src/routes/api/square/oauth/callback/+server.ts
    - apps/web/src/routes/api/payments/create-link/+server.ts
    - apps/web/src/routes/api/webhooks/square/+server.ts
  modified: []

key-decisions:
  - "Square SDK v43+ API returns responses directly (not wrapped in 'result')"
  - "Use 'token' property (not 'accessToken') for SquareClient constructor"
  - "SquareEnvironment enum replaces Environment (SDK naming change)"
  - "WebhooksHelper.verifySignature is static method with async return"

patterns-established:
  - "Per-stylist OAuth: Each stylist authorizes app independently via OAuth flow"
  - "Payment Links: Use redirect flow (not embedded SDK) for simpler PCI compliance"
  - "Webhook idempotency: Track event_id in processedWebhooks table"

# Metrics
duration: 7min
completed: 2026-01-21
---

# Phase 4 Plan 2: Square Integration Summary

**Square SDK v43 integration with per-stylist OAuth, Payment Links API, and webhook handler with idempotency**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-21T14:31:15Z
- **Completed:** 2026-01-21T14:38:33Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Square SDK installed with client helper functions for per-stylist tokens
- Complete OAuth flow (initiation + callback) storing tokens in database
- Payment Link creation endpoint for deposit collection
- Webhook handler with signature verification and idempotency

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Square SDK and create client helper** - `ca1c872` (feat)
2. **Task 2: Create Square OAuth endpoints** - `a789d9c` (feat)
3. **Task 3: Create payment link and webhook endpoints** - `6d89d8f` (feat)

## Files Created/Modified
- `apps/web/src/lib/payments/square.ts` - Square client factory, BigInt serializer, OAuth URL builder
- `apps/web/src/routes/api/square/oauth/+server.ts` - OAuth initiation (redirects to Square)
- `apps/web/src/routes/api/square/oauth/callback/+server.ts` - OAuth callback (exchanges code, stores tokens)
- `apps/web/src/routes/api/payments/create-link/+server.ts` - Creates Square Payment Link for deposit
- `apps/web/src/routes/api/webhooks/square/+server.ts` - Webhook handler with signature verification

## Decisions Made
- **Square SDK v43 API changes:** SDK no longer wraps responses in `result` property - access properties directly on response objects
- **Client constructor:** Use `token` property instead of `accessToken` per SDK v43 API
- **Environment enum:** `SquareEnvironment` replaces `Environment` import
- **WebhooksHelper static:** `verifySignature` is a static async method, not instance method
- **Simplified DATABASE_URL check:** Used `process.env.DATABASE_URL` pattern (consistent with other endpoints) instead of `platform.env`

## Deviations from Plan

None - plan executed as written with minor API adjustments for Square SDK v43.

## Issues Encountered
- **Square SDK API changes:** The plan referenced older SDK patterns (`result` wrapper, `accessToken` property, `Environment` import). Fixed by checking actual SDK types and updating to v43 API patterns. This is expected when using newer SDK versions than documented in research.

## User Setup Required

**External services require manual configuration.** From plan frontmatter:

1. **Square Developer Dashboard:**
   - Create Application at Square Developer Dashboard
   - Configure OAuth redirect URI: `https://yoursite.com/api/square/oauth/callback`
   - Create webhook subscription for `payment.completed`, `payment.failed` events
   - Webhook URL: `https://yoursite.com/api/webhooks/square`

2. **Environment Variables:**
   - `SQUARE_APPLICATION_ID` - From Square Developer Dashboard -> Applications -> Credentials
   - `SQUARE_APPLICATION_SECRET` - From Square Developer Dashboard -> Applications -> OAuth
   - `SQUARE_WEBHOOK_SIGNATURE_KEY` - From Square Developer Dashboard -> Webhooks -> Signature Key
   - `SQUARE_ENVIRONMENT` - Set to 'sandbox' for testing, 'production' for live

## Next Phase Readiness
- Square integration backend complete
- Ready for 04-03: Payment UI integration (booking flow, payment method display)
- OAuth tokens stored in staffSquareConfig table
- Payment status tracked in payments table via webhooks

---
*Phase: 04-payments*
*Completed: 2026-01-21*
