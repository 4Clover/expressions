# Expressions Hair Designs

## What This Is

A custom salon website for Expressions Hair Designs that replaces their fragmented Vagaro + Squarespace setup with a unified platform. Consolidates booking, payments, content management, and SEO into one maintainable system — built as a client project with upfront fee + 1-3 year maintenance contract.

## Core Value

Get the salon visible on Google. Quality haircuts aren't showing up in local search results — fixing that is the pitch that sold this project.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Booking System**
- [ ] Customer can browse services by category
- [ ] Customer can select stylist (with availability shown)
- [ ] Customer can pick date/time from available slots
- [ ] Customer receives confirmation email + SMS
- [ ] Customer receives reminder 24-48 hours before appointment
- [ ] Customer can cancel or reschedule online
- [ ] Stylist calendar syncs with Google Calendar (bi-directional)
- [ ] Double-booking prevented via optimistic locking

**Payments**
- [ ] Customer can pay online via Square
- [ ] Customer can choose "pay at salon" with stylist's preferred methods displayed
- [ ] Each stylist has configurable payment methods (Venmo handle, Zelle, cash, etc.)
- [ ] Deposit/hold capability for no-show protection

**Staff & Services**
- [ ] Each stylist has profile page with photo, bio, specialties, portfolio
- [ ] Each stylist has their own service pricing (even if mostly standard)
- [ ] Services organized by category (cuts, color, treatments, styling)
- [ ] Services show duration and price (fixed, starting-from, or range)

**Content & Gallery**
- [ ] Homepage with hero, services overview, staff highlights
- [ ] Gallery with before/after photos, filterable by service/stylist
- [ ] About page with salon story and location info
- [ ] Contact page with map, hours, phone

**Owner Admin (CMS)**
- [ ] Owner can edit homepage content visually (Storyblok)
- [ ] Owner can update business hours, announcements, promotions
- [ ] Owner can add/remove gallery photos
- [ ] Owner can view booking calendar and manage appointments
- [ ] UI is intuitive — no technical knowledge required

**SEO**
- [ ] Site renders with proper meta tags, structured data (LocalBusiness schema)
- [ ] Fast page loads (Core Web Vitals optimized)
- [ ] Google Business Profile integration

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **Real-time chat** — Unnecessary complexity, phone/text works fine for salon
- **Mobile app** — Web-first, responsive design covers mobile use cases
- **Inventory management** — Owner doesn't need product tracking for MVP
- **Payroll/booth rent tracking** — Stylists are independent, handle their own finances
- **Loyalty program** — Deferred to post-MVP (nice-to-have, not core)
- **Gift cards** — Deferred to post-MVP
- **Waitlist automation** — Deferred to post-MVP
- **AI features** — Not needed, adds complexity without clear value

## Context

**The Salon**
- Booth rental model: Owner runs business and cuts hair, 10 stylists rent seats
- Each stylist handles their own payments (cash, Venmo, Zelle, Square varies)
- Currently using Vagaro (~$120+/month) + barebones Squarespace site
- Salon is in flux between systems — good window to introduce new platform

**The Problem**
- SEO is failing: searching "haircut [location]" doesn't show them on page 1
- Quality of work exceeds competitors who rank higher
- Fragmented services (booking, website, "SEO company") costing money without results

**Existing Code**
- Picasso-Hair-Salon repo contains functional booking system with Stripe integration
- ~6-9 months old, built with shadcn-svelte
- Needs modernization: Svelte 5 runes, proper TypeScript types, Square instead of Stripe
- Core booking flow is proven, styling and integration need rework

**Business Model**
- Upfront development fee + 1-3 year maintenance contract
- Undercutting their current combined monthly costs
- Developer maintains site and implements feature requests

## Constraints

- **Tech stack**: SvelteKit 2 + Svelte 5, Supabase, Drizzle, Storyblok, Square, shadcn-svelte (per tech-stack-workup.md)
- **Owner UX**: All admin interfaces must be "baby-proof" — intuitive visual editing, no technical knowledge required
- **Code quality**: Svelte 5 runes syntax, proper TypeScript types, clean architecture
- **Monorepo**: Turborepo + pnpm workspace structure
- **Hosting**: Cloudflare Pages (zero egress, edge performance)
- **Existing code**: Port from Picasso-Hair-Salon, don't start from scratch

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Square over Stripe | Learn Square ecosystem, POS integration potential for future | — Pending |
| Per-stylist pricing in DB | Flexibility for future even if prices are standard now | — Pending |
| Storyblok for CMS | Visual editor is best for non-technical owner | — Pending |
| Port Picasso booking code | Proven flow exists, modernize rather than rebuild | — Pending |
| Booth rental payment model | Each stylist's payment methods configurable independently | — Pending |

---
*Last updated: 2025-01-19 after initialization*
