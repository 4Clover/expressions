# Feature Research

**Domain:** Hair salon website with booking system
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

Modern hair salon websites require a core set of table stakes features that users expect, with clear opportunities for differentiation through premium experiences and local SEO excellence. Based on research across salon software platforms (Vagaro, Fresha, GlossGenius, Mangomint) and salon website best practices, this document maps features into actionable categories aligned with Expressions Hair Designs' goals.

**Key insight:** The booth rental model creates unique requirements — each stylist needs independent payment configuration while sharing a unified booking experience. This is supported by leading platforms but requires deliberate architecture.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these creates immediate friction and drives clients to competitors.

| Feature | Why Expected | Complexity | Notes |
|---------|-------------|------------|-------|
| **Online booking (24/7)** | 78% of salons offer digital scheduling; clients expect to book anytime | Medium | Must show real-time availability, prevent double-booking |
| **Mobile-responsive design** | Most clients browse/book on phones; 45% of salon sites still fail this | Low | Not optional — mobile-first is baseline |
| **Service catalog with pricing** | Clients want price transparency before booking | Low | Support fixed, "starting from," and range pricing |
| **Staff/stylist profiles** | Clients book with specific stylists, not just "the salon" | Low | Photo, bio, specialties, portfolio link |
| **Contact info + map** | Basic discoverability requirement | Low | Embed Google Maps, clear hours and phone |
| **Automated reminders** | Reduces no-shows by up to 40%; clients expect them | Medium | Email + SMS, 24-48 hours before |
| **Photo gallery** | Salons sell visual results; gallery proves quality | Low | Before/after photos, filterable by service/stylist |
| **SSL/HTTPS security** | Trust requirement for any booking/payment site | Low | Standard with Cloudflare Pages |
| **Google Business Profile integration** | GBP accounts for ~19% of local ranking performance | Low | Schema markup, consistent NAP (name/address/phone) |
| **Cancel/reschedule online** | Clients expect self-service appointment management | Medium | Policy enforcement, cancellation windows |

### Differentiators (Competitive Advantage)

Features that elevate beyond baseline expectations. These create memorable experiences and drive word-of-mouth.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Exceptional local SEO** | Core project goal — outrank competitors in local search | Medium | LocalBusiness schema, hyperlocal keywords, review strategy |
| **Per-stylist payment flexibility** | Booth rental model requires it; most platforms support this | Medium | Configure Venmo/Zelle/Square per stylist |
| **Deposit/no-show protection** | Reduces no-shows, protects stylist income | Medium | Card-on-file, cancellation policies |
| **Fast page loads (Core Web Vitals)** | Google ranking factor; improves mobile experience | Medium | Cloudflare edge, image optimization |
| **Branded booking experience** | Feels like the salon, not a generic platform | Low-Medium | Custom styling vs. Vagaro/Fresha generic pages |
| **Fresh visual content (geo-tagged)** | Google interprets photo recency as trust signal | Low (ongoing) | Regular gallery updates with location data |
| **Review integration display** | 78% of clients check reviews before booking | Low | Display Google/Yelp reviews on site |
| **Google Calendar sync (bi-directional)** | Stylists manage one calendar, not two | Medium | Prevents missed appointments |
| **Stylist-specific portfolios** | Deeper connection than generic gallery | Low | Each stylist curates their best work |
| **Service duration intelligence** | Accurate time estimates prevent overbooking | Low | Include processing times for color services |

### Anti-Features (Commonly Requested, Often Problematic)

