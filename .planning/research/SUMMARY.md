# Project Research Summary

**Project:** Expressions Hair Designs
**Domain:** Hair salon website with booking system
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

Expressions Hair Designs is a local hair salon transitioning from Vagaro to a custom-built website with a primary goal of Google visibility (SEO). The research validates this as a well-understood domain with established patterns: SvelteKit 2 + Svelte 5 for the frontend, Supabase for PostgreSQL + Auth, Drizzle ORM, Storyblok CMS for owner-friendly content management, and Square for payments. The stack is mature, well-documented, and appropriate for the 10-stylist scale of this salon.

The recommended approach is to build a lean MVP that matches Vagaro's core booking functionality while gaining SEO control and per-stylist payment flexibility (the booth rental model's key requirement). The architecture follows SvelteKit best practices: Form Actions for mutations, Load Functions for data fetching, domain-organized server code, and Svelte 5 runes for client state. A monorepo structure (Turborepo + pnpm) organizes shared packages for database, UI components, and email templates.

The three critical risks are: (1) **race conditions causing double-bookings** — mitigate with optimistic locking using PostgreSQL version columns, (2) **timezone corruption** — store all times in UTC with IANA timezone names, convert only at display, and (3) **Supabase RLS misconfiguration** — enable RLS from day one on every table, test with different user roles before launch. Secondary risks include Google Calendar sync conflicts (requires bi-directional sync with conflict detection) and Svelte 4-to-5 migration issues if porting code from the existing Picasso-Hair-Salon repo.

## Key Findings

### Recommended Stack

The existing tech stack workup is validated and production-ready for 2026. All packages have recent releases with Svelte 5 compatibility confirmed. No major changes needed from the original tech stack document — only minor updates for package names (`@lucide/svelte` instead of `lucide-svelte`) and Zod 4 adapter changes in Superforms.

**Core technologies:**
- **SvelteKit 2.15+ / Svelte 5.16+**: Framework — mature, stable, excellent SEO with SSR
- **Supabase**: PostgreSQL + Auth + RLS — official SvelteKit SSR support via `@supabase/ssr`
- **Drizzle ORM**: Database queries — edge-compatible, type-safe, lighter than Prisma
- **Storyblok v5**: CMS — visual editor for non-technical owner, Svelte 5 runes compatible
- **Square**: Payments — supports booth rental model with per-stylist merchant IDs
- **Cloudflare Pages**: Hosting — edge deployment, excellent performance, generous free tier
- **shadcn-svelte**: UI components — Tailwind v4 support, accessible, customizable

**Stack gaps identified:**
- Background jobs: Use Cloudflare Cron Triggers for reminders
- Rate limiting: Use Cloudflare KV
- Error monitoring: Add Sentry (`@sentry/sveltekit`)
- Analytics: Cloudflare Web Analytics (free) or Plausible

### Expected Features

**Must have (table stakes):**
- 24/7 online booking with real-time availability
- Mobile-responsive design (mobile-first, ranking factor)
- Service catalog with pricing (fixed, "starting from", range)
- Stylist profiles with portfolios
- Automated email + SMS reminders (reduces no-shows 40%)
- Cancel/reschedule online
- Google Calendar bi-directional sync
- Square payment integration with per-stylist methods
- Photo gallery (filterable by service/stylist)
- Owner CMS (Storyblok visual editor)
- LocalBusiness schema + SEO optimization

**Should have (competitive advantage):**
- Deposit/no-show protection (after booking system stable)
- Exceptional local SEO (core project goal)
- Fast page loads (Core Web Vitals as ranking factor)
- Branded booking experience (not generic platform look)
- Review integration display

