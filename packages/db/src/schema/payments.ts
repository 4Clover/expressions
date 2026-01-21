import { pgTable, pgPolicy, pgEnum, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase';
import { staff } from './staff.js';
import { appointments } from './appointments.js';

// Payment method type enum for P2P payments
export const paymentMethodTypeEnum = pgEnum('payment_method_type', ['venmo', 'cashapp', 'zelle', 'cash']);

// Staff payment methods (P2P: Venmo, CashApp, Zelle, Cash)
export const staffPaymentMethods = pgTable('staff_payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  methodType: paymentMethodTypeEnum('method_type').notNull(),
  handle: text('handle'), // @username for Venmo/CashApp, email for Zelle, null for cash
  displayName: text('display_name'), // Optional custom label like "Jane's Venmo"
  isEnabled: boolean('is_enabled').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  pgPolicy('public can view enabled payment methods', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`${table.isEnabled} = true`,
  }),
  pgPolicy('authenticated can manage own payment methods', {
    for: 'all',
    to: authenticatedRole,
    using: sql`true`, // Full management for authenticated staff
  }),
]);

// Staff Square OAuth config (encrypted tokens)
// NOTE: Encrypt at rest in production via Supabase Vault
export const staffSquareConfig = pgTable('staff_square_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().unique().references(() => staff.id),
  merchantId: text('merchant_id').notNull(),
  locationId: text('location_id').notNull(),
  accessToken: text('access_token').notNull(), // Encrypt at rest in production
  refreshToken: text('refresh_token').notNull(), // Encrypt at rest in production
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('staff can view own square config', {
    for: 'select',
    to: authenticatedRole,
    using: sql`true`, // Authenticated users can view (filter by staffId in queries)
  }),
]);

// Payment records for tracking appointment payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id),
  squarePaymentId: text('square_payment_id').unique(), // Nullable for pay-at-salon
  squareOrderId: text('square_order_id'), // Nullable
  amountCents: integer('amount_cents').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'refunded'
  paymentMethod: text('payment_method').notNull(), // 'square', 'pay_at_salon'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }), // Nullable
}, () => [
  pgPolicy('authenticated can manage payments', {
    for: 'all',
    to: authenticatedRole,
    using: sql`true`,
  }),
]);

// Webhook event tracking for idempotency
// Service role only - no public/anon access
export const processedWebhooks = pgTable('processed_webhooks', {
  eventId: text('event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  // No RLS policies for public/anon - service role only
]);

// Drizzle relations for eager loading
export const staffPaymentMethodsRelations = relations(staffPaymentMethods, ({ one }) => ({
  staff: one(staff, {
    fields: [staffPaymentMethods.staffId],
    references: [staff.id],
  }),
}));

export const staffSquareConfigRelations = relations(staffSquareConfig, ({ one }) => ({
  staff: one(staff, {
    fields: [staffSquareConfig.staffId],
    references: [staff.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
}));
