# Requirements: Expressions Hair Designs

**Defined:** 2025-01-19
**Core Value:** Get the salon visible on Google with a professional custom site

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Booking

- [x] **BOOK-01**: Customer can browse services organized by category
- [x] **BOOK-02**: Customer can select stylist with real-time availability shown
- [x] **BOOK-03**: Customer can pick date/time from available slots
- [x] **BOOK-04**: System prevents double-booking via optimistic locking
- [x] **BOOK-05**: Customer can cancel appointment online (within policy window)
- [x] **BOOK-06**: Customer can reschedule appointment online
- [ ] **BOOK-07**: Stylist calendar syncs with Google Calendar (bi-directional)
- [x] **BOOK-08**: Deposit can be collected for no-show protection (card-on-file)

### Payments

- [x] **PAY-01**: Each stylist has configurable payment methods in their profile
- [x] **PAY-02**: Customer can choose "pay at salon" when booking
- [x] **PAY-03**: Stylist's preferred payment methods displayed (Venmo handle, Zelle, cash)
- [x] **PAY-04**: Stylists can optionally enable Square for online payment

### Staff & Services

- [x] **STAFF-01**: Each stylist has profile page with photo, bio, specialties
- [x] **STAFF-02**: Each stylist has their own service pricing (per-stylist DB entries)
- [x] **STAFF-03**: Services organized by category (cuts, color, treatments, styling)
- [x] **STAFF-04**: Services show duration and price (fixed, starting-from, or range)
- [x] **STAFF-05**: Stylist portfolio section with before/after work samples

### Notifications

- [ ] **NOTIF-01**: Customer receives booking confirmation email
- [ ] **NOTIF-02**: Customer receives booking confirmation SMS
- [ ] **NOTIF-03**: Customer receives reminder email 24-48 hours before appointment
- [ ] **NOTIF-04**: Customer receives reminder SMS 24-48 hours before appointment
- [ ] **NOTIF-05**: Customer receives cancellation confirmation email

### Content

- [x] **CONT-01**: Homepage with hero section, services overview, staff highlights
- [x] **CONT-02**: Photo gallery with before/after images
- [x] **CONT-03**: Gallery filterable by service type and stylist
- [x] **CONT-04**: About page with salon story and location info
- [x] **CONT-05**: Contact page with embedded map, hours, phone number

### Admin (CMS)

- [ ] **ADMIN-01**: Owner can edit homepage content visually via Storyblok
- [ ] **ADMIN-02**: Owner can update business hours and announcements
- [ ] **ADMIN-03**: Owner can add/remove gallery photos
- [ ] **ADMIN-04**: Owner can view booking calendar and manage appointments
- [ ] **ADMIN-05**: Admin/stylist UI follows same intuitive principles as customer-facing site

### UI/UX Design

- [ ] **UX-01**: Site follows "quiet luxury" aesthetic — understated elegance, generous white space, not cramped or generic
- [ ] **UX-02**: Monochromatic color palette with intentional accent colors (gold/metallic for premium feel)
- [ ] **UX-03**: Typography conveys salon personality — confident, modern, not template-default
- [ ] **UX-04**: WCAG 2.2 AA compliant — 4.5:1 contrast ratio, 24x24px minimum touch targets
- [ ] **UX-05**: Full keyboard navigation with logical focus order and visible focus indicators
- [ ] **UX-06**: Plain language throughout — no jargon, clear calls-to-action
- [ ] **UX-07**: Consistent, predictable layouts — same patterns across pages, intuitive navigation
- [ ] **UX-08**: Smooth animations (500-800ms) with easing — luxury feel, not jarring
- [ ] **UX-09**: All interactive elements have clear visual feedback (hover, active, disabled states)
- [ ] **UX-10**: Booking flow is frictionless — minimal steps, progress indication, no dead ends

### SEO

- [ ] **SEO-01**: Site is fully mobile-responsive (mobile-first design)
- [ ] **SEO-02**: LocalBusiness schema markup with accurate NAP data
- [ ] **SEO-03**: Core Web Vitals optimized (LCP, FID, CLS targets met)
- [ ] **SEO-04**: Google Business Profile integration configured

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Gift Cards

