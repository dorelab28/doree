const crypto = require('crypto');

const SESSION_TTL_SECONDS = 60 * 60 * 6;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 8;
const RATE_LIMIT_NAMESPACE = 'dore:blacklist:login:v1:';

function isProduction() {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

function cookieName() {
  return isProduction() ? '__Host-dore-blacklist' : 'dore-blacklist-dev';
}

function setNoStore(response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'same-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function sendJson(response, status, payload) {
  setNoStore(response);
  response.status(status).json(payload);
}

function methodNotAllowed(response, methods) {
  response.setHeader('Allow', methods.join(', '));
  return sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' });
}

function readCookie(request, name) {
  const source = request.headers.cookie || '';
  const pair = source.split(';').map(item => item.trim()).find(item => item.startsWith(`${name}=`));
  if (!pair) return '';
  try {
    return decodeURIComponent(pair.slice(name.length + 1));
  } catch {
    return '';
  }
}

function isSameOriginRequest(request) {
  const origin = request.headers.origin;
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === String(host).split(',')[0].trim();
  } catch {
    return false;
  }
}

function makeCookie(value, maxAge) {
  const secure = isProduction() ? '; Secure' : '';
  const expires = maxAge > 0
    ? new Date(Date.now() + maxAge * 1000).toUTCString()
    : 'Thu, 01 Jan 1970 00:00:00 GMT';
  return `${cookieName()}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Expires=${expires}${secure}`;
}

function clearSession(response) {
  response.setHeader('Set-Cookie', makeCookie('', 0));
}

function signingSecret() {
  return process.env.BLACKLIST_SESSION_SECRET || '';
}

function hasValidSigningSecret() {
  return Buffer.byteLength(signingSecret(), 'utf8') >= 32;
}

function sign(value) {
  return crypto.createHmac('sha256', signingSecret()).update(value).digest('base64url');
}

function createSession() {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ v: 1, iat: now, exp: now + SESSION_TTL_SECONDS, nonce: crypto.randomBytes(16).toString('base64url') })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function sessionFromRequest(request) {
  const token = readCookie(request, cookieName());
  if (!token || !hasValidSigningSecret()) return null;
  const [encoded, suppliedSignature, extra] = token.split('.');
  if (!encoded || !suppliedSignature || extra) return null;

  const expectedSignature = sign(encoded);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.v !== 1 ||
      !Number.isSafeInteger(payload.iat) ||
      !Number.isSafeInteger(payload.exp) ||
      typeof payload.nonce !== 'string' ||
      payload.nonce.length < 20 ||
      payload.iat > now + 60 ||
      payload.exp - payload.iat !== SESSION_TTL_SECONDS ||
      payload.exp <= now
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireSession(request, response) {
  const session = sessionFromRequest(request);
  if (!session) {
    sendJson(response, 401, { error: 'AUTH_REQUIRED' });
    return null;
  }
  return session;
}

function requesterKey(request) {
  const forwarded = request.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : (forwarded || request.socket?.remoteAddress || 'unknown');
  return crypto.createHmac('sha256', signingSecret()).update(String(ip).split(',')[0].trim()).digest('base64url');
}

function sharedRedisCredentials() {
  const configuredPairs = [
    ['BLACKLIST_RATE_LIMIT_REST_URL', 'BLACKLIST_RATE_LIMIT_REST_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN']
  ];

  // Some Vercel Marketplace integrations namespace their injected variables.
  // Pair only matching Upstash URL/token names; never scan for arbitrary tokens.
  const urlSuffix = '_KV_REST_API_URL';
  const tokenSuffix = '_KV_REST_API_TOKEN';
  for (const name of Object.keys(process.env)) {
    if (!name.startsWith('UPSTASH_') || !name.endsWith(urlSuffix)) continue;
    configuredPairs.push([name, `${name.slice(0, -urlSuffix.length)}${tokenSuffix}`]);
  }

  for (const [urlName, tokenName] of configuredPairs) {
    const url = process.env[urlName];
    const token = process.env[tokenName];
    if (url && token) return { url, token };
  }
  return null;
}

function rateLimitConfiguration() {
  const credentials = sharedRedisCredentials();
  if (!credentials || !hasValidSigningSecret() || typeof globalThis.fetch !== 'function') return null;
  try {
    const parsed = new URL(credentials.url);
    if (parsed.protocol !== 'https:') return null;
    return { url: parsed.toString().replace(/\/+$/, ''), token: credentials.token };
  } catch {
    return null;
  }
}

async function redisCommand(configuration, command) {
  try {
    const response = await globalThis.fetch(configuration.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${configuration.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload && !payload.error ? payload.result : null;
  } catch {
    return null;
  }
}

async function consumeLoginAttempt(request) {
  const configuration = rateLimitConfiguration();
  if (!configuration) return { available: false, limited: true };

  // The script makes increment-and-expiry atomic in the shared Redis store.
  const result = await redisCommand(configuration, [
    'EVAL',
    "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; return count",
    1,
    `${RATE_LIMIT_NAMESPACE}${requesterKey(request)}`,
    RATE_WINDOW_MS
  ]);
  const attempts = Number(result);
  if (!Number.isSafeInteger(attempts) || attempts < 1) return { available: false, limited: true };
  return { available: true, limited: attempts > MAX_ATTEMPTS_PER_WINDOW };
}

function secureEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyScryptHash(candidate, storedValue) {
  const parts = storedValue.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, rawN, rawR, rawP, salt, digest] = parts;
  const N = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p) || N < 16384 || N > 1048576 || (N & (N - 1)) !== 0 || r < 8 || r > 32 || p < 1 || p > 16) return false;
  try {
    const saltBuffer = Buffer.from(salt, 'base64url');
    const expected = Buffer.from(digest, 'base64url');
    if (saltBuffer.length < 16 || expected.length !== 64) return false;
    const actual = crypto.scryptSync(candidate, saltBuffer, expected.length, { N, r, p, maxmem: 128 * N * r + 1024 * 1024 });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function verifyPassword(candidate) {
  const storedHash = process.env.BLACKLIST_PASSWORD_HASH;
  if (storedHash) return verifyScryptHash(candidate, storedHash);

  // This migration path remains server-only. It is intentionally disabled when no private variable is configured.
  const configuredPassword = process.env.BLACKLIST_PASSWORD;
  return Boolean(configuredPassword) && secureEqualText(candidate, configuredPassword);
}

function authIsConfigured() {
  return Boolean(hasValidSigningSecret() && (process.env.BLACKLIST_PASSWORD_HASH || process.env.BLACKLIST_PASSWORD));
}

function hiddenHelperEndpoint(request, response) {
  setNoStore(response);
  response.status(404).end();
}

module.exports = Object.assign(hiddenHelperEndpoint, {
  SESSION_TTL_SECONDS,
  authIsConfigured,
  clearSession,
  consumeLoginAttempt,
  createSession,
  isSameOriginRequest,
  makeCookie,
  methodNotAllowed,
  requireSession,
  sendJson,
  sessionFromRequest,
  setNoStore,
  verifyPassword
});