Features to deliberately NOT build, despite being common in the industry.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time chat** | "Modern" feel, instant communication | Requires staff to monitor constantly; phone/text works fine for salons | Clear phone number, SMS capability |
| **AI chatbot for booking** | Automation trend, Vagaro has "Zeenie" | Complexity vs. value mismatch; simple online booking is sufficient | Well-designed booking flow that doesn't need AI |
| **Mobile native app** | Perceived professionalism | 90%+ of clients won't download; PWA or responsive web covers use cases | Mobile-optimized responsive site |
| **Inventory management** | Common in salon software | Owner explicitly doesn't need product tracking; adds admin burden | None — out of scope |
| **Payroll/commission tracking** | Part of full-service platforms | Booth rental model means stylists handle own finances | None — out of scope |
| **Waitlist automation (MVP)** | Vagaro has it; seems useful | Complexity for edge case; defer until booking system is stable | Manual waitlist or defer to post-MVP |
| **Loyalty program (MVP)** | Retention tool | Requires points tracking, reward logic, potential liability; defer | Post-MVP consideration |
| **Gift cards (MVP)** | Revenue opportunity | Integration complexity, liability tracking, 40% late-night purchases need automation | Post-MVP with proper implementation |
| **Dynamic pricing** | AI-driven pricing emerging | Complexity without clear demand; fixed pricing is expected for salons | Standard transparent pricing |
| **Multi-location support** | Platform capability | Single location; adds unnecessary abstraction | Single-tenant design |
| **Class/group booking** | Spa platforms support it | Hair salon doesn't offer classes | None — not applicable |

---

## Feature Dependencies

```
                    [Core Infrastructure]
                           |
                    [Staff Management]
                    (stylist profiles,
                     service pricing)
                           |
              +------------+------------+
              |                         |
      [Booking System]           [Content/CMS]
      - Service catalog           - Gallery
      - Availability              - Homepage
      - Confirmation              - About/Contact
              |                         |
              +------------+------------+
                           |
                    [Payment Integration]
                    - Square
                    - Per-stylist methods
                           |
                    [No-show Protection]
                    - Deposits
                    - Card-on-file
                           |
                    [Notifications]
                    - Confirmations
                    - Reminders (24-48h)
                           |
                    [SEO Layer]
                    - Schema markup
                    - GBP integration
                    - Core Web Vitals

[Post-MVP Dependencies]
Gift Cards --> Payment Integration (required)
Loyalty Program --> Customer Accounts + Payment Integration (required)
Waitlist --> Booking System + Notifications (required)
```

### Critical Path

1. **Staff & Services** must exist before booking (you book with a stylist for a service)
2. **Booking System** must work before payments (payment is for a booked appointment)
3. **Payment Integration** must work before no-show protection (deposits require payment)
4. **Notifications** require booking to trigger from

### Parallel Development Paths

- **Content/CMS** can develop in parallel with booking system
- **SEO Layer** can be implemented alongside any frontend work
- **Gallery** is independent of booking flow

---

## MVP Definition

### Launch With (v1) - Pre-MVP Alignment

Based on PROJECT.md requirements and research findings.

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Online booking with real-time availability | P0 | Table stakes; core value prop |
| Mobile-responsive design | P0 | Majority of traffic; ranking factor |
| Service catalog (categorized, priced) | P0 | Required for booking flow |
| Stylist profiles with portfolios | P0 | Booth rental model; client connection |
| Automated email + SMS reminders | P0 | 40% no-show reduction |
| Cancel/reschedule online | P0 | Client expectation |
| Google Calendar sync | P0 | Stylist workflow requirement |
| Square payment integration | P0 | Replaces Vagaro payments |
| Per-stylist payment methods | P0 | Booth rental model requirement |
| Photo gallery (filterable) | P0 | Visual proof of quality |
| Homepage, About, Contact pages | P0 | Basic site structure |
| Owner CMS (Storyblok) | P0 | Non-technical admin requirement |
| LocalBusiness schema + SEO | P0 | Core project goal |
| SSL/HTTPS | P0 | Security baseline |

### Add After Validation (v1.x)

| Feature | Priority | Trigger |
|---------|----------|---------|
| Deposit/no-show protection | P1 | After booking system stable, stylist feedback |
| Review integration (display) | P1 | After launch, when reviews accumulate |
| Enhanced gallery filters | P2 | User feedback on navigation |
| Appointment notes/preferences | P2 | Stylist workflow request |
| Service add-ons during booking | P2 | Revenue optimization |
| Recurring appointment booking | P2 | Regular client request |

### Future Consideration (v2+) - Post-MVP

