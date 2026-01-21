import { db } from '@repo/db';
import { serviceCategories, services } from '@repo/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Gracefully handle missing DATABASE_URL
  if (!process.env.DATABASE_URL) {
    return { categories: [] };
  }

  try {
    const categories = await db.query.serviceCategories.findMany({
      with: {
        services: {
          where: eq(services.isActive, true),
        },
      },
      orderBy: [asc(serviceCategories.displayOrder)],
    });

    return { categories };
  } catch (error) {
    console.error('Failed to load services:', error);
    return { categories: [] };
  }
};
