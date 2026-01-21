# Phase 4: Payments - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable flexible payment options including Square online payment and per-stylist payment method display for the booth rental model. Each stylist configures their accepted methods; customers choose payment timing; deposit-required services enforce prepayment.

</domain>

<decisions>
## Implementation Decisions

### Stylist payment config
- Stylists configure their own payment methods via self-service login
- Supported methods: Venmo, Zelle, Cash, CashApp (structured fields, not free text)
- Each method includes a handle/identifier field for display

### Square model
- Claude's Discretion: Research Square's booth rental support and recommend approach
- Consider: Salon Square for deposits only (salon collects no-show deposits; stylists collect service payment via P2P) vs per-stylist Square optional
- Priority: Simplify bookkeeping for independent contractors (booth rental model)

### Customer payment UX
- Payment method choice available during booking AND after booking (both options)
- "Pay at salon" is the default — online payment available but not pushed
- Deposit requirement is service-based: admin marks specific services as deposit-required
- Deposit amount is configurable per service (not flat or percentage-based)

### Square checkout flow
- Claude's Discretion: Research and recommend redirect vs embedded form for SvelteKit
- On payment failure: Hold slot while customer retries (don't lose the booking)
- Card on file: Yes, save card via Square for faster future bookings

### Pay-at-salon display
- Payment methods shown with icons (Venmo icon + handle, Zelle icon + info, etc.)
- Confirmation email includes stylist's accepted payment methods
- Cash listed with ATM note: "Cash (ATM available nearby)" or similar
- Deep links: Tapping Venmo/CashApp opens app with prefilled recipient

</decisions>

<specifics>
## Specific Ideas

- Payment method handles should be clickable/tappable with deep links to payment apps
- Icons for each payment method type (brand recognition)
- Booth rental model means stylists are independent contractors — keep their finances separate from salon

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-payments*
*Context gathered: 2026-01-21*