- **GIFT-01**: Customer can purchase digital gift cards
- **GIFT-02**: Gift cards can be redeemed during booking/payment
- **GIFT-03**: Partial redemption with remaining balance tracked

### Loyalty

- **LOYAL-01**: Customer earns points per dollar spent
- **LOYAL-02**: Customer can redeem points for discounts
- **LOYAL-03**: Customer can view points balance

### Automation

- **AUTO-01**: Waitlist automatically notifies when slot opens
- **AUTO-02**: Review request sent 24 hours after appointment

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time chat | Complexity without value; phone/SMS works for salon |
| Mobile native app | Web responsive covers use cases; 90% won't download app |
| Inventory management | Owner doesn't need product tracking; booth rental model |
| Payroll/commission tracking | Stylists handle own finances; booth rental model |
| AI features | Adds complexity without clear salon value |
| Multi-location support | Single location; unnecessary abstraction |
| Online product sales | Requires inventory (out of scope), shipping, tax handling |
| Dynamic pricing | Complexity without demand; fixed pricing expected for salons |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BOOK-01 | 3 | Pending |
| BOOK-02 | 3 | Pending |
| BOOK-03 | 3 | Pending |
| BOOK-04 | 3 | Pending |
| BOOK-05 | 3 | Pending |
| BOOK-06 | 3 | Pending |
| BOOK-07 | 6 | Pending |
| BOOK-08 | 3 | Pending |
| PAY-01 | 4 | Pending |
| PAY-02 | 4 | Pending |
| PAY-03 | 4 | Pending |
| PAY-04 | 4 | Pending |
| STAFF-01 | 2 | Pending |
| STAFF-02 | 2 | Pending |
| STAFF-03 | 2 | Pending |
| STAFF-04 | 2 | Pending |
| STAFF-05 | 2 | Pending |
| NOTIF-01 | 5 | Pending |
| NOTIF-02 | 5 | Pending |
| NOTIF-03 | 5 | Pending |
| NOTIF-04 | 5 | Pending |
| NOTIF-05 | 5 | Pending |
| CONT-01 | 2 | Pending |
| CONT-02 | 2 | Pending |
| CONT-03 | 2 | Pending |
| CONT-04 | 2 | Pending |
| CONT-05 | 2 | Pending |
| ADMIN-01 | 7 | Pending |
| ADMIN-02 | 7 | Pending |
| ADMIN-03 | 7 | Pending |
| ADMIN-04 | 7 | Pending |
| ADMIN-05 | 7 | Pending |
| UX-01 | 1 | Pending |
| UX-02 | 1 | Pending |
| UX-03 | 1 | Pending |
| UX-04 | 1 | Pending |
| UX-05 | 1 | Pending |
| UX-06 | 1 | Pending |
| UX-07 | 1 | Pending |
| UX-08 | 1 | Pending |
| UX-09 | 1 | Pending |
| UX-10 | 1 | Pending |
| SEO-01 | 7 | Pending |
| SEO-02 | 7 | Pending |
| SEO-03 | 7 | Pending |
| SEO-04 | 7 | Pending |

**Coverage:**
- v1 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

**By Phase:**
| Phase | Requirements | Count |
|-------|--------------|-------|
| 1. Foundation | UX-01 through UX-10 | 10 |
| 2. Staff-Services-Content | STAFF-01 through STAFF-05, CONT-01 through CONT-05 | 10 |
| 3. Booking-Engine | BOOK-01 through BOOK-06, BOOK-08 | 7 |
| 4. Payments | PAY-01 through PAY-04 | 4 |
| 5. Notifications | NOTIF-01 through NOTIF-05 | 5 |
| 6. Calendar-Sync | BOOK-07 | 1 |
| 7. Admin-SEO-Launch | ADMIN-01 through ADMIN-05, SEO-01 through SEO-04 | 9 |

---
*Requirements defined: 2025-01-19*
*Last updated: 2026-01-20 after roadmap creation*
