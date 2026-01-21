import { db } from '@repo/db';
import { staff, staffServices } from '@repo/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Gracefully handle missing DATABASE_URL
  if (!process.env.DATABASE_URL) {
    error(404, 'Staff member not found');
  }

  // Convert slug back to display name
  // e.g., "jane-doe" -> "Jane Doe"
  const displayName = params.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  try {
    const staffMember = await db.query.staff.findFirst({
      where: and(eq(staff.displayName, displayName), eq(staff.isActive, true)),
      with: {
        staffServices: {
          where: eq(staffServices.isAvailable, true),
          with: {
            service: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!staffMember) {
      error(404, 'Staff member not found');
    }

    return { staffMember };
  } catch (err) {
    // Re-throw SvelteKit errors
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Failed to load staff member:', err);
    error(500, 'Failed to load staff member');
  }
};
