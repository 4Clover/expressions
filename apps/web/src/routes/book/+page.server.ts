/**
 * Booking wizard page server load
 *
 * Loads services, categories, staff, and staffServices for the booking wizard.
 * Uses dynamic import pattern for graceful fallback when DATABASE_URL is not configured.
 */

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Gracefully handle missing DATABASE_URL
  if (!process.env.DATABASE_URL) {
    return {
      services: [],
      categories: [],
      staff: [],
      staffServices: [],
    };
  }

  try {
    const { db, services, serviceCategories, staff, staffServices } = await import('@repo/db');
    const { eq, asc } = await import('drizzle-orm');

    // Load services with their categories
    const allServices = await db.query.services.findMany({
      where: eq(services.isActive, true),
    });

    // Load categories for grouping
    const allCategories = await db.query.serviceCategories.findMany({
      orderBy: [asc(serviceCategories.displayOrder)],
    });

    // Load active staff
    const allStaff = await db.query.staff.findMany({
      where: eq(staff.isActive, true),
    });

    // Load staff-service relationships
    const allStaffServices = await db.query.staffServices.findMany({
      where: eq(staffServices.isAvailable, true),
    });

    return {
      services: allServices,
      categories: allCategories,
      staff: allStaff,
      staffServices: allStaffServices,
    };
  } catch (error) {
    console.error('[book/+page.server.ts] Failed to load booking data:', error);
    return {
      services: [],
      categories: [],
      staff: [],
      staffServices: [],
    };
  }
};
