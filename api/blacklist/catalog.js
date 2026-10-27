const blacklistCatalog = require('../_blacklist-catalog');
const { methodNotAllowed, sendJson } = require('../_blacklist');

const { catalog, demoLevels } = blacklistCatalog;

module.exports = function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  return sendJson(response, 200, {
    catalog,
    demoLevels
  });
};
