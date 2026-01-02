import type { APIRoute } from 'astro';
import { generatePatchwork } from '../services/patchwork-generator';
import { cacheManager } from '../services/cache-manager';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);

  // Extract and validate parameters
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response('Missing required parameter: username', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Validate username (alphanumeric, underscore, dot, hyphen only)
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return new Response('Invalid username format', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const params = {
    username,
    period: url.searchParams.get('period') || 'overall',
    rows: Math.min(Math.max(parseInt(url.searchParams.get('rows') || '3'), 1), 10),
    cols: Math.min(Math.max(parseInt(url.searchParams.get('cols') || '3'), 1), 10),
    imageSize: Math.min(Math.max(parseInt(url.searchParams.get('size') || '150'), 50), 300),
    border: url.searchParams.get('border') || 'normal',
    provider: (url.searchParams.get('provider') || 'lastfm') as 'lastfm' | 'listenbrainz'
  };

  // Validate provider
  if (!['lastfm', 'listenbrainz'].includes(params.provider)) {
    return new Response('Invalid provider. Must be "lastfm" or "listenbrainz"', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Generate cache key
  const cacheKey = cacheManager.generateKey(params);

  // Check cache
  const cached = await cacheManager.get(cacheKey);

  if (cached) {
    console.log(`✅ Cache HIT: ${params.username} (${params.provider})`);

    return new Response(cached, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': cached.length.toString(),
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  }

  console.log(`❌ Cache MISS: ${params.username} (${params.provider}) - Generating...`);

  try {
    // Generate patchwork
    const startTime = Date.now();

    const { buffer, width, height } = await generatePatchwork({
      username: params.username,
      period: params.period,
      rows: params.rows,
      cols: params.cols,
      imageSize: params.imageSize,
      noBorder: params.border === 'none',
      provider: params.provider
    });

    const duration = Date.now() - startTime;
    console.log(`✨ Generated in ${duration}ms (${width}x${height}px, ${(buffer.length / 1024).toFixed(2)} KB)`);

    // Save to cache with period for dynamic TTL
    await cacheManager.set(cacheKey, buffer, params.period);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length.toString(),
        'X-Cache': 'MISS',
        'X-Generation-Time': `${duration}ms`,
        'X-Image-Width': width.toString(),
        'X-Image-Height': height.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });

  } catch (error) {
    console.error('Patchwork generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(`Error generating patchwork: ${errorMessage}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
