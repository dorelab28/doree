const crypto = require('crypto');

const SESSION_TTL_SECONDS = 60 * 60 * 6;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 8;
const attempts = new Map();

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
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : '';
}

function isSameOriginRequest(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  try {
    return Boolean(host) && new URL(origin).host === String(host).split(',')[0].trim();
  } catch {
    return false;
  }
}

function makeCookie(value, maxAge) {
  const secure = isProduction() ? '; Secure' : '';
  return `${cookieName()}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

function clearSession(response) {
  response.setHeader('Set-Cookie', makeCookie('', 0));
}

function signingSecret() {
  return process.env.BLACKLIST_SESSION_SECRET || '';
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
  if (!token || !signingSecret()) return null;
  const [encoded, suppliedSignature, extra] = token.split('.');
  if (!encoded || !suppliedSignature || extra) return null;

  const expectedSignature = sign(encoded);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (payload.v !== 1 || !Number.isInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
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
  return crypto.createHash('sha256').update(String(ip).split(',')[0].trim()).digest('hex');
}

function pruneAttemptStore(now) {
  for (const [key, timestamps] of attempts.entries()) {
    const live = timestamps.filter(value => now - value < RATE_WINDOW_MS);
    if (live.length) attempts.set(key, live);
    else attempts.delete(key);
  }
}

function isRateLimited(request) {
  const now = Date.now();
  pruneAttemptStore(now);
  return (attempts.get(requesterKey(request)) || []).length >= MAX_ATTEMPTS_PER_WINDOW;
}

function recordFailedAttempt(request) {
  const key = requesterKey(request);
  const existing = attempts.get(key) || [];
  existing.push(Date.now());
  attempts.set(key, existing);
}

function resetAttempts(request) {
  attempts.delete(requesterKey(request));
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
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p) || N < 16384 || N > 1048576 || (N & (N - 1)) !== 0) return false;
  try {
    const expected = Buffer.from(digest, 'base64url');
    const actual = crypto.scryptSync(candidate, Buffer.from(salt, 'base64url'), expected.length, { N, r, p, maxmem: 128 * N * r + 1024 * 1024 });
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
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
  return Boolean(signingSecret() && (process.env.BLACKLIST_PASSWORD_HASH || process.env.BLACKLIST_PASSWORD));
}

module.exports = {
  SESSION_TTL_SECONDS,
  authIsConfigured,
  clearSession,
  createSession,
  isRateLimited,
  isSameOriginRequest,
  methodNotAllowed,
  recordFailedAttempt,
  requireSession,
  resetAttempts,
  sendJson,
  sessionFromRequest,
  setNoStore,
  makeCookie,
  verifyPassword
};
