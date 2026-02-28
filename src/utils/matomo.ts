/**
 * Fire-and-forget server-side Matomo page view tracking.
 * The request URL is tracked as a standard page view — no custom event
 * configuration needed in Matomo, it shows up directly in the Pages report.
 * Silently fails if Matomo is not configured or the request errors.
 */
export async function trackPageView(request: Request): Promise<void> {
  if (process.env.MATOMO_ENABLED !== 'true') return;

  const matomoHost = process.env.MATOMO_HOST;
  const matomoSiteId = process.env.MATOMO_SITE_ID;

  if (!matomoHost || !matomoSiteId) return;

  const matomoTokenAuth = process.env.MATOMO_TOKEN_AUTH;
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

  const params = new URLSearchParams({
    idsite: matomoSiteId,
    rec: '1',
    apiv: '1',
    rand: Math.random().toString(36).slice(2),
    url: request.url,
    ua: request.headers.get('user-agent') ?? '',
    send_image: '0',
    ...(matomoTokenAuth && clientIp && { cip: clientIp, token_auth: matomoTokenAuth }),
  });

  try {
    await fetch(`https://${matomoHost}/matomo.php`, {
      method: 'POST',
      body: params,
    });
  } catch {
    // Silent fail — tracking must not break image generation
  }
}
