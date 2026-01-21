# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-01-19)

**Core value:** Get the salon visible on Google with a professional custom site
**Current focus:** Phase 4 - Payments (COMPLETE)

## Current Position

Phase: 4 of 7 (Payments) - COMPLETE
Plan: 3 of 3 in current phase (PHASE COMPLETE)
Status: Phase 4 complete, ready for Phase 5
Last activity: 2026-01-21 - Completed 04-03-PLAN.md (Payment UI Integration)

Progress: [██████████████████░░░░░░] 58% (14/24 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 6.0 min
- Total execution time: 84 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 3/3 | 17 min | 5.7 min |
| 2. Staff-Services-Content | 4/4 | 22 min | 5.5 min |
| 3. Booking-Engine | 4/4 | 18 min | 4.5 min |
| 4. Payments | 3/3 | 27 min | 9.0 min |

**Recent Trend:**
- Last 5 plans: 03-03 (7 min), 03-04 (4 min), 04-01 (8 min), 04-02 (7 min), 04-03 (12 min)
- Trend: Stable (payments slightly longer due to complexity)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Square over Stripe (learn Square ecosystem, POS potential)
- [Init]: Per-stylist pricing in DB (flexibility for booth rental model)
- [Init]: Storyblok for CMS (visual editor for non-technical owner)
- [Init]: Port Picasso booking code (proven flow, modernize vs rebuild)
- [01-01]: Extended .svelte-kit/tsconfig.json for SvelteKit integration
- [01-01]: Tailwind v4 Vite plugin order: tailwindcss() before sveltekit()
- [01-01]: Svelte 5 $props() syntax in layout components
- [01-02]: prepare: false for postgres client (Supabase transaction pooler)
- [01-02]: Prices stored in cents (avoid floating point issues)
- [01-02]: Price type enum (fixed/starting/range) for salon pricing models
- [01-03]: OKLCH color space for design tokens (perceptually uniform)
- [01-03]: Rose gold accent color for CTAs/highlights
- [01-03]: Cormorant Garamond (serif, 700) for headings, DM Sans for body
- [01-03]: Card shadows increased per user feedback (shadow + hover:shadow-lg)
- [02-01]: RLS policies use anonRole + authenticatedRole for public pages
- [02-01]: Slug-to-name conversion: jane-doe -> Jane Doe (simple case)
- [02-01]: Custom price priority: show staff custom price, else service base price
- [02-02]: Type assertion for Storyblok components (Svelte 5 types stricter than SDK)
- [02-02]: Rich text fields use any with parameter cast (type incompatibility)
- [02-03]: Storyblok bridge uses $derived with fallback pattern (Svelte 5 strictness)
- [02-03]: Staff API uses dynamic import to handle missing DATABASE_URL gracefully
- [02-04]: URL query params for gallery deep linking (?category=x&stylist=y)
- [02-04]: CSS-based before/after slider for Svelte 5 compatibility
- [03-01]: Text type for time columns (Drizzle time type quirks)
- [03-01]: Seed script in packages/db/scripts/ (drizzle/ is gitignored)
- [03-01]: Empty arrow function for RLS policies with sql`true`
- [03-02]: Local time for slot generation (salon times are local, not UTC)
- [03-02]: Slot grouping by time of day: Morning/Afternoon/Evening
- [03-02]: "Any Available" stylist uses 'any' as special staffId value
- [03-02]: Input component bindable value for Svelte 5 form two-way binding
- [03-03]: Wizard state via $state rune (no external state library for linear flow)
- [03-03]: "Any Available" staffId='any' resolved at POST time to first available staff
- [03-03]: ICS download via Blob and URL.createObjectURL for client-side generation
- [03-04]: Reschedule as cancel + rebook (per CONTEXT.md decision)
- [03-04]: 24-hour policy soft-enforced for demo (always allow cancellation)
- [04-01]: P2P payment types as enum (venmo, cashapp, zelle, cash)
- [04-01]: Square OAuth tokens per-staff with Supabase Vault encryption note
- [04-01]: Webhook idempotency via processedWebhooks with eventId PK
- [04-01]: Deposit config on services (depositRequired + depositAmountCents)
- [04-02]: Square SDK v43+ returns responses directly (not wrapped in 'result')
- [04-02]: Use 'token' property (not 'accessToken') for SquareClient constructor
- [04-02]: SquareEnvironment enum replaces Environment (SDK naming change)
- [04-02]: WebhooksHelper.verifySignature is static async method
- [04-03]: Venmo deep link uses venmo.com URL (opens app via universal links)
- [04-03]: CashApp deep link uses cash.app URL format
- [04-03]: Zelle has no universal deep link - display email with bank app instructions
- [04-03]: Payment completion page polls for webhook status with max 10 attempts
- [04-03]: Deposit-required services must use Square online payment

### Pending Todos

2 pending - `/gsd:check-todos` to review
- Use Claude Chrome for UI design analysis (ui)
- Review Phase 3 deferred features for feature completeness (booking) - see `.planning/phases/03-booking-engine/03-CONTEXT.md`

### Blockers/Concerns

- Research flagged: Test Plivo SMS deliverability in target region (Phase 5)
- Research flagged: Investigate Google Calendar webhook rate limits (Phase 6)
- User setup required: Supabase project with DATABASE_URL for db:push
- User setup required: Storyblok space with VITE_STORYBLOK_ACCESS_TOKEN for CMS content
- User setup required: Square Developer Dashboard with SQUARE_* environment variables

## Session Continuity

Last session: 2026-01-21T15:15:00Z
Stopped at: Completed 04-03-PLAN.md (Payment UI Integration) - PHASE 4 COMPLETE
Resume file: None
Next action: Plan Phase 5 (Notifications) - `/gsd:plan-phase 5`
