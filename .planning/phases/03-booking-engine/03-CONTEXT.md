# Phase 3: Booking-Engine - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable customers to book appointments online with real-time availability, slot selection, and the ability to cancel or reschedule. This phase delivers the core booking wizard, availability engine, and basic booking management.

**Demo Goal:** Client sees a polished, professional booking flow that demonstrates the full value proposition. Core happy path must feel complete — edge cases and advanced configuration can be simplified.

</domain>

<decisions>
## Implementation Decisions

### Booking Flow Structure
- **Service-first flow**: Customer picks service → stylist → date/time → confirm
- **"Any available" stylist option**: Shows first available slot across all qualified stylists
- **Guest booking**: No account required to book (email + phone collected at confirmation)
- **Single service per booking**: Multi-service booking deferred
- **Step-by-step wizard**: Clear progress indicator, one decision per screen on mobile

### Calendar & Slot Display
- **Week view first**: Show 7-day grid with available/unavailable indicators, tap day to see times
- **30-minute slot granularity**: Industry standard for salons
- **Morning/Afternoon/Evening groupings**: Visual organization of time slots
- **"Next available" shortcut**: Prominent button to jump to first open slot
- **Timezone handling**: Display in user's local time, store in UTC

### Stylist Selection
- **Photo + name + specialty tags**: Visual cards, not a dropdown
- **Availability indicator**: "Available today" / "Next: Thursday" badge
- **Price display**: Show if stylist has custom pricing for selected service
- **Filter by availability**: Option to hide stylists with no availability this week

### Confirmation Experience
- **Summary screen before submit**: Service, stylist, date/time, duration, price — all visible
- **Instant confirmation**: Show confirmation number + details immediately after booking
- **Email confirmation**: Sent automatically (Phase 5 builds the full system, but basic email for demo)
- **Add to calendar**: Download .ics file button

### Cancel/Reschedule (Simplified for Demo)
- **Cancel via link**: Unique link in confirmation email, no login required
- **Reschedule = cancel + rebook**: Simple flow for demo, direct reschedule deferred
- **24-hour policy**: Can't cancel within 24 hours of appointment (displayed but soft-enforced for demo)
- **Confirmation step**: "Are you sure?" before cancellation completes

### Deposit Handling (Minimal for Demo)
- **Deposit toggle OFF by default**: Owner can enable per-service later
- **UI ready but inactive**: "Deposit required" badge and flow exists, just not triggered
- **Placeholder for Square**: Integration point ready, actual payment in Phase 4

### Empty/Error States
- **No availability**: "No slots available this week. Try another stylist or check back soon."
- **Stylist unavailable**: Graceful message + suggestion to pick another
- **Booking conflict**: "This slot was just taken. Here are similar times:" + alternatives
- **Service loading**: Skeleton cards while fetching

### Claude's Discretion
- Animation timing and micro-interactions
- Exact mobile breakpoint behaviors
- Loading state implementations
- Form validation UX details
- Calendar navigation gestures

</decisions>

<specifics>
## Specific Ideas

- Flow should feel like Calendly or Acuity — modern, fast, no friction
- Mobile experience is primary — most salon bookings happen on phones
- "Quiet luxury" aesthetic continues from design system — not flashy, just elegant
- Confirmation should feel celebratory but not over-the-top (subtle success state)

</specifics>

<deferred>
## Deferred Ideas

**For Feature Completeness Discussion:**

### Booking Flow Enhancements
- Multiple services in one booking (hair + color + treatment)
- Add-on services during booking (deep conditioning, etc.)
- Recurring/standing appointments
- Waitlist for fully booked slots
- Preferred stylist memory (return customers)
- Service duration variants (short/medium/long hair pricing)

### Cancel/Reschedule Enhancements
- Direct reschedule flow (pick new time without canceling first)
- Reschedule limits (max 2 reschedules per booking)
- Late cancellation fees
- No-show tracking and policy enforcement
- Staff-initiated cancellations with customer notification

### Deposit & Payment Policy
- Per-service deposit amounts
- Per-stylist deposit requirements
- Deposit forfeiture rules and timing
- Partial deposit vs full prepayment options
- Refund policies for cancellations

### Availability & Scheduling
- Buffer time between appointments (cleanup time)
- Lunch break handling
- Custom availability overrides (vacation, sick days)
- Holiday schedules
- Walk-in availability indicator
- Real-time "someone is booking this slot" warnings

### Customer Experience
- Account creation for repeat customers
- Booking history view
- Favorite stylists
- Service recommendations based on history
- Notes to stylist field
- Accessibility accommodations field

### Staff Features
- Staff-side booking creation
- Block time for personal appointments
- Overbooking rules
- Commission tracking hooks

</deferred>

---

*Phase: 03-booking-engine*
*Context gathered: 2026-01-21*
