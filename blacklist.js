(() => {
  const grid = document.querySelector('[data-blacklist-grid]');
  const intro = document.querySelector('[data-blacklist-intro]');
  const logout = document.querySelector('[data-blacklist-logout]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

  const requestSample = (entry) => {
    const text = `Hola Doré Lab. Quiero consultar por el expediente BLACKLIST ${entry.caseId} — ${entry.identity}.`;
    window.open(`https://wa.me/5491135231567?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const renderCatalog = catalog => {
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = catalog.map((entry, index) => `
      <article class="blacklist-card" style="--entry-index:${index}" data-blacklist-entry="${escapeHTML(entry.id)}">
        <div class="blacklist-image"><img src="/${escapeHTML(entry.image)}" alt="Archivo visual ${escapeHTML(entry.caseId)}" loading="lazy"><span class="blacklist-image-scan" aria-hidden="true"></span></div>
        <div class="blacklist-card-copy">
          <div class="blacklist-card-top"><small>${escapeHTML(entry.classification)}</small><span>${escapeHTML(entry.status)}</span></div>
          <p class="blacklist-case">CASE // ${escapeHTML(entry.caseId)}</p>
          <h3>${escapeHTML(entry.identity)}</h3>
          <p class="blacklist-profile">${escapeHTML(entry.profile)}</p>
          <div class="blacklist-card-bottom"><b>${money(entry.price)}</b><button type="button" data-blacklist-request="${index}">REQUEST FILE <span aria-hidden="true">↗</span></button></div>
        </div>
      </article>`).join('');

    grid.querySelectorAll('[data-blacklist-request]').forEach(button => {
      button.addEventListener('click', () => requestSample(catalog[Number(button.dataset.blacklistRequest)]));
    });
  };

  const loadCatalog = async () => {
    try {
      const response = await fetch('/api/blacklist/catalog', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
      if (response.status === 401) {
        window.location.replace('/blacklist-access.html');
        return;
      }
      if (!response.ok) throw new Error('catalog unavailable');
      const payload = await response.json();
      if (!Array.isArray(payload.catalog)) throw new Error('invalid catalog');
      renderCatalog(payload.catalog);
    } catch {
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = '<p class="blacklist-loading is-error">CONNECTION INTERRUPTED. RELOAD TO RETRY.</p>';
    }
  };

  const runIntro = () => {
    if (reduceMotion) {
      intro?.classList.add('is-complete');
      loadCatalog();
      return;
    }
    window.setTimeout(() => intro?.classList.add('is-complete'), 760);
    window.setTimeout(loadCatalog, 390);
  };

  logout?.addEventListener('click', async () => {
    logout.disabled = true;
    try {
      await fetch('/api/blacklist/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
    } finally {
      window.location.replace('/blacklist-access.html');
    }
  });

  runIntro();
})();
