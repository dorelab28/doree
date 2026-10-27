const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const originalEnvironment = { ...process.env };

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnvironment)) delete process.env[key];
  }
  Object.assign(process.env, originalEnvironment);
}

function configureSecurityEnvironment() {
  restoreEnvironment();
  process.env.VERCEL = '1';
  process.env.BLACKLIST_SESSION_SECRET = 'test-session-secret-with-at-least-thirty-two-bytes';
  const salt = Buffer.alloc(16, 7);
  const digest = crypto.scryptSync('correct horse battery staple', salt, 64, { N: 16384, r: 8, p: 1 });
  process.env.BLACKLIST_PASSWORD_HASH = ['scrypt', 16384, 8, 1, salt.toString('base64url'), digest.toString('base64url')].join('$');
  delete process.env.BLACKLIST_PASSWORD;
}

function clearBlacklistModules() {
  for (const file of [
    'api/_blacklist.js',
    'api/_blacklist-catalog.js',
    'api/blacklist/login.js',
    'api/blacklist/session.js',
    'api/blacklist/catalog.js',
    'api/blacklist/page.js',
    'api/blacklist/logout.js'
  ]) delete require.cache[require.resolve(path.join(root, file))];
}

function loadHandlers() {
  clearBlacklistModules();
  return {
    auth: require(path.join(root, 'api/_blacklist.js')),
    catalogHelper: require(path.join(root, 'api/_blacklist-catalog.js')),
    login: require(path.join(root, 'api/blacklist/login.js')),
    session: require(path.join(root, 'api/blacklist/session.js')),
    catalog: require(path.join(root, 'api/blacklist/catalog.js')),
    page: require(path.join(root, 'api/blacklist/page.js')),
    logout: require(path.join(root, 'api/blacklist/logout.js'))
  };
}

function response() {
  return {
    headers: {},
    statusCode: null,
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
    end(body) { this.body = body; return this; }
  };
}

function request(overrides = {}) {
  return {
    method: 'GET',
    headers: { host: 'store.example.test' },
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides
  };
}

function loginRequest(password, ip = '203.0.113.9') {
  return request({
    method: 'POST',
    headers: {
      host: 'store.example.test',
      origin: 'https://store.example.test',
      'x-forwarded-for': ip
    },
    body: { password }
  });
}

test('protected endpoints reject anonymous and tampered sessions', { concurrency: false }, async () => {
  configureSecurityEnvironment();
  const handlers = loadHandlers();

  const catalogResponse = response();
  handlers.catalog(request(), catalogResponse);
  assert.equal(catalogResponse.statusCode, 401);

  const sessionResponse = response();
  handlers.session(request({ headers: { host: 'store.example.test', cookie: '__Host-dore-blacklist=not-a-session' } }), sessionResponse);
  assert.equal(sessionResponse.statusCode, 401);

  const now = Math.floor(Date.now() / 1000);
  const expiredPayload = Buffer.from(JSON.stringify({ v: 1, iat: now - 21601, exp: now - 1, nonce: 'expired-session-nonce-123' })).toString('base64url');
  const expiredSignature = crypto.createHmac('sha256', process.env.BLACKLIST_SESSION_SECRET).update(expiredPayload).digest('base64url');
  const expiredResponse = response();
  handlers.session(request({ headers: { host: 'store.example.test', cookie: `__Host-dore-blacklist=${expiredPayload}.${expiredSignature}` } }), expiredResponse);
  assert.equal(expiredResponse.statusCode, 401);

  const pageResponse = response();
  handlers.page(request(), pageResponse);
  assert.equal(pageResponse.statusCode, 302);
  assert.equal(pageResponse.headers.Location, '/blacklist-access.html');

  const logoutResponse = response();
  handlers.logout(loginRequest('irrelevant'), logoutResponse);
  assert.equal(logoutResponse.statusCode, 401);

  const helperResponse = response();
  handlers.auth(request(), helperResponse);
  assert.equal(helperResponse.statusCode, 404);

  const catalogHelperResponse = response();
  handlers.catalogHelper(request(), catalogHelperResponse);
  assert.equal(catalogHelperResponse.statusCode, 404);

  const crossOriginLoginResponse = response();
  await handlers.login(request({
    method: 'POST',
    headers: { host: 'store.example.test', origin: 'https://attacker.example.test', 'x-forwarded-for': '203.0.113.9' },
    body: { password: 'irrelevant' }
  }), crossOriginLoginResponse);
  assert.equal(crossOriginLoginResponse.statusCode, 403);
});

