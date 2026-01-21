# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-01-19)

**Core value:** Get the salon visible on Google with a professional custom site
**Current focus:** Phase 3 - Booking-Engine

## Current Position

Phase: 3 of 7 (Booking-Engine)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-01-21 - Completed 03-03-PLAN.md (booking page & confirmation)

Progress: [██████████░░░░░░░░░░░░░░] 41.7% (10/24 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 5.3 min
- Total execution time: 53 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 3/3 | 17 min | 5.7 min |
| 2. Staff-Services-Content | 4/4 | 22 min | 5.5 min |
| 3. Booking-Engine | 3/4 | 17 min | 5.7 min |

**Recent Trend:**
- Last 5 plans: 02-04 (7 min), 03-01 (3 min), 03-02 (7 min), 03-03 (7 min)
- Trend: Stable

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

### Pending Todos

2 pending - `/gsd:check-todos` to review
- Use Claude Chrome for UI design analysis (ui)
- Review Phase 3 deferred features for feature completeness (booking) - see `.planning/phases/03-booking-engine/03-CONTEXT.md`

### Blockers/Concerns

- Research flagged: Confirm Square 2026 API requirements (Phase 4)
- Research flagged: Test Plivo SMS deliverability in target region (Phase 5)
- Research flagged: Investigate Google Calendar webhook rate limits (Phase 6)
- User setup required: Supabase project with DATABASE_URL for db:push
- User setup required: Storyblok space with VITE_STORYBLOK_ACCESS_TOKEN for CMS content

## Session Continuity

Last session: 2026-01-21T13:24:44Z
Stopped at: Completed 03-03-PLAN.md
Resume file: None
Next action: Execute 03-04-PLAN.md (cancel & reschedule flow)
