/**
 * Seed script for Expressions Hair Designs
 *
 * Usage:
 *   pnpm --filter @repo/db db:seed          # Seed demo data
 *   pnpm --filter @repo/db db:seed --wipe   # Wipe all data (for production prep)
 *   pnpm --filter @repo/db db:seed --reset  # Wipe then re-seed
 *
 * Requires: DATABASE_URL environment variable
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql as sqlTag } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  profiles,
  staff,
  serviceCategories,
  services,
  staffServices,
  staffSchedule,
  staffPaymentMethods,
  staffSquareConfig,
  appointments,
  payments,
  processedWebhooks,
} from '../src/schema/index.js';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  console.log('\nSet it with:');
  console.log('  export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle({ client });

// Parse CLI args
const args = process.argv.slice(2);
const shouldWipe = args.includes('--wipe');
const shouldReset = args.includes('--reset');

// ─────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────

const DEMO_STYLISTS = [
  {
    displayName: 'Sarah Mitchell',
    email: 'sarah@expressions.demo',
    bio: 'Master colorist with 12 years of experience. Specializing in balayage, vivid colors, and corrective color work. I believe every client deserves to feel confident and beautiful.',
    photoUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
    specialties: ['Balayage', 'Vivid Colors', 'Color Correction'],
    paymentMethods: [
      { type: 'venmo' as const, handle: '@sarah-mitchell-hair' },
      { type: 'zelle' as const, handle: 'sarah@expressions.demo' },
      { type: 'cash' as const, handle: null },
    ],
    schedule: {
      // Tue-Sat
      2: { start: '09:00', end: '18:00' },
      3: { start: '09:00', end: '18:00' },
      4: { start: '10:00', end: '19:00' },
      5: { start: '10:00', end: '19:00' },
      6: { start: '09:00', end: '16:00' },
    },
  },
  {
    displayName: 'Marcus Johnson',
    email: 'marcus@expressions.demo',
    bio: 'Precision cutting expert trained in London and New York. I specialize in modern cuts, fades, and textured styles for all hair types.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    specialties: ['Precision Cuts', 'Fades', 'Textured Styles'],
    paymentMethods: [
      { type: 'cashapp' as const, handle: '$MarcusJCuts' },
      { type: 'venmo' as const, handle: '@marcus-j-cuts' },
      { type: 'cash' as const, handle: null },
    ],
    schedule: {
      // Mon, Wed-Sat
      1: { start: '10:00', end: '18:00' },
      3: { start: '10:00', end: '18:00' },
      4: { start: '11:00', end: '20:00' },
      5: { start: '11:00', end: '20:00' },
      6: { start: '09:00', end: '15:00' },
    },
  },
  {
    displayName: 'Elena Rodriguez',
    email: 'elena@expressions.demo',
    bio: 'Bridal and special occasion specialist. From elegant updos to romantic waves, I create looks that make you feel like the best version of yourself.',
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop',
    specialties: ['Bridal', 'Updos', 'Extensions'],
    paymentMethods: [
      { type: 'venmo' as const, handle: '@elena-styles' },
      { type: 'zelle' as const, handle: 'elena@expressions.demo' },
    ],
    schedule: {
      // Tue-Fri, flexible Sat
      2: { start: '09:00', end: '17:00' },
      3: { start: '09:00', end: '17:00' },
      4: { start: '09:00', end: '17:00' },
      5: { start: '09:00', end: '17:00' },
      6: { start: '10:00', end: '14:00' },
    },
  },
  {
    displayName: 'Jordan Kim',
    email: 'jordan@expressions.demo',
    bio: 'Creative stylist passionate about bold transformations and gender-affirming haircuts. Your hair, your rules - let\'s create something amazing together.',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    specialties: ['Creative Color', 'Gender-Affirming Cuts', 'Transformations'],
    paymentMethods: [
      { type: 'venmo' as const, handle: '@jordan-kim-hair' },
      { type: 'cashapp' as const, handle: '$JordanKimHair' },
      { type: 'cash' as const, handle: null },
    ],
    schedule: {
      // Wed-Sun
      0: { start: '11:00', end: '17:00' },
      3: { start: '10:00', end: '18:00' },
      4: { start: '10:00', end: '18:00' },
      5: { start: '12:00', end: '20:00' },
      6: { start: '10:00', end: '16:00' },
    },
  },
];

const DEMO_CATEGORIES = [
  { name: 'Haircuts', order: 1 },
  { name: 'Color', order: 2 },
  { name: 'Styling', order: 3 },
  { name: 'Treatments', order: 4 },
];

const DEMO_SERVICES: Record<string, Array<{
  name: string;
  description: string;
  duration: number;
  priceType: 'fixed' | 'starting' | 'range';
  priceMin: number;
  priceMax?: number;
  depositRequired?: boolean;
  depositAmount?: number;
}>> = {
  'Haircuts': [
    { name: "Women's Haircut", description: 'Consultation, shampoo, precision cut, and style', duration: 60, priceType: 'starting', priceMin: 6500 },
    { name: "Men's Haircut", description: 'Classic or modern cut with styling', duration: 30, priceType: 'fixed', priceMin: 3500 },
    { name: 'Kids Haircut', description: 'For children 12 and under', duration: 30, priceType: 'fixed', priceMin: 2500 },
    { name: 'Bang Trim', description: 'Quick bang maintenance between cuts', duration: 15, priceType: 'fixed', priceMin: 1500 },
    { name: 'Buzz Cut / Fade', description: 'Clipper cut with fade options', duration: 30, priceType: 'starting', priceMin: 3000 },
  ],
  'Color': [
    { name: 'Single Process Color', description: 'All-over color application', duration: 90, priceType: 'starting', priceMin: 8500 },
    { name: 'Highlights - Partial', description: 'Face-framing highlights', duration: 90, priceType: 'starting', priceMin: 9500 },
    { name: 'Highlights - Full', description: 'Full head foil highlights', duration: 120, priceType: 'starting', priceMin: 14500, depositRequired: true, depositAmount: 5000 },
    { name: 'Balayage', description: 'Hand-painted highlights for natural dimension', duration: 150, priceType: 'range', priceMin: 17500, priceMax: 25000, depositRequired: true, depositAmount: 7500 },
    { name: 'Color Correction', description: 'Complex color fixes - consultation required', duration: 180, priceType: 'starting', priceMin: 20000, depositRequired: true, depositAmount: 10000 },
    { name: 'Vivid / Fashion Color', description: 'Bold, creative colors', duration: 180, priceType: 'starting', priceMin: 18000, depositRequired: true, depositAmount: 7500 },
    { name: 'Root Touch-Up', description: 'Gray coverage or color refresh', duration: 60, priceType: 'fixed', priceMin: 6500 },
    { name: 'Gloss / Toner', description: 'Refresh and enhance color', duration: 30, priceType: 'fixed', priceMin: 3500 },
  ],
  'Styling': [
    { name: 'Blowout', description: 'Shampoo and professional blowdry style', duration: 45, priceType: 'fixed', priceMin: 4500 },
    { name: 'Special Occasion Style', description: 'Updo or formal styling', duration: 60, priceType: 'starting', priceMin: 7500 },
    { name: 'Bridal Trial', description: 'Practice session for wedding day look', duration: 90, priceType: 'fixed', priceMin: 12500, depositRequired: true, depositAmount: 5000 },
    { name: 'Bridal Day-Of', description: 'Wedding day hair styling', duration: 90, priceType: 'fixed', priceMin: 17500, depositRequired: true, depositAmount: 10000 },
    { name: 'Braids', description: 'Braided styles - complexity varies', duration: 60, priceType: 'range', priceMin: 5000, priceMax: 15000 },
  ],
  'Treatments': [
    { name: 'Deep Conditioning', description: 'Intensive moisture treatment', duration: 30, priceType: 'fixed', priceMin: 3500 },
    { name: 'Keratin Treatment', description: 'Smoothing and frizz control (lasts 3-5 months)', duration: 180, priceType: 'starting', priceMin: 25000, depositRequired: true, depositAmount: 10000 },
    { name: 'Scalp Treatment', description: 'Exfoliating and nourishing scalp therapy', duration: 30, priceType: 'fixed', priceMin: 4000 },
    { name: 'Olaplex Add-On', description: 'Bond-building treatment with any service', duration: 15, priceType: 'fixed', priceMin: 3500 },
  ],
};

// ─────────────────────────────────────────────────────────────
// Wipe Function
// ─────────────────────────────────────────────────────────────

async function wipeDatabase() {
  console.log('\n🗑️  Wiping database...\n');

  // Delete in reverse dependency order
  const tables = [
    { name: 'processed_webhooks', table: processedWebhooks },
    { name: 'payments', table: payments },
    { name: 'appointments', table: appointments },
    { name: 'staff_square_config', table: staffSquareConfig },
    { name: 'staff_payment_methods', table: staffPaymentMethods },
    { name: 'staff_schedule', table: staffSchedule },
    { name: 'staff_services', table: staffServices },
    { name: 'services', table: services },
    { name: 'service_categories', table: serviceCategories },
    { name: 'staff', table: staff },
    { name: 'profiles', table: profiles },
  ];

  for (const { name, table } of tables) {
    try {
      const result = await db.delete(table);
      console.log(`  ✓ Cleared ${name}`);
    } catch (error: any) {
      // Table might not exist yet
      if (error.code === '42P01') {
        console.log(`  ○ Skipped ${name} (table doesn't exist)`);
      } else {
        console.log(`  ✗ Error clearing ${name}: ${error.message}`);
      }
    }
  }

  console.log('\n✅ Database wiped\n');
}

// ─────────────────────────────────────────────────────────────
// Seed Functions
// ─────────────────────────────────────────────────────────────

async function seedProfiles(): Promise<Map<string, string>> {
  console.log('  Seeding profiles...');
  const profileMap = new Map<string, string>();

  for (const stylist of DEMO_STYLISTS) {
    const [profile] = await db.insert(profiles).values({
      userId: crypto.randomUUID(), // Fake auth user ID for demo
      email: stylist.email,
      role: 'stylist',
    }).returning();

    profileMap.set(stylist.email, profile.id);
    console.log(`    ✓ ${stylist.email}`);
  }

  return profileMap;
}

async function seedStaff(profileMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('  Seeding staff...');
  const staffMap = new Map<string, string>();

  for (const stylist of DEMO_STYLISTS) {
    const profileId = profileMap.get(stylist.email)!;

    const [staffMember] = await db.insert(staff).values({
      profileId,
      displayName: stylist.displayName,
      bio: stylist.bio,
      photoUrl: stylist.photoUrl,
      specialties: stylist.specialties,
      isActive: true,
    }).returning();

    staffMap.set(stylist.email, staffMember.id);
    console.log(`    ✓ ${stylist.displayName}`);
  }

  return staffMap;
}

async function seedCategories(): Promise<Map<string, string>> {
  console.log('  Seeding categories...');
  const categoryMap = new Map<string, string>();

  for (const cat of DEMO_CATEGORIES) {
    const [category] = await db.insert(serviceCategories).values({
      name: cat.name,
      displayOrder: cat.order,
    }).returning();

    categoryMap.set(cat.name, category.id);
    console.log(`    ✓ ${cat.name}`);
  }

  return categoryMap;
}

async function seedServices(categoryMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('  Seeding services...');
  const serviceMap = new Map<string, string>();

  for (const [categoryName, categoryServices] of Object.entries(DEMO_SERVICES)) {
    const categoryId = categoryMap.get(categoryName)!;

    for (const svc of categoryServices) {
      const [service] = await db.insert(services).values({
        categoryId,
        name: svc.name,
        description: svc.description,
        durationMinutes: svc.duration,
        priceType: svc.priceType,
        priceMin: svc.priceMin,
        priceMax: svc.priceMax ?? null,
        depositRequired: svc.depositRequired ?? false,
        depositAmountCents: svc.depositAmount ?? null,
        isActive: true,
      }).returning();

      serviceMap.set(svc.name, service.id);
    }
    console.log(`    ✓ ${categoryName} (${categoryServices.length} services)`);
  }

  return serviceMap;
}

async function seedStaffServices(staffMap: Map<string, string>, serviceMap: Map<string, string>) {
  console.log('  Seeding staff-service assignments...');

  // Assign services based on specialties
  const serviceAssignments: Record<string, string[]> = {
    'sarah@expressions.demo': [
      // Color specialist - all color services
      'Single Process Color', 'Highlights - Partial', 'Highlights - Full', 'Balayage',
      'Color Correction', 'Vivid / Fashion Color', 'Root Touch-Up', 'Gloss / Toner',
      // Basic cuts and blowouts
      "Women's Haircut", 'Bang Trim', 'Blowout', 'Deep Conditioning', 'Olaplex Add-On',
    ],
    'marcus@expressions.demo': [
      // Cut specialist - all cuts
      "Women's Haircut", "Men's Haircut", 'Kids Haircut', 'Bang Trim', 'Buzz Cut / Fade',
      // Basic styling and treatments
      'Blowout', 'Deep Conditioning', 'Scalp Treatment',
    ],
    'elena@expressions.demo': [
      // Bridal/styling specialist
      'Blowout', 'Special Occasion Style', 'Bridal Trial', 'Bridal Day-Of', 'Braids',
      // Basic cuts and treatments
      "Women's Haircut", 'Bang Trim', 'Deep Conditioning',
      // Some color
      'Single Process Color', 'Highlights - Partial', 'Gloss / Toner',
    ],
    'jordan@expressions.demo': [
      // Creative/transformation specialist - all services
      ...Object.values(DEMO_SERVICES).flat().map(s => s.name),
    ],
  };

  let count = 0;
  for (const [email, serviceNames] of Object.entries(serviceAssignments)) {
    const staffId = staffMap.get(email)!;

    for (const serviceName of serviceNames) {
      const serviceId = serviceMap.get(serviceName);
      if (serviceId) {
        await db.insert(staffServices).values({
          staffId,
          serviceId,
          isAvailable: true,
        });
        count++;
      }
    }
  }

  console.log(`    ✓ ${count} assignments created`);
}

async function seedStaffSchedules(staffMap: Map<string, string>) {
  console.log('  Seeding schedules...');

  for (const stylist of DEMO_STYLISTS) {
    const staffId = staffMap.get(stylist.email)!;

    for (const [weekday, hours] of Object.entries(stylist.schedule)) {
      await db.insert(staffSchedule).values({
        staffId,
        weekday: parseInt(weekday),
        startTime: hours.start,
        endTime: hours.end,
        isActive: true,
      });
    }

    console.log(`    ✓ ${stylist.displayName} (${Object.keys(stylist.schedule).length} days)`);
  }
}

async function seedPaymentMethods(staffMap: Map<string, string>) {
  console.log('  Seeding payment methods...');

  for (const stylist of DEMO_STYLISTS) {
    const staffId = staffMap.get(stylist.email)!;

    for (let i = 0; i < stylist.paymentMethods.length; i++) {
      const method = stylist.paymentMethods[i];
      await db.insert(staffPaymentMethods).values({
        staffId,
        methodType: method.type,
        handle: method.handle,
        isEnabled: true,
        displayOrder: i,
      });
    }

    console.log(`    ✓ ${stylist.displayName} (${stylist.paymentMethods.length} methods)`);
  }
}

async function seedSampleAppointments(staffMap: Map<string, string>, serviceMap: Map<string, string>) {
  console.log('  Seeding sample appointments...');

  // Create a few sample appointments for the next week
  const now = new Date();
  const sampleBookings = [
    {
      staffEmail: 'sarah@expressions.demo',
      serviceName: 'Balayage',
      customerName: 'Emily Chen',
      customerEmail: 'emily.chen@example.com',
      customerPhone: '555-0101',
      daysFromNow: 2,
      hour: 10,
    },
    {
      staffEmail: 'marcus@expressions.demo',
      serviceName: "Men's Haircut",
      customerName: 'David Park',
      customerEmail: 'david.park@example.com',
      customerPhone: '555-0102',
      daysFromNow: 1,
      hour: 14,
    },
    {
      staffEmail: 'elena@expressions.demo',
      serviceName: 'Bridal Trial',
      customerName: 'Jessica Williams',
      customerEmail: 'jessica.w@example.com',
      customerPhone: '555-0103',
      daysFromNow: 5,
      hour: 11,
    },
    {
      staffEmail: 'jordan@expressions.demo',
      serviceName: 'Vivid / Fashion Color',
      customerName: 'Alex Rivera',
      customerEmail: 'alex.r@example.com',
      customerPhone: '555-0104',
      daysFromNow: 3,
      hour: 13,
    },
  ];

  for (const booking of sampleBookings) {
    const staffId = staffMap.get(booking.staffEmail);
    const serviceId = serviceMap.get(booking.serviceName);

    if (!staffId || !serviceId) continue;

    // Get service duration
    const svc = Object.values(DEMO_SERVICES).flat().find(s => s.name === booking.serviceName);
    const duration = svc?.duration ?? 60;

    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() + booking.daysFromNow);
    startTime.setHours(booking.hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    await db.insert(appointments).values({
      staffId,
      serviceId,
      startTime,
      endTime,
      status: 'confirmed',
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      cancelToken: nanoid(12),
      depositRequired: svc?.depositRequired ?? false,
      depositAmount: svc?.depositAmount ?? null,
    });

    console.log(`    ✓ ${booking.customerName} - ${booking.serviceName}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Expressions Hair Designs - Database Seed');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Handle --wipe flag
    if (shouldWipe || shouldReset) {
      await wipeDatabase();

      if (shouldWipe && !shouldReset) {
        console.log('Database wiped. Ready for production data.\n');
        process.exit(0);
      }
    }

    // Seed demo data
    console.log('📦 Seeding demo data...\n');

    const profileMap = await seedProfiles();
    const staffMap = await seedStaff(profileMap);
    const categoryMap = await seedCategories();
    const serviceMap = await seedServices(categoryMap);
    await seedStaffServices(staffMap, serviceMap);
    await seedStaffSchedules(staffMap);
    await seedPaymentMethods(staffMap);
    await seedSampleAppointments(staffMap, serviceMap);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ Seed complete!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('  Seeded:');
    console.log(`    • ${DEMO_STYLISTS.length} stylists`);
    console.log(`    • ${DEMO_CATEGORIES.length} categories`);
    console.log(`    • ${Object.values(DEMO_SERVICES).flat().length} services`);
    console.log('    • Staff schedules and payment methods');
    console.log('    • 4 sample appointments\n');
    console.log('  To wipe for production: pnpm --filter @repo/db db:seed --wipe\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