test('a signed session authorizes the protected route and has secure expiry attributes', { concurrency: false }, async () => {
  configureSecurityEnvironment();
  const handlers = loadHandlers();
  const loginResponse = response();
  await handlers.login(loginRequest('correct horse battery staple'), loginResponse);

  assert.equal(loginResponse.statusCode, 200);
  assert.deepEqual(loginResponse.body, { authenticated: true });
  const cookie = loginResponse.headers['Set-Cookie'];
  assert.match(cookie, /^__Host-dore-blacklist=/);
  assert.match(cookie, /; Path=\//);
  assert.match(cookie, /; HttpOnly/);
  assert.match(cookie, /; SameSite=Strict/);
  assert.match(cookie, /; Secure/);
  assert.match(cookie, /; Max-Age=21600/);
  assert.match(cookie, /; Expires=/);

  const cookieHeader = cookie.split(';')[0];
  const sessionResponse = response();
  handlers.session(request({ headers: { host: 'store.example.test', cookie: cookieHeader } }), sessionResponse);
  assert.equal(sessionResponse.statusCode, 200);
  assert.equal(sessionResponse.body.authenticated, true);
  assert.equal(typeof sessionResponse.body.expiresAt, 'number');

  const catalogResponse = response();
  handlers.catalog(request({ headers: { host: 'store.example.test', cookie: cookieHeader } }), catalogResponse);
  assert.equal(catalogResponse.statusCode, 200);
  assert.equal(Array.isArray(catalogResponse.body.catalog), true);
  assert.equal(catalogResponse.body.catalog.length, 12);

  const pageResponse = response();
  handlers.page(request({ headers: { host: 'store.example.test', cookie: cookieHeader } }), pageResponse);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /BLACKLIST/);

  const logoutResponse = response();
  handlers.logout(request({
    method: 'POST',
    headers: { host: 'store.example.test', origin: 'https://store.example.test', cookie: cookieHeader }
  }), logoutResponse);
  assert.equal(logoutResponse.statusCode, 204);
  assert.match(logoutResponse.headers['Set-Cookie'], /Max-Age=0/);
});

test('BLACKLIST_PASSWORD enables the simple configuration without Redis or a session secret', { concurrency: false }, async () => {
  configureSecurityEnvironment();
  delete process.env.BLACKLIST_SESSION_SECRET;
  delete process.env.BLACKLIST_PASSWORD_HASH;
  process.env.BLACKLIST_PASSWORD = 'dore2026';

  const handlers = loadHandlers();
  const rejectedLogin = response();
  await handlers.login(loginRequest('incorrecta'), rejectedLogin);
  assert.equal(rejectedLogin.statusCode, 401);

  const acceptedLogin = response();
  await handlers.login(loginRequest('dore2026'), acceptedLogin);
  assert.equal(acceptedLogin.statusCode, 200);

  const pageResponse = response();
  handlers.page(request({ headers: { host: 'store.example.test', cookie: acceptedLogin.headers['Set-Cookie'].split(';')[0] } }), pageResponse);
  assert.equal(pageResponse.statusCode, 200);
});

test('login is unavailable when no password is configured', { concurrency: false }, async () => {
  configureSecurityEnvironment();
  delete process.env.BLACKLIST_SESSION_SECRET;
  delete process.env.BLACKLIST_PASSWORD_HASH;
  delete process.env.BLACKLIST_PASSWORD;
  const handlers = loadHandlers();
  const loginResponse = response();
  await handlers.login(loginRequest('correct horse battery staple'), loginResponse);
  assert.equal(loginResponse.statusCode, 503);
  assert.deepEqual(loginResponse.body, { error: 'AUTH_UNAVAILABLE' });
});

test('BLACKLIST_PASSWORD takes precedence over a legacy password hash', { concurrency: false }, async () => {
  configureSecurityEnvironment();
  process.env.BLACKLIST_PASSWORD = 'dore2026';
  const handlers = loadHandlers();
  const rejectedLogin = response();
  await handlers.login(loginRequest('correct horse battery staple'), rejectedLogin);
  assert.equal(rejectedLogin.statusCode, 401);

  const loginResponse = response();
  await handlers.login(loginRequest('dore2026'), loginResponse);
  assert.equal(loginResponse.statusCode, 200);
});

test('the deployment Markdown is outside the deployment root and has a 404 route', { concurrency: false }, () => {
  assert.equal(fs.existsSync(path.join(root, 'BLACKLIST-DEPLOY.md')), false);
  assert.equal(fs.existsSync(path.join(root, '..', 'BLACKLIST-DEPLOY.md')), true);
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(vercel.rewrites.some(rule => rule.source === '/BLACKLIST-DEPLOY.md' && rule.destination === '/api/blacklist-not-found'), true);
});

test.after(() => {
  restoreEnvironment();
  clearBlacklistModules();
});