**Defer (v2+):**
- Gift cards (requires 24/7 automation, liability tracking)
- Loyalty program (requires customer accounts, points system)
- Waitlist automation (defer until booking mature)
- AI chatbot (complexity without value for simple booking)
- Mobile native app (90%+ won't download; responsive web sufficient)

### Architecture Approach

The architecture follows a layered SvelteKit pattern: Presentation (routes grouped by function), Application (Form Actions + Load Functions + Hooks), Domain (business logic in `$lib/server/`), and Data (Drizzle schema in shared `packages/db`). A monorepo structure separates concerns: `apps/web` for SvelteKit, `packages/db` for Drizzle schema, `packages/email` for MJML templates, `packages/ui` for shared shadcn components.

**Major components:**
1. **Booking Engine** (`$lib/server/booking/`) — availability calculation, slot reservation with optimistic locking, calendar sync
2. **Payment Processing** (`$lib/server/payments/`) — Square integration, webhook handling, per-stylist configuration
3. **Notification System** (`$lib/server/notifications/`) — Resend email, Plivo SMS, scheduled reminders via Cloudflare Cron
4. **CMS Integration** — Storyblok for marketing pages, staff bios, gallery; database for transactional data
5. **Auth Layer** (`hooks.server.ts`) — Supabase SSR, role-based access, route protection

### Critical Pitfalls

1. **Race conditions (double booking)** — Use `SELECT ... FOR UPDATE` with version columns in Drizzle transactions. Check `rows affected = 1` before confirming. Never show stale availability after any booking operation.

2. **Supabase RLS disabled/misconfigured** — Enable RLS immediately on table creation, not "later". Use `(select auth.uid())` in policies for performance. Never expose `service_role` key to client code. Test by querying as different roles.

3. **Timezone corruption** — Store all times in UTC with IANA timezone (`America/New_York`). Convert to local time only at display layer. Use `@internationalized/date` for consistency. Test around DST transitions (March/November).

4. **Svelte 4 to 5 migration breaks** — Use `npx sv migrate svelte-5` for automated conversion. Replace `let` with `$state()`, `$:` with `$derived`. Keep `onMount` for one-time init. Convert one component at a time, test after each.

5. **Square duplicate customers** — Always search for existing customer by email AND phone before creating. Use idempotency keys on all create operations. Store Square customer ID in local database.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation + Database
**Rationale:** All other features depend on monorepo structure, database schema, and Supabase connection. Must establish RLS policies and optimistic locking patterns before any booking code.
**Delivers:** Monorepo (Turborepo + pnpm), Drizzle schema with migrations, Supabase connection with auth hooks, RLS policies, shadcn-svelte setup.
**Addresses:** Core infrastructure for all subsequent phases.
**Avoids:** RLS misconfiguration (by enabling from day one), migration pain (by starting fresh with Svelte 5).

### Phase 2: Staff + Services + CMS Foundation
**Rationale:** Booking requires staff/services to exist. CMS setup enables parallel content development while booking builds.
**Delivers:** Staff profiles (read-only), service catalog with pricing, basic Storyblok integration, marketing pages (homepage, about, contact).
**Uses:** Drizzle for staff/services tables, Storyblok SDK v5, shadcn-svelte for UI.
**Implements:** CMS content types, staff-service relationships.

### Phase 3: Booking Engine
**Rationale:** Core value proposition. Depends on Phase 2 (staff/services must exist). Most complex feature — needs dedicated focus.
**Delivers:** Availability calculation, booking wizard UI, slot reservation with locking, confirmation flow, cancel/reschedule.
**Addresses:** 24/7 online booking, real-time availability, stylist selection.
**Avoids:** Race conditions (via optimistic locking), timezone issues (via UTC storage).

### Phase 4: Payments
**Rationale:** Depends on booking system (payment is for a booking). Per-stylist configuration is booth rental requirement.
**Delivers:** Square Web SDK integration, payment processing, webhook handling, per-stylist payment methods display, pay-at-salon flow.
**Uses:** Square SDK (client + server), Square Webhooks.
**Avoids:** Duplicate customers (via search-before-create), PCI issues (via Square hosted fields only).

### Phase 5: Notifications
**Rationale:** Depends on booking (notifications triggered by bookings). Reduces no-shows significantly.
**Delivers:** Email templates (MJML), Resend integration, Plivo SMS, confirmation notifications, reminder scheduler, Cloudflare Cron triggers.
**Addresses:** Automated reminders, booking confirmations.
**Avoids:** Deliverability issues (by testing before launch, using proper domain setup).

### Phase 6: Google Calendar Sync
**Rationale:** Critical for stylist workflow but complex. Better to stabilize booking first.
**Delivers:** Per-stylist Google OAuth, outbound sync (booking -> calendar), webhook for inbound changes, incremental sync job.
**Avoids:** Sync conflicts (via bi-directional sync with conflict detection), timezone mismatch (via IANA timezone throughout).

### Phase 7: Admin Dashboard
**Rationale:** Depends on all data systems. Owner/stylist management interface.
**Delivers:** Dashboard layout, appointment calendar view, staff management CRUD, service management CRUD, settings.
**Uses:** Role-based auth (owner/admin roles), shadcn-svelte components.

### Phase 8: Gallery + SEO Optimization
**Rationale:** Marketing polish. SEO is core project goal but depends on complete content structure.
**Delivers:** Photo gallery (filterable), LocalBusiness schema.org markup, meta tags, Core Web Vitals optimization, Google Search Console setup.
**Addresses:** Core project goal (Google visibility), photo gallery table stakes.

### Phase 9: Launch Hardening
**Rationale:** Pre-launch validation of all systems.
**Delivers:** E2E tests (Playwright), concurrent booking tests, security audit (RLS verification), performance testing, monitoring setup (Sentry).
**Avoids:** All documented pitfalls (via explicit testing checklist).

### Phase Ordering Rationale

- **Database/auth before everything**: RLS policies must be established before any data access patterns form. Retrofitting security is harder and riskier.
- **Staff/services before booking**: Cannot book without services and stylists. Data model must be stable.
- **Booking before payments**: Payment is tied to booking. Square integration needs appointment context.
- **Payments before notifications**: Confirmation emails may include payment info.
- **Calendar sync isolated**: Complex integration with external service. Easier to debug when booking is stable.
- **SEO at end**: Requires all content and structure to be in place for proper schema markup.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Booking Engine):** Verify optimistic locking syntax with Drizzle (examples used raw SQL).
- **Phase 4 (Payments):** Confirm Square 2026 API requirements; multiple deprecations noted for 2025.
- **Phase 6 (Google Calendar):** Investigate webhook setup for real-time sync; rate limits may affect polling.
- **Phase 5 (Notifications):** Test Plivo deliverability in target region; carrier filtering varies.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented SvelteKit + Supabase + Drizzle patterns.
- **Phase 2 (Staff/Services/CMS):** Standard CRUD + Storyblok has excellent docs.
- **Phase 7 (Admin Dashboard):** Standard CRUD interface patterns.
- **Phase 8 (Gallery/SEO):** Established LocalBusiness schema patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified via official docs, changelogs, npm registries |
| Features | HIGH | Consistent industry patterns across Vagaro, GlossGenius, Fresha; clear table stakes |
| Architecture | HIGH | SvelteKit patterns well-documented; booking system architecture established |
| Pitfalls | HIGH | Multiple sources confirm each pitfall; recovery strategies documented |

