const { methodNotAllowed, sendJson, sessionFromRequest } = require('../_blacklist');

module.exports = function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const session = sessionFromRequest(request);
  if (!session) return sendJson(response, 401, { authenticated: false });
  return sendJson(response, 200, { authenticated: true, expiresAt: session.exp });
};
