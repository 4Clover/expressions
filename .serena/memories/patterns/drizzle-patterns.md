# Drizzle ORM Patterns - Quick Reference

## Queries
```typescript
import { db, users, services } from '@repo/db';
import { eq, and, or, desc } from 'drizzle-orm';

// Type-safe query with findFirst
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// ALWAYS handle undefined (noUncheckedIndexedAccess)
if (!user) {
  return json({ error: 'Not found' }, { status: 404 });
}
```

## Array Access
```typescript
// WRONG - fails with noUncheckedIndexedAccess
const first = items[0].name;

// CORRECT - handle undefined
const first = items[0];
if (first) { first.name; }

// OR with nullish coalescing
const value = items[0] ?? defaultValue;

// OR with optional chaining
const name = items[0]?.name;
```

## Schema Patterns
```typescript
import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Text for time columns (Drizzle time type quirks)
export const availability = pgTable('availability', {
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
});

// Prices in cents (avoid floating point)
export const services = pgTable('services', {
  priceCents: integer('price_cents').notNull(),
  depositAmountCents: integer('deposit_amount_cents'),
});
```

## RLS Policies
```typescript
import { sql } from 'drizzle-orm';
import { pgPolicy } from 'drizzle-orm/pg-core';

// Empty arrow function for sql`true` policies
export const publicReadPolicy = pgPolicy('public_read', {
  for: 'select',
  to: 'anon',
  using: sql`true`,
}).link(() => {});
```

## Supabase Transaction Pooler
```typescript
import postgres from 'postgres';

// prepare: false for Supabase transaction pooler
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});
```

## Insert with Returning
```typescript
const [newBooking] = await db.insert(bookings)
  .values({ clientName, serviceId, staffId, startTime })
  .returning();

// Handle undefined result
if (!newBooking) {
  throw error(500, 'Failed to create booking');
}
```
