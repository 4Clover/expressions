# Pitfalls Research

**Domain:** Hair salon website with booking system
**Researched:** 2026-01-20
**Confidence:** HIGH (verified with official docs, cross-referenced multiple sources)

## Critical Pitfalls

These mistakes cause rewrites, data loss, or business-critical failures.

### Pitfall 1: Race Conditions in Booking Slot Selection

**What goes wrong:** Two customers simultaneously book the same time slot. Both receive confirmation emails. One customer arrives to find their appointment doesn't exist. Business reputation damaged.

**Why it happens:**
- Read-modify-write cycle without proper locking
- Checking availability and creating booking are separate operations
- Frontend shows stale availability data (cached or delayed API response)
- Optimistic UI updates without server confirmation

**How to avoid:**
- Implement optimistic locking with version columns in PostgreSQL
- Use `UPDATE ... WHERE version = $expected RETURNING *` pattern
- If 0 rows returned, another booking occurred — retry with fresh data
- Clear frontend cache immediately after any booking operation
- Use WebSocket or polling to update availability in near-real-time

```sql
-- Correct pattern
UPDATE time_slots
SET status = 'booked', customer_id = $1, version = version + 1
WHERE id = $2 AND version = $3 AND status = 'available'
RETURNING *;
-- Check rows affected before confirming
```

**Warning signs:**
- Test concurrent booking scenarios show both succeed
- Customer complaints about "ghost bookings"
- Database has two bookings for same slot

**Phase to address:** Phase 1 (core booking infrastructure)

---

### Pitfall 2: Supabase RLS Disabled or Misconfigured

**What goes wrong:** Customer A can see Customer B's appointments, contact info, or payment history. Major privacy violation. Potential legal liability.

**Why it happens:**
- RLS is disabled by default when creating tables
- Developers prototype without RLS, forget to enable before launch
- Overly broad policies (`USING (true)` allows all access)
- Missing SELECT policy breaks UPDATE operations
- Views bypass RLS by default (security definer context)

**How to avoid:**
- Enable RLS on EVERY table from day one, not "later"
- Create restrictive policies first, expand as needed
- Test RLS by connecting as different user roles
- Use `(select auth.uid())` instead of `auth.uid()` for performance
- Never expose `service_role` key to client code

```sql
-- Enable RLS immediately after table creation
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Customer sees only their own appointments
CREATE POLICY "customers_own_appointments" ON appointments
  FOR SELECT USING (customer_id = (select auth.uid()));

-- Stylist sees their assigned appointments
CREATE POLICY "stylists_assigned_appointments" ON appointments
  FOR SELECT USING (stylist_id = (select auth.uid()));
```

**Warning signs:**
- Can query other users' data from browser console
- RLS policies not in migration files
- Using `service_role` key in frontend

**Phase to address:** Phase 1 (database setup)

---

### Pitfall 3: Timezone Handling Corruption

**What goes wrong:** Customer books "10:00 AM" expecting local time. Appointment is stored as UTC. Display shows different time. Reminders go out at wrong time. Customer arrives 2+ hours early or late.

**Why it happens:**
- Storing times without timezone context
- Converting timezones inconsistently between client/server/database
- Google Calendar sync using different timezone than booking system
- Daylight Saving Time transitions not handled
- JavaScript `Date` object timezone confusion

**How to avoid:**
- Store ALL times in UTC with IANA timezone name
- Convert to local time only at display layer
- Store customer's timezone preference at booking time
- Test booking flows around DST transitions (March, November)
- Use `@internationalized/date` for consistent handling

```typescript
interface Appointment {
  startTime: Date;      // UTC
  endTime: Date;        // UTC
  timezone: string;     // IANA e.g., 'America/New_York'
}

// Display: convert UTC to customer's timezone
const displayTime = new Intl.DateTimeFormat('en-US', {
  timeZone: appointment.timezone,
  hour: 'numeric',
  minute: '2-digit'
}).format(appointment.startTime);
```