| Feature | Complexity | Prerequisites |
|---------|------------|---------------|
| Gift cards (digital) | Medium | Payment integration stable; 24/7 sales automation; liability tracking |
| Loyalty program | High | Customer accounts; points system; reward fulfillment |
| Waitlist automation | Medium | Booking system mature; notification system proven |
| SMS marketing campaigns | Medium | Customer consent; phone number collection; opt-out handling |
| Client accounts/history | Medium | Authentication system; data persistence |
| Online product sales | High | Inventory (currently out of scope); shipping; tax |

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | SEO Impact | Priority |
|---------|-----------|-------------------|------------|----------|
| Online booking | Critical | Medium | Low | P0 |
| Mobile-responsive | Critical | Low | High | P0 |
| Automated reminders | High | Medium | None | P0 |
| Stylist profiles | High | Low | Medium | P0 |
| Photo gallery | High | Low | Medium | P0 |
| LocalBusiness schema | Medium | Low | Critical | P0 |
| Core Web Vitals optimization | Medium | Medium | High | P0 |
| Per-stylist payments | High | Medium | None | P0 |
| No-show protection (deposits) | Medium | Medium | None | P1 |
| Review display | Medium | Low | Medium | P1 |
| Gift cards | Low (MVP) | Medium | None | P2+ |
| Loyalty program | Low (MVP) | High | None | P2+ |
| Waitlist | Low (MVP) | Medium | None | P2+ |

---

## Competitor Feature Analysis

### Vagaro (Current System Being Replaced)

**What Vagaro Offers:**
- 24/7 online booking via website, app, and marketplace
- Automated email/SMS reminders
- POS system with hardware (cash drawers, receipt printers, card readers)
- Client management with history and preferences
- Marketing tools (email campaigns, loyalty programs, social integration)
- Booth renter support (rent scheduling, commission configuration)
- Gift cards (physical and digital)
- Waitlists
- AI features ("Vagaro AI" for booking, content generation)
- Payroll integration
- Multi-location support
- HIPAA compliance
- 24/7 phone/chat/email support

**Vagaro Pricing:** ~$30/month base + ~$10/additional user

**What Expressions Uses from Vagaro:**
- Booking (primary)
- Reminders (assumed)
- Basic client tracking

**What Expressions Doesn't Use:**
- POS (stylists use own payment methods)
- Payroll (booth rental model)
- Inventory
- AI features
- Marketplace listing (limited value for local salon)

### Feature Gap Analysis: Custom Build vs. Vagaro

| Feature | Vagaro | Custom Build | Notes |
|---------|--------|--------------|-------|
| 24/7 online booking | Yes | Yes | Core feature, must match |
| Stylist selection | Yes | Yes | Must match |
| Automated reminders | Yes | Yes | Email + SMS, must match |
| Cancel/reschedule | Yes | Yes | Must match |
| Calendar sync | Yes | Yes | Google Calendar integration |
| Per-stylist payment methods | Limited | Yes | Custom build advantage — Vagaro is more POS-focused |
| Deposit/no-show | Yes | Yes (P1) | Can defer slightly |
| Custom website | Yes (Mysite) | Yes | Custom build advantage — fully branded |
| SEO control | Limited | Full | Custom build advantage — core project goal |
| Gift cards | Yes | No (MVP) | Acceptable gap for launch |
| Loyalty program | Yes | No (MVP) | Acceptable gap for launch |
| Waitlist | Yes | No (MVP) | Acceptable gap for launch |
| CMS for owner | No | Yes (Storyblok) | Custom build advantage |
| AI features | Yes | No | Not needed; out of scope |
| 24/7 support | Yes | Developer support | Acceptable tradeoff for cost savings |

### Competitive Advantage of Custom Build

1. **Full SEO control** — Core project goal; Vagaro's Mysite has SEO limitations
2. **Per-stylist payment flexibility** — Booth rental model gets first-class support
3. **Branded experience** — Not obviously "a Vagaro site"
4. **Owner-friendly CMS** — Storyblok visual editor vs. Vagaro admin
5. **Cost optimization** — Undercut Vagaro + Squarespace combined costs
6. **No vendor lock-in** — Client owns their platform and data

