/**
 * Seed script for demo data - staff schedules and sample appointments
 *
 * Run with: npx tsx packages/db/scripts/seed.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import {
  staff,
  staffSchedule,
  appointments,
  services,
  serviceCategories,
  staffPaymentMethods,
} from '../src/schema/index.js';
import { nanoid } from 'nanoid';
import { ilike } from 'drizzle-orm';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL not set - skipping seed');
  process.exit(0);
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle({ client });

// Schedule templates
const WEEKDAY_SCHEDULE = { startTime: '09:00', endTime: '18:00' }; // Mon-Fri
const SATURDAY_SCHEDULE = { startTime: '09:00', endTime: '16:00' }; // Saturday
// Sunday is closed (no entry)

async function seedStaffSchedules() {
  console.log('Seeding staff schedules...');

  // Get all active staff
  const staffMembers = await db.select().from(staff).where(eq(staff.isActive, true));

  if (staffMembers.length === 0) {
    console.log('  No active staff found - run staff seed first');
    return [];
  }

  const insertedSchedules: string[] = [];

  for (const member of staffMembers) {
    console.log(`  Creating schedule for ${member.displayName}...`);

    // Monday through Friday (weekday 1-5)
    for (let weekday = 1; weekday <= 5; weekday++) {
      try {
        await db
          .insert(staffSchedule)
          .values({
            staffId: member.id,
            weekday,
            startTime: WEEKDAY_SCHEDULE.startTime,
            endTime: WEEKDAY_SCHEDULE.endTime,
            isActive: true,
          })
          .onConflictDoNothing();
        insertedSchedules.push(`${member.displayName} - weekday ${weekday}`);
      } catch (e) {
        // Unique constraint violation - schedule already exists
      }
    }

    // Saturday (weekday 6)
    try {
      await db
        .insert(staffSchedule)
        .values({
          staffId: member.id,
          weekday: 6,
          startTime: SATURDAY_SCHEDULE.startTime,
          endTime: SATURDAY_SCHEDULE.endTime,
          isActive: true,
        })
        .onConflictDoNothing();
      insertedSchedules.push(`${member.displayName} - Saturday`);
    } catch (e) {
      // Unique constraint violation
    }

    // Sunday (weekday 0) - explicitly closed (isActive: false)
    try {
      await db
        .insert(staffSchedule)
        .values({
          staffId: member.id,
          weekday: 0,
          startTime: '00:00',
          endTime: '00:00',
          isActive: false,
        })
        .onConflictDoNothing();
      insertedSchedules.push(`${member.displayName} - Sunday (closed)`);
    } catch (e) {
      // Unique constraint violation
    }
  }

  console.log(`  Inserted/skipped ${insertedSchedules.length} schedule entries`);
  return insertedSchedules;
}

async function seedSampleAppointments() {
  console.log('Seeding sample appointments...');

  // Get first active staff and service for demo appointments
  const [firstStaff] = await db.select().from(staff).where(eq(staff.isActive, true)).limit(1);
  const [firstService] = await db.select().from(services).where(eq(services.isActive, true)).limit(1);

  if (!firstStaff || !firstService) {
    console.log('  No staff or services found - skipping sample appointments');
    return [];
  }

  const insertedAppointments: string[] = [];

  // Create a confirmed appointment for tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + firstService.durationMinutes);

  try {
    const [confirmedAppt] = await db
      .insert(appointments)
      .values({
        staffId: firstStaff.id,
        serviceId: firstService.id,
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: 'confirmed',
        customerName: 'Demo Customer',
        customerEmail: 'demo@example.com',
        customerPhone: '555-0100',
        cancelToken: nanoid(),
      })
      .onConflictDoNothing()
      .returning({ id: appointments.id });

    if (confirmedAppt) {
      insertedAppointments.push(`Confirmed: ${tomorrow.toISOString()}`);
      console.log(`  Created confirmed appointment for ${tomorrow.toDateString()} at 10:00 AM`);
    }
  } catch (e) {
    console.log('  Sample appointment already exists or error:', e);
  }

  // Create a cancelled appointment for day after tomorrow at 2:00 PM
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 0, 0, 0);

  const dayAfterEnd = new Date(dayAfter);
  dayAfterEnd.setMinutes(dayAfterEnd.getMinutes() + firstService.durationMinutes);

  try {
    const [cancelledAppt] = await db
      .insert(appointments)
      .values({
        staffId: firstStaff.id,
        serviceId: firstService.id,
        startTime: dayAfter,
        endTime: dayAfterEnd,
        status: 'cancelled',
        customerName: 'Cancelled Customer',
        customerEmail: 'cancelled@example.com',
        cancelToken: nanoid(),
        cancelledAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({ id: appointments.id });

    if (cancelledAppt) {
      insertedAppointments.push(`Cancelled: ${dayAfter.toISOString()}`);
      console.log(`  Created cancelled appointment for ${dayAfter.toDateString()} at 2:00 PM`);
    }
  } catch (e) {
    console.log('  Sample cancelled appointment already exists or error:', e);
  }

  console.log(`  Inserted ${insertedAppointments.length} sample appointments`);
  return insertedAppointments;
}

async function seedPaymentMethods() {
  console.log('Seeding payment methods...');

  // Get all active staff
  const staffMembers = await db.select().from(staff).where(eq(staff.isActive, true));

  if (staffMembers.length === 0) {
    console.log('  No active staff found - skipping payment methods');
    return [];
  }

  const insertedMethods: string[] = [];

  // Define payment methods for test data
  // Will match staff by displayName (case-insensitive partial match)
  const paymentConfig: Record<string, Array<{ methodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'; handle?: string }>> = {
    'Jane': [
      { methodType: 'venmo', handle: '@jane-stylist' },
      { methodType: 'cash' },
    ],
    'John': [
      { methodType: 'venmo', handle: '@john-cuts' },
      { methodType: 'zelle', handle: 'john@email.com' },
      { methodType: 'cashapp', handle: '$JohnCuts' },
    ],
    'Maria': [
      { methodType: 'cash' },
    ],
  };

  for (const member of staffMembers) {
    // Find matching config by first name
    const firstName = member.displayName.split(' ')[0];
    const methods = paymentConfig[firstName];

    if (!methods) {
      console.log(`  No payment config for ${member.displayName} - skipping`);
      continue;
    }

    console.log(`  Creating payment methods for ${member.displayName}...`);

    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      try {
        await db
          .insert(staffPaymentMethods)
          .values({
            staffId: member.id,
            methodType: method.methodType,
            handle: method.handle || null,
            isEnabled: true,
            displayOrder: i,
          })
          .onConflictDoNothing();
        insertedMethods.push(`${member.displayName} - ${method.methodType}`);
      } catch (e) {
        // Already exists or error
      }
    }
  }

  console.log(`  Inserted/skipped ${insertedMethods.length} payment method entries`);
  return insertedMethods;
}

async function seedDepositRequiredServices() {
  console.log('Seeding deposit-required services...');

  // Find "Color" category (or similar)
  const colorCategory = await db
    .select()
    .from(serviceCategories)
    .where(ilike(serviceCategories.name, '%color%'))
    .limit(1);

  if (colorCategory.length === 0) {
    console.log('  No "Color" category found - skipping deposit config');
    return [];
  }

  // Get first service in the Color category
  const colorServices = await db
    .select()
    .from(services)
    .where(eq(services.categoryId, colorCategory[0].id))
    .limit(1);

  if (colorServices.length === 0) {
    console.log('  No services in Color category - skipping deposit config');
    return [];
  }

  // Update the service to require deposit ($50 = 5000 cents)
  const updated = await db
    .update(services)
    .set({
      depositRequired: true,
      depositAmountCents: 5000, // $50 deposit
    })
    .where(eq(services.id, colorServices[0].id))
    .returning({ name: services.name });

  if (updated.length > 0) {
    console.log(`  Marked "${updated[0].name}" as deposit-required ($50)`);
    return [updated[0].name];
  }

  return [];
}

async function main() {
  console.log('Starting seed script...\n');

  try {
    const schedules = await seedStaffSchedules();
    console.log('');
    const appointmentResults = await seedSampleAppointments();
    console.log('');
    const paymentMethods = await seedPaymentMethods();
    console.log('');
    const depositServices = await seedDepositRequiredServices();

    console.log('\n--- Seed Complete ---');
    console.log(`Schedules: ${schedules.length} entries`);
    console.log(`Appointments: ${appointmentResults.length} entries`);
    console.log(`Payment methods: ${paymentMethods.length} entries`);
    console.log(`Deposit-required services: ${depositServices.length} entries`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
