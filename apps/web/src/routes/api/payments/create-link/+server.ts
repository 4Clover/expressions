import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';
import { getSquareClientForStaff } from '$lib/payments/square';

interface CreateLinkBody {
  appointmentId: string;
  staffId: string;
  serviceName: string;
  amountCents: number;
}

export const POST: RequestHandler = async ({ request, url }) => {
  const body: CreateLinkBody = await request.json();
  const { appointmentId, staffId, serviceName, amountCents } = body;

  if (!appointmentId || !staffId || !serviceName || !amountCents) {
    throw error(400, 'Missing required fields');
  }

  if (!process.env.DATABASE_URL) {
    throw error(500, 'Database not configured');
  }

  const { db, staffSquareConfig, payments } = await import('@repo/db');
  const { eq } = await import('drizzle-orm');

  // Get stylist's Square config
  const squareConfig = await db.query.staffSquareConfig.findFirst({
    where: eq(staffSquareConfig.staffId, staffId),
  });

  if (!squareConfig || !squareConfig.isEnabled) {
    throw error(400, 'Stylist has not enabled Square payments');
  }

  // Create Square client for this stylist
  const client = getSquareClientForStaff(squareConfig.accessToken);

  try {
    // Square SDK v43+ API: properties are at top level, not nested in paymentLink
    const linkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: nanoid(),
      description: `Deposit for ${serviceName}`,
      checkoutOptions: {
        redirectUrl: `${url.origin}/book/pay/complete?appointmentId=${appointmentId}`,
        allowTipping: false,
      },
      order: {
        locationId: squareConfig.locationId,
        referenceId: appointmentId, // Link order to appointment via referenceId
        lineItems: [{
          name: `${serviceName} Deposit`,
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(amountCents),
            currency: 'USD',
          },
        }],
      },
    });

    if (!linkResponse.paymentLink?.url || !linkResponse.paymentLink?.orderId) {
      throw error(500, 'Failed to create payment link');
    }

    // Create pending payment record
    await db.insert(payments).values({
      appointmentId,
      squareOrderId: linkResponse.paymentLink.orderId,
      amountCents,
      status: 'pending',
      paymentMethod: 'square',
    });

    return json({
      success: true,
      paymentUrl: linkResponse.paymentLink.url,
      orderId: linkResponse.paymentLink.orderId,
    });
  } catch (err) {
    console.error('Square payment link error:', err);
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit error
    }
    throw error(500, 'Failed to create payment link');
  }
};