### What Must Not Regress

These Vagaro features must be matched or users will perceive downgrade:

1. **24/7 online booking** — Non-negotiable
2. **Automated reminders** — Clients expect them
3. **Real-time availability** — No double-booking
4. **Mobile booking experience** — Smooth on phone
5. **Service/stylist selection** — Full flexibility

---

## Research Sources

### Salon Website Best Practices
- [Salon Websites: 25+ Inspiring Examples (2026)](https://www.sitebuilderreport.com/salon-websites)
- [7 Top Salon Website Builder Picks for 2026](https://blog.avantiy.com/7-top-salon-website-builder-picks-for-2026-success)
- [How to create a showstopping salon website](https://www.wix.com/blog/create-salon-website)
- [17 Hair Salon Website Design Examples](https://glossgenius.com/blog/hair-salon-websites)

### Salon Software Comparisons
- [9 Best Salon Software 2026: The Ultimate Guide](https://thesalonbusiness.com/best-salon-software/)
- [7 Best Salon Booking Software Solutions For 2026](https://www.salonbookingsystem.com/salon-booking-system-blog/salon-booking-software/)
- [Best Salon Software 2026: The Ultimate Comparison Guide](https://www.fresha.com/for-business/salon/best-salon-software)
- [Vagaro Pro - Salon Software](https://www.vagaro.com/pro)
- [Vagaro vs GlossGenius Comparison](https://www.capterra.com/compare/153752-174830/Vagaro-vs-GlossGenius)
- [GlossGenius for Booth Renters](https://glossgenius.com/for-booth-renters)

### Salon Website Mistakes
- [10 Common Salon Website Mistakes](https://www.glammatic.com/blog/10-common-salon-website-mistakes-you-can-easily-fix/)
- [Salon Management Mistakes](https://heygoldie.com/blog/salon-management-mistakes)
- [Why Mastering Salon Online Reputation in 2026 is a must](https://dingg.app/blogs/why-us-salon-owners-must-master-online-reviews-in-2026)

### Local SEO for Salons
- [Guide To the Future of Local Search in 2026](https://www.localfalcon.com/blog/guide-to-the-future-of-local-search-in-2026-local-ranking-factors--expert-local-seo-approaches)
- [Local SEO in 2026: The Ultimate Guide](https://boulderseomarketing.com/local-seo-a-comprehensive-guide/)
- [SEO for Salons and Spas: The Ultimate Guide](https://thesalonbusiness.com/seo-for-salons/)
- [Top 10 Local Search Ranking Factors: A 2026 Guide](https://localdominator.co/local-search-ranking-factors/)

### Booth Rental Software
- [Salon Booth Rental Software: 2025 Guide](https://www.joinhomebase.com/blog/salon-booth-rental-software)
- [Vagaro Booth Renter Software](https://www.vagaro.com/pro/booth-renter)
- [Best Salon Software for Booth Renters](https://www.bookb.io/post/best-salon-software-for-booth-renters-2025-guide)

### Gift Cards & Loyalty Programs
- [Mangomint Gift Cards](https://www.mangomint.com/features/gift-cards/)
- [Gift Card Tracking Software Best Practices](https://passkit.com/blog/gift-card-tracking-software/)
- [Salon Loyalty Programs Complete Guide](https://appointible.com/biz/blog/customer-retention/salon-loyalty-programs/)
- [Square Loyalty for Salons](https://squareup.com/us/en/the-bottom-line/reaching-customers/salon-loyalty-program-boost-profits)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table Stakes Features | HIGH | Consistent across all sources; industry standard |
| Differentiators | HIGH | Clear value props supported by market research |
| Anti-Features | HIGH | Aligned with PROJECT.md out-of-scope; supported by complexity analysis |
| Vagaro Comparison | HIGH | Official Vagaro documentation reviewed |
| Feature Dependencies | HIGH | Logical relationships; standard web app patterns |
| Post-MVP Features | MEDIUM | Market research supports value; implementation complexity estimated |
| SEO Requirements | HIGH | Multiple authoritative sources agree on local SEO factors |
