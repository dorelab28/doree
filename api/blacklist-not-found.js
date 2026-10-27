module.exports = function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.status(404).end();
};
