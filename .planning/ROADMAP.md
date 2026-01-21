# Roadmap: Expressions Hair Designs

**Created:** 2026-01-20
**Phases:** 9
**Requirements:** 46 mapped

## Overview

This roadmap delivers a custom salon website that replaces fragmented Vagaro + Squarespace with a unified platform. The journey progresses from design system foundation through staff/services data, booking engine, payments, notifications, calendar sync, and culminates with admin tools and SEO optimization — the core project goal of Google visibility.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Monorepo, database, auth, design system, base UI components
- [x] **Phase 2: Staff-Services-Content** - Staff profiles, service catalog, CMS integration, marketing pages
- [x] **Phase 3: Booking-Engine** - Availability calculation, booking wizard, cancel/reschedule
- [x] **Phase 4: Payments** - Square integration, per-stylist payment methods
- [ ] **Phase 5: Code-Quality-Analysis** - Comprehensive code analysis using documentation sources for production-level correctness
- [ ] **Phase 6: Notifications** - Email and SMS confirmations and reminders
- [ ] **Phase 7: Calendar-Sync** - Google Calendar bi-directional sync
- [ ] **Phase 8: Admin-SEO-Launch** - Admin dashboard, gallery, SEO optimization, launch hardening
- [ ] **Phase 9: Code-Quality-Analysis** - Final code quality pass before production deployment

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the technical foundation with monorepo structure, database schema, authentication, and a design system that embodies the "quiet luxury" aesthetic.
**Depends on**: Nothing (first phase)
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09, UX-10
**Success Criteria** (what must be TRUE):
  1. Developer can run `pnpm dev` and see a styled landing page with shadcn-svelte components
  2. Design tokens (colors, typography, spacing) reflect quiet luxury aesthetic with monochromatic palette and gold accents
  3. All interactive components have visible focus indicators and meet 4.5:1 contrast ratio
  4. Touch targets are minimum 24x24px and animations use 500-800ms easing
  5. Database migrations run successfully and Supabase connection is established with RLS enabled
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Monorepo and tooling setup (Turborepo, SvelteKit, Cloudflare adapter)
- [x] 01-02-PLAN.md — Database schema and Supabase connection (Drizzle ORM, RLS policies)
- [x] 01-03-PLAN.md — Design system and component library (shadcn-svelte, design tokens)

**Directory:** `.planning/phases/01-foundation/`

### Phase 2: Staff-Services-Content
**Goal**: Create the data foundation that booking depends on — staff profiles, service catalog, and CMS-managed marketing content.
**Depends on**: Phase 1
**Requirements**: STAFF-01, STAFF-02, STAFF-03, STAFF-04, STAFF-05, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. Customer can view stylist profile pages with photo, bio, specialties, and portfolio samples
  2. Customer can browse services organized by category with duration and pricing displayed
  3. Owner can edit homepage content, about page, and contact info via Storyblok visual editor
  4. Homepage displays hero section, services overview, and staff highlights
  5. Photo gallery displays before/after images filterable by service type and stylist
**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Staff and services database relations, RLS policies, and display pages
- [x] 02-02-PLAN.md — Storyblok CMS integration and block components
- [x] 02-03-PLAN.md — CMS-driven marketing pages (homepage, about, contact)
- [x] 02-04-PLAN.md — Photo gallery with before/after comparison and filtering

**Directory:** `.planning/phases/02-staff-services-content/`

### Phase 3: Booking-Engine
**Goal**: Enable customers to book appointments online with real-time availability, slot selection, and the ability to cancel or reschedule.
**Depends on**: Phase 2
**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-08
**Success Criteria** (what must be TRUE):
  1. Customer can complete full booking flow: browse services, select stylist, pick date/time, confirm
  2. Customer sees only available slots based on stylist schedule (no double-booking possible)
  3. Customer can cancel appointment online within policy window
  4. Customer can reschedule appointment to a different available slot
  5. Deposit can be collected via card-on-file for no-show protection
**Plans:** 4 plans

Plans:
- [x] 03-01-PLAN.md — Schema and dependencies (appointments table, staff schedule, npm packages)
- [x] 03-02-PLAN.md — Availability engine and booking UI components
- [x] 03-03-PLAN.md — Booking wizard page and confirmation flow
- [x] 03-04-PLAN.md — Cancel and reschedule flows

**Directory:** `.planning/phases/03-booking-engine/`

### Phase 4: Payments
**Goal**: Enable flexible payment options including Square online payment and per-stylist payment method display for the booth rental model.
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04
**Success Criteria** (what must be TRUE):
  1. Each stylist has configurable payment methods in their profile (Venmo handle, Zelle, cash)
  2. Customer can choose "pay at salon" when booking and sees stylist's preferred payment methods
  3. Stylists who enable Square can accept online payments during booking
  4. Payment webhooks correctly update booking status
**Plans:** 3 plans

Plans:
- [x] 04-01-PLAN.md — Payment schema and stylist configuration (payment methods, Square config, deposits)
- [x] 04-02-PLAN.md — Square OAuth and online payment (OAuth flow, payment links, webhooks)
- [x] 04-03-PLAN.md — Pay-at-salon flow and booking integration (PaymentStep, deep links, confirmation)

