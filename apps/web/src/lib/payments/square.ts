import { SquareClient, SquareEnvironment } from 'square';

/**
 * Get Square client for a specific stylist (using their OAuth token)
 */
export function getSquareClientForStaff(accessToken: string) {
  return new SquareClient({
    token: accessToken,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
  });
}

/**
 * Get Square client using app-level credentials (for OAuth flow)
 */
export function getSquareAppClient() {
  return new SquareClient({
    token: process.env.SQUARE_APPLICATION_SECRET!,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
  });
}

/**
 * Serialize BigInt values for JSON response (Square SDK v40+ returns BigInt for money)
 */
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
}

/**
 * Build Square OAuth authorization URL
 */
export function buildOAuthUrl(staffId: string, baseUrl: string) {
  const authUrl = new URL('https://connect.squareup.com/oauth2/authorize');
  if (process.env.SQUARE_ENVIRONMENT !== 'production') {
    authUrl.hostname = 'connect.squareupsandbox.com';
  }
  authUrl.searchParams.set('client_id', process.env.SQUARE_APPLICATION_ID!);
  authUrl.searchParams.set('scope', 'PAYMENTS_WRITE ORDERS_WRITE MERCHANT_PROFILE_READ');
  authUrl.searchParams.set('state', staffId);
  authUrl.searchParams.set('redirect_uri', `${baseUrl}/api/square/oauth/callback`);
  return authUrl.toString();
}
