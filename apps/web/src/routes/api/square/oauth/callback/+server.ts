import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSquareAppClient, getSquareClientForStaff } from '$lib/payments/square';

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get('code');
  const staffId = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    console.error('OAuth error:', errorParam);
    throw redirect(302, '/admin/staff/settings?error=oauth_denied');
  }

  if (!code || !staffId) {
    throw error(400, 'Missing code or state');
  }

  // Exchange code for tokens
  const client = getSquareAppClient();

  try {
    // Square SDK v43+ returns response directly (not wrapped in 'result')
    const tokenResponse = await client.oAuth.obtainToken({
      clientId: process.env.SQUARE_APPLICATION_ID!,
      clientSecret: process.env.SQUARE_APPLICATION_SECRET!,
      grantType: 'authorization_code',
      code,
      redirectUri: `${url.origin}/api/square/oauth/callback`,
    });

    if (!tokenResponse.accessToken || !tokenResponse.refreshToken || !tokenResponse.merchantId) {
      throw error(500, 'Invalid OAuth response');
    }

    // Get location ID using the staff's new access token
    const staffClient = getSquareClientForStaff(tokenResponse.accessToken);
    const locationsResponse = await staffClient.locations.list();
    const locationId = locationsResponse.locations?.[0]?.id;
    if (!locationId) {
      throw error(500, 'No Square location found');
    }

    // Store tokens in database
    if (!process.env.DATABASE_URL) {
      throw error(500, 'Database not configured');
    }

    const { db, staffSquareConfig } = await import('@repo/db');

    // Calculate expiry (30 days from now, but we'll refresh every 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Upsert Square config for this staff member
    await db
      .insert(staffSquareConfig)
      .values({
        staffId,
        merchantId: tokenResponse.merchantId,
        locationId,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        tokenExpiresAt: expiresAt,
      })
      .onConflictDoUpdate({
        target: staffSquareConfig.staffId,
        set: {
          merchantId: tokenResponse.merchantId,
          locationId,
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        },
      });

    throw redirect(302, '/admin/staff/settings?success=square_connected');
  } catch (err) {
    console.error('OAuth token exchange error:', err);
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw redirect or SvelteKit error
    }
    throw error(500, 'Failed to complete OAuth');
  }
};
