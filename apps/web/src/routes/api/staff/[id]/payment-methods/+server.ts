/**
 * Fetch staff payment methods API
 *
 * Returns a staff member's enabled P2P payment methods and Square config status.
 * Used by booking wizard to display payment options after staff selection.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const { id: staffId } = params;

  if (!staffId) {
    throw error(400, 'Staff ID is required');
  }

  if (!process.env.DATABASE_URL) {
    throw error(500, 'Database not configured');
  }

  try {
    const { db, staffPaymentMethods, staffSquareConfig } = await import('@repo/db');
    const { eq, and, asc } = await import('drizzle-orm');

    // Load enabled payment methods for this staff
    const paymentMethods = await db.query.staffPaymentMethods.findMany({
      where: and(
        eq(staffPaymentMethods.staffId, staffId),
        eq(staffPaymentMethods.isEnabled, true)
      ),
      orderBy: [asc(staffPaymentMethods.displayOrder)],
    });

    // Check if staff has Square enabled
    const squareConfig = await db.query.staffSquareConfig.findFirst({
      where: and(
        eq(staffSquareConfig.staffId, staffId),
        eq(staffSquareConfig.isEnabled, true)
      ),
    });

    return json({
      paymentMethods: paymentMethods.map(pm => ({
        methodType: pm.methodType,
        handle: pm.handle,
        displayName: pm.displayName,
      })),
      hasSquare: !!squareConfig,
    });
  } catch (err) {
    console.error('Failed to load staff payment methods:', err);
    throw error(500, 'Failed to load payment methods');
  }
};
