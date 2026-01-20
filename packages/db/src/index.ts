import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// CRITICAL: prepare: false is required for Supabase transaction pooler
// See: https://orm.drizzle.team/docs/connect-supabase
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle({ client, schema });

// Re-export schema for convenience
export * from './schema/index.js';
