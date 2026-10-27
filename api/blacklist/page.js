const { setNoStore, sessionFromRequest } = require('../_blacklist');

const document = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090b0a">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>DORÉ LAB // BLACKLIST</title>
  <link rel="stylesheet" href="/blacklist.css">
  <script src="/blacklist.js" defer></script>
</head>
<body class="blacklist-page">
  <div class="blacklist-noise" aria-hidden="true"></div>
  <main class="blacklist-shell">
    <header class="blacklist-header">
      <a class="blacklist-mark" href="/" aria-label="Volver a Doré Lab">DORÉ LAB<span>//</span> BLACKLIST</a>
      <div class="blacklist-status" aria-label="Estado del sistema"><i></i> SECURE CHANNEL / ESTABLISHED</div>
      <button class="blacklist-logout" type="button" data-blacklist-logout>CLOSE SESSION</button>
    </header>
    <section class="blacklist-intro" data-blacklist-intro aria-live="polite">
      <p class="terminal-line">&gt; ACCESS GRANTED</p>
      <p class="terminal-line">&gt; IDENTITY OVERRIDDEN</p>
      <p class="terminal-line">&gt; DECRYPTING UNDERGROUND MENU<span class="terminal-cursor">_</span></p>
    </section>
    <section class="blacklist-hero">
      <p class="blacklist-kicker">UNAUTHORIZED ARCHIVE / EST. DORÉ LAB</p>
      <h1>DORÉ LAB <span>//</span><br>BLACKLIST</h1>
      <p class="blacklist-subtitle">THE UNDERGROUND MENU</p>
      <p class="blacklist-copy">Las identidades originales fueron sobrescritas. Todo lo que queda son expedientes, señales y una selección de fórmulas clasificadas.</p>
    </section>
    <section class="blacklist-menu" aria-labelledby="blacklist-menu-title">
      <div class="blacklist-menu-heading">
        <div><p class="blacklist-kicker">DATABASE / RESTRICTED</p><h2 id="blacklist-menu-title">CLASSIFIED ENTRIES</h2></div>
        <p>12 FILES RECOVERED</p>
      </div>
      <div class="blacklist-grid" data-blacklist-grid aria-live="polite" aria-busy="true">
        <p class="blacklist-loading">LOADING ENCRYPTED RECORDS<span class="terminal-cursor">_</span></p>
      </div>
    </section>
    <footer class="blacklist-footer"><span>© DORÉ LAB / INTERNAL ACCESS ONLY</span><span>SESSION EXPIRES AUTOMATICALLY</span></footer>
  </main>
</body>
</html>`;

module.exports = function handler(request, response) {
  setNoStore(response);
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).end();
    return;
  }
  if (!sessionFromRequest(request)) {
    response.setHeader('Location', '/blacklist-access.html');
    response.status(302).end();
    return;
  }
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.status(200).send(document);
};
