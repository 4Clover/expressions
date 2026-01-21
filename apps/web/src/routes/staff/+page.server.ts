import { db } from '@repo/db';
import { staff } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Gracefully handle missing DATABASE_URL
  if (!process.env.DATABASE_URL) {
    return { staff: [] };
  }

  try {
    const staffMembers = await db.query.staff.findMany({
      where: eq(staff.isActive, true),
    });

    return { staff: staffMembers };
  } catch (error) {
    console.error('Failed to load staff:', error);
    return { staff: [] };
  }
};
