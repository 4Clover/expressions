import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { staff } from './staff.js';

// Price type enum: fixed price, starting-from price, or range
export const priceTypeEnum = pgEnum('price_type', ['fixed', 'starting', 'range']);

export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => serviceCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceType: priceTypeEnum('price_type').notNull().default('fixed'),
  priceMin: integer('price_min').notNull(), // Price in cents
  priceMax: integer('price_max'), // Nullable for fixed/starting prices
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Junction table for per-stylist pricing
export const staffServices = pgTable('staff_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  customPrice: integer('custom_price'), // Nullable - use service price if null
  isAvailable: boolean('is_available').notNull().default(true),
});
