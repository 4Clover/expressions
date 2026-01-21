---
phase: 04-payments
plan: 01
subsystem: database
tags: [drizzle, postgres, payments, square, venmo, cashapp, zelle]

# Dependency graph
requires:
  - phase: 03-booking-engine
    provides: appointments table for payment relations
  - phase: 01-foundation
    provides: staff table for payment method ownership
provides:
  - staffPaymentMethods table for P2P payment configs
  - staffSquareConfig table for Square OAuth tokens
  - payments table for tracking appointment payments
  - processedWebhooks table for webhook idempotency
  - deposit configuration on services table
affects: [04-02, 04-03, booking-flow, staff-admin]

# Tech tracking
tech-stack:
  added: [tsx]
  patterns: [payment-method-enum, webhook-idempotency, per-stylist-oauth]

key-files:
  created:
    - packages/db/src/schema/payments.ts
  modified:
    - packages/db/src/schema/services.ts
    - packages/db/src/schema/index.ts
    - packages/db/scripts/seed.ts
    - packages/db/package.json

key-decisions:
  - "P2P payment types stored as enum (venmo, cashapp, zelle, cash)"
  - "Square tokens stored per-staff with note for Supabase Vault encryption"
  - "Webhook idempotency via processedWebhooks table with eventId primary key"
  - "Deposit config on services table (depositRequired + depositAmountCents)"

patterns-established:
  - "Payment method enum for type-safe P2P options"
  - "Per-stylist OAuth token storage with refresh capability"
  - "Webhook deduplication via event ID tracking"

# Metrics
duration: 8min
completed: 2026-01-21
---

# Phase 4 Plan 1: Payment Schema Foundation Summary

**Drizzle payment schema with P2P methods, Square OAuth storage, payment records, and deposit configuration**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-21T13:45:00Z
- **Completed:** 2026-01-21T13:53:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Payment schema with 4 tables: staffPaymentMethods, staffSquareConfig, payments, processedWebhooks
- Deposit configuration added to services table for per-service deposit requirements
- Seed data for testing payment methods (Venmo, CashApp, Zelle, Cash) and deposit-required services
- db:seed script added to package.json with tsx runner

## Task Commits

Each task was committed atomically:

1. **Task 1: Create payments schema with payment method and Square config tables** - `338998b` (feat)
2. **Task 2: Add deposit configuration to services table** - `87fd85b` (feat)
3. **Task 3: Update seed script with payment method test data** - `7439f78` (feat)

## Files Created/Modified
- `packages/db/src/schema/payments.ts` - Payment schema with 4 tables and relations
- `packages/db/src/schema/services.ts` - Added depositRequired and depositAmountCents columns
- `packages/db/src/schema/index.ts` - Exported new payment tables and relations
- `packages/db/scripts/seed.ts` - Added payment method and deposit seed functions
- `packages/db/package.json` - Added db:seed script and tsx dev dependency

## Decisions Made
- Used pgEnum for payment method types (venmo, cashapp, zelle, cash) for type safety
- Square OAuth tokens stored with note for production encryption via Supabase Vault
- Payment records track both Square and pay-at-salon payments via paymentMethod field
- Webhook idempotency uses eventId as primary key (Square's unique event identifier)
- Deposit amounts stored in cents (consistent with existing price_min/price_max pattern)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Square SDK v43 API changes in square.ts**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** square.ts used deprecated Environment export and accessToken option
- **Fix:** Changed to SquareEnvironment and token option per SDK v43 API
- **Files modified:** apps/web/src/lib/payments/square.ts
- **Verification:** pnpm check passes
- **Committed in:** 87fd85b (part of Task 2 commit - file was untracked)

**2. [Rule 3 - Blocking] Fixed Square SDK v43 API in OAuth callback**
- **Found during:** Task 3 verification
- **Issue:** OAuth callback used `result.accessToken` pattern (SDK v39 style)
- **Fix:** Changed to direct response properties per SDK v43 API
- **Files modified:** apps/web/src/routes/api/square/oauth/callback/+server.ts
- **Verification:** pnpm check passes
- **Committed in:** a789d9c (committed by parallel process)

**3. [Rule 3 - Blocking] Fixed Square SDK v43 API in create-link endpoint**
- **Found during:** Overall verification
- **Issue:** create-link used paymentLink wrapper and metadata on Order (invalid in v43)
- **Fix:** Removed paymentLink wrapper, used referenceId instead of metadata
- **Files modified:** apps/web/src/routes/api/payments/create-link/+server.ts
- **Verification:** pnpm check passes
- **Committed in:** 6d89d8f (committed by parallel process)

---

**Total deviations:** 3 auto-fixed (all Rule 3 - Blocking issues)
**Impact on plan:** All auto-fixes were necessary to unblock TypeScript compilation. The Square SDK v43 API changes were breaking files created during Phase 4 planning/research. No scope creep.

## Issues Encountered
- DATABASE_URL not set in environment - seed script and db:push verification could not be run against actual database. Seed script exits gracefully without DATABASE_URL per existing pattern.

## User Setup Required

None - no external service configuration required for schema changes. Database migration will be applied automatically when DATABASE_URL is configured.

## Next Phase Readiness
- Payment schema foundation ready for Phase 4 Plan 2 (Square OAuth flow implementation)
- Seed data ready for testing payment display in booking flow
- Blocker: DATABASE_URL required to actually apply migrations and seed data

---
*Phase: 04-payments*
*Completed: 2026-01-21*
