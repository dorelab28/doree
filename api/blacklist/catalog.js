const blacklistCatalog = require('../_blacklist-catalog');
const { methodNotAllowed, requireSession, sendJson } = require('../_blacklist');

const { catalog, demoLevels } = blacklistCatalog;

module.exports = function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  if (!requireSession(request, response)) return;
  return sendJson(response, 200, {
    catalog,
    demoLevels
  });
};
