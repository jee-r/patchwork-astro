import type { APIRoute } from 'astro';
import { cacheManager } from '../../services/cache-manager';

export const GET: APIRoute = async () => {
  const stats = await cacheManager.getStats();

  return new Response(JSON.stringify(stats, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};
