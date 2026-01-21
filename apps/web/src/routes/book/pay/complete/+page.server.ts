/**
 * Payment Completion Page Server Load
 *
 * Handles Square checkout redirect - customer lands here after payment.
 * Checks payment status and redirects to confirmation if complete.
 */

import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const appointmentId = url.searchParams.get('appointmentId');

  if (!appointmentId) {
    throw error(400, 'Missing appointment ID');
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw error(500, 'Database not configured');
  }

  const { db, payments } = await import('@repo/db');
  const { eq } = await import('drizzle-orm');

  // Check payment status
  const payment = await db.query.payments.findFirst({
    where: eq(payments.appointmentId, appointmentId),
  });

  if (!payment) {
    // No payment record - might be pay-at-salon, redirect to confirmation
    throw redirect(302, `/book/confirmation/${appointmentId}`);
  }

  return {
    appointmentId,
    paymentStatus: payment.status,
  };
};
