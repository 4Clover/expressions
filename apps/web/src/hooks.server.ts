/**
 * Server hooks - runs once at server startup
 *
 * Bridges SvelteKit's $env module to process.env for compatibility
 * with the @repo/db package which reads DATABASE_URL from process.env.
 */

import { env } from '$env/dynamic/private';

// Inject DATABASE_URL into process.env for @repo/db compatibility
// This runs once at server startup, before any request handlers
if (env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}

// Also inject Square credentials if present
if (env.SQUARE_APPLICATION_ID) {
  process.env.SQUARE_APPLICATION_ID = env.SQUARE_APPLICATION_ID;
}
if (env.SQUARE_APPLICATION_SECRET) {
  process.env.SQUARE_APPLICATION_SECRET = env.SQUARE_APPLICATION_SECRET;
}
if (env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = env.SQUARE_WEBHOOK_SIGNATURE_KEY;
}
if (env.SQUARE_ENVIRONMENT) {
  process.env.SQUARE_ENVIRONMENT = env.SQUARE_ENVIRONMENT;
}

export const handle = async ({ event, resolve }) => {
  return resolve(event);
};
