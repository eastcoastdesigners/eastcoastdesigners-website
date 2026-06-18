// Cloudflare Pages Function — Basic Auth gate for /our-work
//
// Intercepts every request to /our-work and requires HTTP Basic Auth.
// The browser prompts for a username + password; we ignore the username
// and only check the password against the OUR_WORK_PASSWORD env var.
//
// To change the password: edit the OUR_WORK_PASSWORD secret in the
// Cloudflare Pages dashboard (Workers & Pages → eastcoastdesigners
// project → Settings → Environment variables and secrets), then redeploy
// (or push any commit to trigger one).

const REALM = 'East Coast Designers — Our Work (Private)';
const WWW_AUTH = `Basic realm="${REALM}"`;

const challenge = (body) =>
  new Response(body, {
    status: 401,
    headers: { 'WWW-Authenticate': WWW_AUTH, 'Content-Type': 'text/plain' },
  });

export const onRequest = async ({ request, next, env }) => {
  const password = env.OUR_WORK_PASSWORD;

  if (!password) {
    return new Response(
      'Password gate not configured. Set OUR_WORK_PASSWORD in Cloudflare Pages env vars, then redeploy.',
      { status: 503, headers: { 'Content-Type': 'text/plain' } },
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
      return next();
    }
  } catch {
    // fall through to challenge
  }

  return challenge('Invalid credentials');
};
