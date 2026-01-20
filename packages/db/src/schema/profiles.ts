import { pgTable, uuid, text, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { sql } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  pgPolicy('users can view own profile', {
    for: 'select',
    to: authenticatedRole,
    using: sql`auth.uid() = ${table.userId}`,
  }),
  pgPolicy('users can update own profile', {
    for: 'update',
    to: authenticatedRole,
    using: sql`auth.uid() = ${table.userId}`,
  }),
]);
