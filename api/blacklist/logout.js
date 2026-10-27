const { clearSession, isSameOriginRequest, methodNotAllowed, requireSession, sendJson } = require('../_blacklist');

module.exports = function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  if (!isSameOriginRequest(request)) return sendJson(response, 403, { error: 'AUTH_REQUIRED' });
  if (!requireSession(request, response)) return;
  clearSession(response);
  return sendJson(response, 204, {});
};
