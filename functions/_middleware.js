// Cloudflare Pages Function — Basic Auth gate for /our-work.
//
// Root-level middleware so it intercepts every request before Cloudflare
// can serve a cached copy. For non-/our-work paths it's a no-op (next()
// returns the static asset response unchanged).
//
// For /our-work it requires HTTP Basic Auth. Browser prompts for
// username + password; we ignore the username and check the password
// against the OUR_WORK_PASSWORD env var (set in Cloudflare Pages
// dashboard → Settings → Environment variables and secrets).
//
// IMPORTANT: every response sets aggressive no-store cache headers so
// Cloudflare's edge cache never serves a cached /our-work response —
// otherwise the function gets bypassed entirely.

const REALM = 'East Coast Designers — Our Work (Private)';
const WWW_AUTH = `Basic realm="${REALM}"`;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, private, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Cloudflare-CDN-Cache-Control': 'no-store',
  'Pragma': 'no-cache',
};

const challenge = (body) =>
  new Response(body, {
    status: 401,
    headers: {
      'WWW-Authenticate': WWW_AUTH,
      'Content-Type': 'text/plain',
      ...NO_CACHE_HEADERS,
    },
  });

const stripCacheFromStaticResponse = async (next) => {
  const response = await next();
  const cloned = new Response(response.body, response);
  for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) {
    cloned.headers.set(k, v);
  }
  return cloned;
};

export const onRequest = async ({ request, next, env }) => {
  const url = new URL(request.url);

  // Only gate the /our-work route (and any sub-paths). Everything else
  // passes through with no behavior change.
  if (url.pathname !== '/our-work' && !url.pathname.startsWith('/our-work/')) {
    return next();
  }

  const password = env.OUR_WORK_PASSWORD;
  if (!password) {
    return new Response(
      'Password gate not configured. Set OUR_WORK_PASSWORD in Cloudflare Pages env vars (Production), then redeploy.',
      {
        status: 503,
        headers: { 'Content-Type': 'text/plain', ...NO_CACHE_HEADERS },
      },
    );
  }

  const auth = request.headers.get('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('basic ')) {
    return challenge('Authentication required');
  }

  try {
    const decoded = atob(auth.slice(6).trim());
    const colon = decoded.indexOf(':');
    const provided = colon === -1 ? decoded : decoded.slice(colon + 1);
    if (provided === password) {
      return await stripCacheFromStaticResponse(next);
    }
  } catch {
    // fall through to challenge
  }

  return challenge('Invalid credentials');
};
