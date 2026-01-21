import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	// Check if DATABASE_URL is configured
	if (!process.env.DATABASE_URL) {
		return json({ staff: [] });
	}

	try {
		// Dynamically import to avoid errors when DATABASE_URL is not set
		const { db, staff } = await import('@repo/db');
		const { eq } = await import('drizzle-orm');

		const staffMembers = await db.query.staff.findMany({
			where: eq(staff.isActive, true)
		});

		return json({ staff: staffMembers });
	} catch (error) {
		console.error('Failed to fetch staff:', error);
		return json({ staff: [] });
	}
};