**Warning signs:**
- Appointments appear at wrong times in Google Calendar
- Customers complain about "wrong time" in confirmations
- Issues spike in March/November (DST)

**Phase to address:** Phase 1 (booking data model), Phase 2 (Google Calendar sync)

---

### Pitfall 4: Google Calendar Sync Conflicts Not Handled

**What goes wrong:** Stylist blocks time in Google Calendar. Booking system doesn't see it. Customer books during blocked time. Stylist can't take the appointment.

**Why it happens:**
- One-way sync (booking -> calendar) instead of bi-directional
- Sync frequency too low (changes not detected in time)
- Conflict detection missing between systems
- Timezone mismatch between Google Calendar and booking system
- Not handling Google Calendar API rate limits

**How to avoid:**
- Implement bi-directional sync with proper conflict detection
- Check Google Calendar availability before confirming booking
- Use webhook notifications for real-time updates when possible
- Handle sync conflicts by flagging for manual resolution
- Store sync state to prevent duplicate events

**Warning signs:**
- Google Calendar shows events not in booking system (or vice versa)
- Stylists report "double-booked" despite booking system showing single
- Events created with wrong times

**Phase to address:** Phase 3 (Google Calendar integration)

---

### Pitfall 5: Svelte 4 -> 5 Migration Breaks Reactivity

**What goes wrong:** Ported code from Picasso-Hair-Salon stops being reactive. State updates don't trigger re-renders. Booking wizard shows stale data. Forms don't validate properly.

**Why it happens:**
- `let` declarations are no longer implicitly reactive (must use `$state`)
- `$:` reactive statements replaced with `$derived` and `$effect`
- `onMount` replaced with `$effect` incorrectly (different behavior)
- Component instantiation changed (classes -> functions)
- `beforeUpdate`/`afterUpdate` migration requires manual refactoring

