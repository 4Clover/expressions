# SvelteKit Patterns - Quick Reference

## Load Functions
```typescript
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  return { item: await fetchItem(params.id) };
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // Validation...
    return fail(400, { error: 'message' });
  }
} satisfies Actions;
```

## API Routes
```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
  const result = await fetchData(params.id);
  if (!result) {
    throw error(404, 'Not found');
  }
  return json({ data: result });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  // Process...
  return json({ success: true }, { status: 201 });
};
```

## Dynamic Imports for Missing Env
```typescript
// Handle missing DATABASE_URL gracefully in API routes
export const GET: RequestHandler = async () => {
  const { db } = await import('@repo/db');
  // Use db...
};
```

## URL Query Params
```typescript
// Page load with query params
export const load: PageServerLoad = async ({ url }) => {
  const category = url.searchParams.get('category');
  const stylist = url.searchParams.get('stylist');
  return { filters: { category, stylist } };
};
```

## Form Actions with Validation
```typescript
export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();

    if (!name) {
      return fail(400, { error: 'Name required', name });
    }

    // Process valid data...
    throw redirect(303, '/success');
  }
} satisfies Actions;
```