**Directory:** `.planning/phases/04-payments/`

### Phase 5: Code-Quality-Analysis
**Goal**: Establish industry/production levels of minimal, objectively correct, and error-free code through comprehensive analysis using ESLint, Svelte checks, and TypeScript type-checking.
**Depends on**: Phase 4
**Requirements**: None (quality gate)
**Success Criteria** (what must be TRUE):
  1. Zero ESLint errors across entire codebase
  2. Zero Svelte check warnings/errors
  3. Zero TypeScript type errors in strict mode
  4. All code patterns align with official documentation (verified via Ref/Context7)
  5. No deprecated API usage identified
**Plans:** 3 plans

Plans:
- [ ] 05-01-PLAN.md — ESLint setup and svelte-check error fixes
- [ ] 05-02-PLAN.md — Full ESLint run and codebase pattern verification
- [ ] 05-03-PLAN.md — Pattern documentation and GSD workflow modifications

**Directory:** `.planning/phases/05-code-quality-analysis/`

### Phase 6: Notifications
**Goal**: Reduce no-shows and keep customers informed through automated email and SMS confirmations and reminders.
**Depends on**: Phase 4
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05
**Success Criteria** (what must be TRUE):
  1. Customer receives booking confirmation via email immediately after booking
  2. Customer receives booking confirmation via SMS immediately after booking
  3. Customer receives reminder email 24-48 hours before appointment
  4. Customer receives reminder SMS 24-48 hours before appointment
  5. Customer receives cancellation confirmation email when appointment is cancelled
**Plans**: TBD

Plans:
- [ ] 06-01: Email templates and Resend integration
- [ ] 06-02: SMS integration (Plivo)
- [ ] 06-03: Reminder scheduler (Cloudflare Cron)

**Directory:** `.planning/phases/06-notifications/`

### Phase 7: Calendar-Sync
**Goal**: Enable bi-directional Google Calendar sync so stylists can manage their schedule from their preferred calendar app.
**Depends on**: Phase 4
**Requirements**: BOOK-07
**Success Criteria** (what must be TRUE):
  1. Stylist can connect their Google Calendar via OAuth
  2. New bookings automatically appear on stylist's Google Calendar
  3. External calendar changes (blocking time, cancellations) sync back to the booking system
  4. Sync handles timezone differences correctly (UTC storage, local display)
**Plans**: TBD

Plans:
- [ ] 07-01: Google OAuth and calendar connection
- [ ] 07-02: Outbound sync (booking to calendar)
- [ ] 07-03: Inbound sync (calendar to booking)

**Directory:** `.planning/phases/07-calendar-sync/`

### Phase 8: Admin-SEO-Launch
**Goal**: Empower the owner with intuitive admin tools and achieve the core project goal — Google visibility through proper SEO implementation.
**Depends on**: Phase 5, Phase 6, Phase 7
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Owner can view booking calendar and manage appointments without technical knowledge
  2. Owner can update business hours, announcements, and promotions via Storyblok
  3. Owner can add/remove gallery photos through intuitive interface
  4. Site is fully mobile-responsive with mobile-first design
  5. LocalBusiness schema markup is present with accurate NAP data
  6. Core Web Vitals targets are met (LCP, FID, CLS)
  7. Google Business Profile integration is configured
**Plans**: TBD

Plans:
- [ ] 08-01: Admin dashboard and booking management
- [ ] 08-02: SEO implementation (schema, meta, GBP)
- [ ] 08-03: Performance optimization (Core Web Vitals)
- [ ] 08-04: Launch hardening and testing

**Directory:** `.planning/phases/08-admin-seo-launch/`

### Phase 9: Code-Quality-Analysis
**Goal**: Final production-readiness code quality pass ensuring all new code from Phases 6-8 meets the same standards established in Phase 5.
**Depends on**: Phase 8
**Requirements**: None (quality gate)
**Success Criteria** (what must be TRUE):
  1. Zero ESLint errors across entire codebase
  2. Zero Svelte check warnings/errors
  3. Zero TypeScript type errors in strict mode
  4. All code patterns align with official documentation (verified via Ref/Context7)
  5. No deprecated API usage identified
  6. Production build succeeds without warnings
**Plans**: TBD

Plans:
- [ ] 09-01: TBD (run /gsd:plan-phase 9 to break down)

**Directory:** `.planning/phases/09-code-quality-analysis/`

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
(Note: Phases 6, 7 can potentially run in parallel after Phase 5)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-01-21 |
| 2. Staff-Services-Content | 4/4 | Complete | 2026-01-21 |
| 3. Booking-Engine | 4/4 | Complete | 2026-01-21 |
| 4. Payments | 3/3 | Complete | 2026-01-21 |
| 5. Code-Quality-Analysis | 0/3 | Not started | - |
| 6. Notifications | 0/3 | Not started | - |
| 7. Calendar-Sync | 0/3 | Not started | - |
| 8. Admin-SEO-Launch | 0/4 | Not started | - |
| 9. Code-Quality-Analysis | 0/1 | Not started | - |

**Total:** 14/28 plans complete