**How to avoid:**
- Run `npx sv migrate svelte-5` for automated conversion
- Convert one component at a time, test after each
- Use `$derived` for 90% of computed values (not `$effect`)
- Keep `onMount` for one-time initialization (don't replace with `$effect`)
- Use `mount()` or `hydrate()` instead of `new Component()`

```typescript
// OLD (Svelte 4)
let count = 0;
$: doubled = count * 2;

// NEW (Svelte 5)
let count = $state(0);
let doubled = $derived(count * 2);
```

**Warning signs:**
- Components don't update when state changes
- "X is not a function" errors on component instantiation
- `$:` statements not running

**Phase to address:** Phase 1 (code migration from Picasso repo)

---

### Pitfall 6: Square API Duplicate Customers and Payments

**What goes wrong:** Same customer exists multiple times in Square. Payment attributed to wrong customer profile. Reports show incorrect data. Card-on-file payments fail.

**Why it happens:**
- Not searching for existing customer before creating new record
- Missing idempotency keys on payment creation
- Using email/phone match instead of explicit `customer_id`
- Not handling Square's automatic customer creation from payments

**How to avoid:**
- Always search for existing customer by email AND phone before creating
- Use idempotency keys on all create operations
- Include `customer_id` in all CreatePayment requests
- Implement duplicate merge functionality
- Store Square customer ID in your database

```typescript
// Correct pattern
async function getOrCreateSquareCustomer(email: string, phone: string) {
  // Search first
  const existing = await squareClient.customersApi.searchCustomers({
    query: {
      filter: {
        emailAddress: { exact: email },
        phoneNumber: { exact: phone }
      }
    }
  });

  if (existing.customers?.length) {
    return existing.customers[0];
  }

  // Create with idempotency key
  return squareClient.customersApi.createCustomer({
    idempotencyKey: `${email}-${Date.now()}`,
    emailAddress: email,
    phoneNumber: phone
  });
}
```

**Warning signs:**
- Customer search returns multiple records for same person
- Payment history incomplete for some customers
- Card-on-file charges fail with "customer not found"

**Phase to address:** Phase 2 (Square integration)

---

### Pitfall 7: No-Show Fee Chargebacks

**What goes wrong:** Customer no-shows. You charge the stored card. Customer disputes charge. Bank rules in customer's favor. You lose the fee PLUS $15 dispute fee. Repeat offenders exploit this.

**Why it happens:**
- Cancellation policy not clearly disclosed before booking
- Policy not acknowledged in writing (checkbox, signature)
- Fee exceeds "reasonable" amount (100% of service cost)
- No evidence trail (reminders, communications)
- Charging without notification

**How to avoid:**
- Display cancellation policy prominently during booking
- Require explicit acknowledgment (checkbox + timestamp stored)
- Set fees at reasonable percentage (50% typical, not 100%)
- Send reminder with cancellation policy 24-48 hours before
- Document all customer communications
- Send notification before charging no-show fee

**Warning signs:**
- High chargeback rate on no-show fees
- Customer complaints about "hidden" fees
- No record of policy acceptance

**Phase to address:** Phase 2 (payment integration), Phase 4 (notifications)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip RLS during prototyping | Faster initial development | Security breach, privacy violation, major rewrite | Never in production; use staging-only skip |
| Hardcode stylist pricing | Avoid database complexity | Can't support stylist-specific pricing, schema migration needed | Only if TRULY all stylists have identical pricing forever |
| Single timezone assumption | Simpler date handling | Breaks for traveling customers, DST issues | Only if business operates in single timezone AND customers are local |
| Store payment cards locally | Avoid Square complexity | PCI compliance violation, security liability | Never — always use Square tokenization |
| Skip booking confirmation emails | Faster MVP | Customer uncertainty, more support calls, no-shows | Never for production |
| Polling instead of optimistic locking | Simpler concurrency | Race conditions under load, double bookings | Only for very low traffic (< 10 bookings/day) |
| Manual appointment reminders | Avoid scheduled job complexity | Inconsistent reminders, increased no-shows | Only for first 1-2 weeks testing |

---

## Integration Gotchas

### Square

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Reader SDK deprecated** | Build fails after Dec 2025 | Migrate to Mobile Payments SDK immediately |
| **`cards` field retired** | Customer card data missing | Use ListCards API with `customer_id` query param |
| **Webhook retry changes** | Missed webhooks | Max 11 retries over 24 hours (new schedule) |
| **Rate limiting** | 429 errors on bulk operations | Use batch endpoints, implement queue system |
| **Sandbox vs Production keys** | Auth errors | Verify environment matches API keys |
| **Partial auth with tips** | Gift card payments fail | Don't combine `accept_partial_authorization` with `tip_money` |

### Supabase

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **RLS disabled by default** | All data exposed | Enable RLS immediately on table creation |
| **`auth.uid()` performance** | Slow queries with RLS | Use `(select auth.uid())` wrapper |
| **Views bypass RLS** | Security hole | Create views with `security_invoker = true` |
| **getSession() not verified** | Fake JWTs accepted | Always use `auth.getUser()` on server |
| **Auth in layout.server.ts** | Routes unprotected | Protect each route individually |

### Storyblok

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Over-complex components** | Content editors overwhelmed | Keep components simple, avoid CSS fields |
| **Multi-space confusion** | Accidentally modify production | Use separate develop/staging/production spaces |
| **Missing editable props** | Can't click to edit in visual editor | Pass `StoryblokEditable` props to all sub-blocks |
| **Treating as database** | Performance issues | Use Storyblok for content, not transactional data |

### Google Calendar

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Timezone mismatch** | Events at wrong times | Always specify IANA timezone, test with different zones |
| **One-way sync only** | External events not blocked | Implement bi-directional sync with conflict detection |
| **Rate limits exceeded** | Sync failures | Batch operations, implement exponential backoff |
| **Recurring event timezone** | Inconsistent times | Single timezone required for recurring events |

### Resend (Email)

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Domain mismatch** | Spam filtering | Ensure URLs in email match sending domain |
| **No delivery tracking** | Unknown delivery status | Check Deliverability Insights, monitor bounce rates |
| **Subdomain reputation** | Main domain affected | Use subdomain like `updates.yourdomain.com` |

### Plivo (SMS)

| Issue | Symptom | Prevention |
|-------|---------|------------|
| **Carrier filtering** | Messages not delivered | Clean phone numbers, avoid spam-like content |
| **Invalid numbers** | High bounce rate | Validate phone numbers before sending |
| **Character limits** | Messages truncated | Keep under 160 chars or handle multi-part properly |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **N+1 queries for availability** | Slow calendar load | Batch query all slots for date range | > 5 stylists displayed |
| **Unbatched notification sends** | Slow confirmation, timeouts | Queue notifications, send async | > 10 concurrent bookings |
| **Complex RLS policies** | All queries slow | Index RLS columns, use `EXPLAIN ANALYZE` | > 1000 appointments |
| **Unoptimized images** | Slow page load, poor Core Web Vitals | Use Cloudflare Images, lazy load gallery | > 20 images on page |
| **Blocking email/SMS in request** | User waits for send | Move to background job | Any email/SMS send |
| **Full table scans for search** | Slow service/stylist lookup | Add indexes on searchable columns | > 50 services or stylists |
| **Storyblok uncached** | Slow page loads | Cache CMS responses, use ISR | Every page load |

---

## Security Mistakes

### Booking-Specific

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Exposing appointment IDs sequentially** | Enumeration attack reveals booking volume | Use UUIDs or random IDs |
| **No rate limiting on booking endpoint** | Bot spam creates fake bookings | Implement rate limiting, CAPTCHA for high volume |
| **Customer data in URL params** | Logged in server logs, browser history | Use POST body, not query params |
| **Appointment details without auth** | Privacy violation | Require authentication for all appointment views |

### Payment-Specific

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Storing card numbers** | PCI violation, liability | Use Square hosted fields only |
| **Service role key in frontend** | Full database access | Keep service role server-side only |
| **Missing HTTPS** | Payment data intercepted | Force HTTPS everywhere |
| **Logging payment data** | Compliance violation | Sanitize logs, never log card/CVV |
| **No CSRF protection on payment forms** | Fraudulent payments | Use SvelteKit form actions with CSRF |

---

## UX Pitfalls

### Booking Flow

| Mistake | User Impact | Prevention |
|---------|-------------|------------|
| **No loading states during availability check** | User clicks repeatedly, creates confusion | Show skeleton or spinner immediately |
| **Confirmation email only (no SMS)** | Missed appointments, no-shows | Send both email AND SMS confirmation |
| **Calendar shows unavailable slots** | User frustration clicking blocked times | Only display bookable slots |
| **No buffer time between appointments** | Rushed stylists, delays cascade | Auto-add 15-min buffer (configurable) |
| **Forcing account creation** | Booking abandonment | Allow guest booking, offer account after |
| **Complex multi-step wizard** | Abandonment increases with each step | Minimize steps, show progress clearly |

### Admin (Owner) Interface

| Mistake | User Impact | Prevention |
|---------|-------------|------------|
| **Technical terminology** | Owner confused by "RLS", "webhook" | Use business language: "Who can see this" |
| **Storyblok CSS fields** | Owner doesn't know CSS | Pre-designed components only, no CSS exposure |
| **Complex analytics dashboards** | Information overload | Show 3-5 key metrics, hide rest behind "Details" |
| **No mobile admin** | Can't check schedule on phone | Ensure admin is fully responsive |

---

## "Looks Done But Isn't" Checklist

Things that appear complete in demo but are missing critical pieces.

### Booking System
- [ ] Concurrent booking test (two users, same slot)
- [ ] Timezone display matches user's local time
- [ ] Buffer time between appointments enforced
- [ ] Overlapping service durations handled
- [ ] Stylist time-off blocks respected
- [ ] Business hours enforced (no 3 AM bookings)
- [ ] Holiday closures handled

### Notifications
- [ ] SMS sent, not just logged to console
- [ ] Email lands in inbox, not spam
- [ ] Reminder timing accounts for timezone
- [ ] Unsubscribe/opt-out working
- [ ] Failed send retry logic implemented

### Payments
- [ ] Refund flow tested end-to-end
- [ ] Deposit charged, not just authorized
- [ ] No-show fee actually charges card
- [ ] Multiple payment methods per stylist display correctly
- [ ] Square webhook handlers deployed

### CMS
- [ ] Owner can edit without developer help
- [ ] Changes appear on live site (cache invalidation)
- [ ] Images optimized before display
- [ ] Preview mode works for unpublished content

### SEO
- [ ] Structured data validates (Schema.org testing tool)
- [ ] Meta tags render server-side (view source, not inspect)
- [ ] Google Search Console connected
- [ ] Google Business Profile linked

### Security
- [ ] RLS policies tested with different user roles
- [ ] Rate limiting active on booking endpoint
- [ ] HTTPS forced everywhere
- [ ] No sensitive data in browser console

---

## Recovery Strategies

When pitfalls occur despite prevention.

### Double Booking Occurred
1. Contact both customers immediately
2. Offer one customer alternative time with compensation (free add-on service)
3. Document incident for process improvement
4. Implement or fix optimistic locking
5. Add Playwright test for concurrent booking scenario

### Data Exposed Due to RLS Misconfiguration
1. Assess scope of exposure (how many records, how long)
2. Revoke all access tokens, force re-authentication
3. Enable and verify RLS policies immediately
4. Notify affected customers if required by law
5. Conduct security audit of all tables

### Timezone Confusion Caused Wrong Appointment Times
1. Contact affected customers immediately
2. Offer rescheduling with priority slots
3. Audit all stored appointments for timezone issues
4. Fix timezone handling in codebase
5. Backfill timezone data where missing

### Chargeback Lost on No-Show Fee
1. Review evidence submission process
2. Strengthen policy disclosure (add checkbox, confirmation email)
3. For repeat offenders, require upfront deposit
4. Consider reducing fee amount if consistently losing disputes
5. Document all communications in database

### Square Customer Duplicates Created
1. Use Square's merge customer feature
2. Update local database references
3. Implement search-before-create pattern
4. Add idempotency keys to all create operations

### Svelte Migration Broke Production
1. Revert to last working commit
2. Run full test suite to identify failing tests
3. Migrate one component at a time with tests
4. Use Svelte 5 backward compatibility mode for problematic components
5. Deploy to staging before production

---

## Pitfall-to-Phase Mapping

| Pitfall | Severity | Recommended Phase |
|---------|----------|-------------------|
| Race conditions (double booking) | CRITICAL | Phase 1 - Core booking |
| Supabase RLS misconfiguration | CRITICAL | Phase 1 - Database setup |
| Timezone corruption | CRITICAL | Phase 1 - Data model |
| Svelte 4 -> 5 migration | HIGH | Phase 1 - Code migration |
| Google Calendar sync conflicts | HIGH | Phase 3 - Calendar integration |
| Square duplicate customers | HIGH | Phase 2 - Payment integration |
| No-show fee chargebacks | MEDIUM | Phase 2 - Payments + Phase 4 - Notifications |
| Email/SMS deliverability | MEDIUM | Phase 4 - Notifications |
| Storyblok complexity | MEDIUM | Phase 5 - CMS setup |
| SEO structured data | MEDIUM | Phase 6 - SEO optimization |
| Performance under load | MEDIUM | Phase 7 - Performance testing |

---

## Phase-Specific Research Flags

Based on this pitfall analysis, certain phases likely need deeper research before execution:

| Phase | Research Needed | Reason |
|-------|-----------------|--------|
| **Phase 1: Database/Booking** | Verify optimistic locking pattern with Drizzle | Drizzle-specific syntax may differ from raw SQL examples |
| **Phase 2: Square** | Confirm 2026 API version requirements | Multiple deprecations noted for 2025 |
| **Phase 3: Google Calendar** | Investigate webhook setup for real-time sync | Rate limits may affect polling approach |
| **Phase 4: Notifications** | Test Plivo deliverability in target region | Carrier filtering varies by region |
| **Phase 5: Storyblok** | Design component schema before build | Changes harder after content exists |
| **Phase 6: SEO** | Verify HairSalon schema with testing tool | Schema.org changes occasionally |

---

## Sources

### Race Conditions & Concurrency
- [HackerNoon: How to Solve Race Conditions in a Booking System](https://hackernoon.com/how-to-solve-race-conditions-in-a-booking-system)
- [Medium: Debugging Real-Time Bookings - Race Conditions and Double Bookings](https://medium.com/@get2vikasjha/debugging-real-time-bookings-fixing-hidden-race-conditions-cache-issues-and-double-bookings-98328bc52192)
- [PostgreSQL: Concurrency Control Documentation](https://www.postgresql.org/docs/current/mvcc.html)
- [EnterpriseDB: PostgreSQL Anti-patterns - Read-Modify-Write Cycles](https://www.enterprisedb.com/blog/postgresql-anti-patterns-read-modify-write-cycles)

### Supabase RLS
- [Supabase: Row Level Security Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Securing Your API](https://supabase.com/docs/guides/api/securing-your-api)
- [ProsperaSoft: Fixing RLS Misconfigurations in Supabase](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/)
- [Leanware: Best Practices for Supabase](https://www.leanware.co/insights/supabase-best-practices)

### Svelte 5 Migration
- [Svelte: v5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte: Migrating to SvelteKit 2](https://svelte.dev/docs/kit/migrating-to-sveltekit-2)
- [GitHub Discussion: Experiences and Caveats of Svelte 5 Migration](https://github.com/sveltejs/svelte/discussions/14131)

### Square API
- [Square: Checkout API Common Pitfalls](https://developer.squareup.com/docs/checkout-api/common-pitfalls?preview=true)
- [Square: Customer API Best Practices](https://developer.squareup.com/docs/customers-api/best-practices)
- [Square: Handling Errors](https://developer.squareup.com/docs/build-basics/general-considerations/handling-errors)
- [Square: 2025-01-23 Changelog](https://developer.squareup.com/docs/changelog/connect-logs/2025-01-23)

### Calendar & Timezone
- [Google Calendar API: Events and Calendars](https://developers.google.com/workspace/calendar/api/concepts/events-calendars)
- [Cal.com: How Calendar Syncing Prevents Double Bookings](https://cal.com/blog/how-calendar-syncing-prevents-double-bookings-and-scheduling-conflicts)

### No-Show & Deposit Policies
- [FindLaw: Can Businesses Charge Appointment Deposits and Cancellation Fees?](https://www.findlaw.com/consumer/consumer-transactions/can-businesses-charge-appointment-deposits-and-cancellation-fees.html)
- [Square: Manage Booking Cancellations and Prepayment Policies](https://squareup.com/help/us/en/article/5493-set-a-custom-cancellation-policy-with-square-appointments)
- [Booksy: Crafting a No-Show Policy](https://biz.booksy.com/en-us/blog/no-show-policy-tips)

### Local SEO
- [Loganix: 20 Local SEO Tips that WORK in 2026](https://loganix.com/local-seo-tips/)
- [Localo: What Is Local SEO in 2025](https://localo.com/blog/local-seo)
- [Omnius: 15 Bad SEO Practices to Avoid in 2026](https://www.omnius.so/blog/bad-seo-practices)

### Storyblok
- [Rob Kendal: Top 5 Best Practices for Using Storyblok](https://robkendal.co.uk/blog/2024-12-21-storyblok-best-practices/)
- [Significa: Storyblok Best Practices](https://significa.co/blog/storyblok-best-practices)

### Email & SMS
- [Resend: Deliverability Insights](https://resend.com/docs/dashboard/emails/deliverability-insights)
- [Textla: 2025 Guide to SMS Marketing Metrics](https://www.textla.com/post/sms-marketing-metrics)
