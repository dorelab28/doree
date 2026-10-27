const {
  authIsConfigured,
  createSession,
  isSameOriginRequest,
  makeCookie,
  methodNotAllowed,
  sendJson,
  verifyPassword
} = require('../_blacklist');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  if (!isSameOriginRequest(request)) return sendJson(response, 403, { error: 'ACCESS_DENIED' });
  if (!authIsConfigured()) return sendJson(response, 503, { error: 'AUTH_UNAVAILABLE' });

  let password;
  try {
    password = request.body?.password;
  } catch {
    return sendJson(response, 400, { error: 'ACCESS_DENIED' });
  }
  if (typeof password !== 'string' || password.length < 1 || password.length > 128 || !verifyPassword(password)) {
    return sendJson(response, 401, { error: 'ACCESS_DENIED' });
  }

  response.setHeader('Set-Cookie', makeCookie(createSession(), 60 * 60 * 6));
  return sendJson(response, 200, { authenticated: true });
};
