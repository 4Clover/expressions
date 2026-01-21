import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildOAuthUrl } from '$lib/payments/square';

// GET /api/square/oauth?staffId=xxx - initiates OAuth flow
export const GET: RequestHandler = async ({ url }) => {
  const staffId = url.searchParams.get('staffId');
  if (!staffId) {
    return new Response('Missing staffId', { status: 400 });
  }

  // TODO: In production, verify staffId belongs to authenticated user
  // For now, allow any staff to initiate OAuth

  const baseUrl = url.origin;
  const authUrl = buildOAuthUrl(staffId, baseUrl);

  throw redirect(302, authUrl);
};
