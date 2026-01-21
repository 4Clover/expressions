import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WebhooksHelper } from 'square';

export const POST: RequestHandler = async ({ request, url }) => {
  const signature = request.headers.get('x-square-hmacsha256-signature');
  if (!signature) {
    throw error(401, 'Missing signature');
  }

  const body = await request.text();

  // Verify webhook signature
  const isValid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature,
    signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
    notificationUrl: `${url.origin}/api/webhooks/square`,
  });

  if (!isValid) {
    console.error('Invalid webhook signature');
    throw error(401, 'Invalid signature');
  }

  const event = JSON.parse(body);

  if (!process.env.DATABASE_URL) {
    // Log but return 200 to prevent retries
    console.error('Database not configured for webhook');
    return json({ received: true });
  }

  const { db, payments, processedWebhooks } = await import('@repo/db');
  const { eq } = await import('drizzle-orm');

  // Idempotency check
  const existing = await db.query.processedWebhooks.findFirst({
    where: eq(processedWebhooks.eventId, event.event_id),
  });

  if (existing) {
    console.log('Webhook already processed:', event.event_id);
    return json({ received: true });
  }

  // Process based on event type
  try {
    switch (event.type) {
      case 'payment.completed': {
        const payment = event.data.object.payment;
        const orderId = payment.order_id;

        if (orderId) {
          await db
            .update(payments)
            .set({
              squarePaymentId: payment.id,
              status: 'completed',
              completedAt: new Date(),
            })
            .where(eq(payments.squareOrderId, orderId));

          console.log('Payment completed for order:', orderId);
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.data.object.payment;
        const orderId = payment.order_id;

        if (orderId) {
          await db
            .update(payments)
            .set({ status: 'failed' })
            .where(eq(payments.squareOrderId, orderId));

          console.log('Payment failed for order:', orderId);
        }
        break;
      }

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    // Mark as processed
    await db.insert(processedWebhooks).values({
      eventId: event.event_id,
      eventType: event.type,
    });

  } catch (err) {
    console.error('Webhook processing error:', err);
    // Return 200 anyway to prevent infinite retries
    // Log error for manual investigation
  }

  return json({ received: true });
};