**Overall confidence:** HIGH

### Gaps to Address

- **Background job queue:** If notification volume grows, may need Trigger.dev or similar. Start with Cloudflare Cron, evaluate after launch.
- **Drizzle + Cloudflare edge:** The `postgres` package may have Node module issues on Workers. Test thoroughly with `nodejs_compat` flag before production.
- **Per-stylist Square merchants:** Confirm Square supports multiple merchant IDs in single application or if separate integrations needed.
- **SMS opt-out compliance:** Verify Plivo handles TCPA requirements for US SMS marketing/notifications.

## Sources

### Primary (HIGH confidence)
- [Svelte Blog - January 2026](https://svelte.dev/blog/whats-new-in-svelte-january-2026)
- [SvelteKit Cloudflare Adapter](https://svelte.dev/docs/kit/adapter-cloudflare)
- [Supabase SvelteKit SSR](https://supabase.com/docs/guides/auth/server-side/sveltekit)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storyblok Svelte SDK v5](https://www.storyblok.com/mp/storyblok-svelte-sdk-updated-to-v5-with-lots-of-new-features)
- [shadcn-svelte Changelog](https://www.shadcn-svelte.com/docs/changelog)
- [Square Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview)
- [Square Checkout API Common Pitfalls](https://developer.squareup.com/docs/checkout-api/common-pitfalls)

### Secondary (MEDIUM confidence)
- [Vagaro Pro Features](https://www.vagaro.com/pro) — competitor baseline
- [Drizzle SvelteKit Integration](https://sveltekit.io/blog/drizzle-sveltekit-integration)
- [Google Calendar Sync Guide](https://developers.google.com/workspace/calendar/api/guides/sync)
- [HackerNoon: Race Conditions in Booking Systems](https://hackernoon.com/how-to-solve-race-conditions-in-a-booking-system)
- [Salon Software Comparisons (TheSalonBusiness, Fresha)](https://thesalonbusiness.com/best-salon-software/)

### Tertiary (LOW confidence)
- [Flowbite Svelte Next](https://github.com/themesberg/flowbite-svelte-next) — early development, use for prototyping only

---
*Research completed: 2026-01-20*
*Ready for roadmap: yes*
