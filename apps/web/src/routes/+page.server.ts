import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Check if database credentials are configured
  const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

  if (!isDatabaseConfigured) {
    return {
      dbStatus: 'not_configured' as const,
      message: 'Database not configured. Add DATABASE_URL to .env file.',
    };
  }

  try {
    // Dynamically import db to avoid errors when DATABASE_URL is not set
    const { db, sql } = await import('@repo/db');

    // Simple connection test
    await db.execute(sql`SELECT 1`);

    return {
      dbStatus: 'connected' as const,
      message: 'Database connection successful!',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      dbStatus: 'error' as const,
      message: `Database connection failed: ${errorMessage}`,
    };
  }
};
