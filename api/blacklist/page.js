const { setNoStore } = require('../_blacklist');

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
  <canvas class="blacklist-matrix" data-blacklist-matrix aria-hidden="true"></canvas>
  <div class="blacklist-noise" aria-hidden="true"></div>
  <main class="blacklist-shell">
    <header class="blacklist-header">
      <a class="blacklist-mark" href="/" aria-label="Volver a Doré Lab">DORÉ LAB<span>//</span> BLACKLIST</a>
      <div class="blacklist-status" aria-label="Estado del sistema"><i></i> PUBLIC ARCHIVE / OPEN</div>
      <div class="blacklist-header-actions">
        <button class="blacklist-order-trigger" type="button" data-blacklist-open-cart aria-label="Abrir buffer demostrativo">DEMO BUFFER <b data-blacklist-cart-count>00</b></button>
      </div>
    </header>
    <section class="blacklist-intro" data-blacklist-intro aria-live="polite">
      <p class="terminal-line">&gt; PUBLIC ARCHIVE OPEN</p>
      <p class="terminal-line">&gt; RECORDS AVAILABLE</p>
      <p class="terminal-line">&gt; DECRYPTING UNDERGROUND MENU<span class="terminal-cursor">_</span></p>
    </section>
    <section class="blacklist-notice" aria-labelledby="blacklist-notice-title">
      <div class="blacklist-notice-heading">
        <p class="blacklist-kicker">◈ INFORMATIONAL ARCHIVE</p>
        <h2 id="blacklist-notice-title">BLACKLIST // SPECIAL PRODUCT NOTICE</h2>
        <span class="blacklist-demo-badge">STATUS: DEMO MODE — ORDERS DISABLED</span>
      </div>
      <p class="blacklist-notice-copy">Esta sección está destinada a presentar una línea conceptual de cookies con THC (tetrahidrocannabinol), el componente psicoactivo del cannabis, también conocido como marihuana. Los efectos de los comestibles pueden tardar en aparecer, variar entre personas y prolongarse durante varias horas. No conduzcas ni combines estos productos con alcohol. Mantenelos fuera del alcance de niños y mascotas.</p>
      <div class="blacklist-advance-notice"><span aria-hidden="true">◷</span><div><b>ADVANCE NOTICE: 72 HOURS</b><p>Los pedidos de esta línea requieren un mínimo de 3 días de anticipación. Este plazo es una condición prevista para el concepto de BLACKLIST y no constituye una confirmación de disponibilidad ni de aceptación del pedido.</p></div></div>
      <details class="blacklist-safety-info"><summary>SAFETY INFORMATION <span>+</span></summary><div><ul><li>Los efectos pueden tardar en aparecer y variar según la persona y el producto. No consumas más porque el efecto no se perciba inmediatamente.</li><li>No conduzcas ni operes maquinaria bajo sus efectos. No combines con alcohol ni otras sustancias psicoactivas.</li><li>Conservá los productos fuera del alcance de niños y mascotas.</li><li>Los ingredientes y alérgenos se informan solamente cuando estén verificados. No se publican concentraciones, resultados de laboratorio ni garantías individuales sin documentación.</li></ul></div></details>
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
    <footer class="blacklist-footer"><span>© DORÉ LAB / PUBLIC ARCHIVE</span><span>DEMO MODE / ORDERS DISABLED</span></footer>
  </main>
  <aside class="blacklist-cart" data-blacklist-cart aria-hidden="true" aria-label="Mi pedido BLACKLIST">
    <header class="blacklist-panel-header"><div><p>REFERENCE BUFFER / DEMO</p><h2>MY DEMO</h2></div><button type="button" data-blacklist-close-cart aria-label="Cerrar buffer demostrativo">×</button></header>
    <div class="blacklist-cart-items" data-blacklist-cart-items></div>
    <div class="blacklist-cart-empty" data-blacklist-cart-empty><span>∅</span><b>NO DEMO FILES QUEUED</b><p>Abrí un expediente y elegí una variante demostrativa.</p></div>
    <footer class="blacklist-cart-footer" data-blacklist-cart-footer>
      <div class="blacklist-cart-meta"><span>TOTAL UNITS</span><b data-blacklist-cart-units>00</b></div>
      <div class="blacklist-cart-total"><span>ILLUSTRATIVE TOTAL</span><b data-blacklist-cart-total>$0</b></div>
      <button class="blacklist-clear-cart" type="button" data-blacklist-clear-cart>EMPTY BUFFER</button>
      <button class="blacklist-checkout-disabled" type="button" disabled>ORDERS LOCKED — DEMO MODE</button>
      <p>ADVANCE NOTICE: 72 HOURS. Es una condición conceptual, no una confirmación de disponibilidad. Las operaciones comerciales, pagos y envíos permanecen deshabilitados.</p>
    </footer>
  </aside>
  <div class="blacklist-overlay" data-blacklist-overlay></div>
  <dialog class="blacklist-detail" data-blacklist-detail aria-labelledby="blacklist-detail-title">
    <button class="blacklist-dialog-close" type="button" data-blacklist-close-detail aria-label="Cerrar ficha">×</button>
    <div data-blacklist-detail-content></div>
  </dialog>
  <p class="blacklist-toast" data-blacklist-toast role="status" aria-live="polite"></p>
</body>
</html>`;

module.exports = function handler(request, response) {
  setNoStore(response);
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).end();
    return;
  }
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.status(200).send(document);
};
