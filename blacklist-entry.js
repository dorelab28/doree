(() => {
  const addEntryPoint = () => {
    const headerActions = document.querySelector('.site-header .header-actions');
    const catalogLink = document.querySelector('.site-header .antojo-catalog-link');
    const target = headerActions || catalogLink;
    if (!target || document.querySelector('[data-blacklist-entry]')) return;

    const link = document.createElement('a');
    link.href = 'blacklist-access.html';
    link.className = 'blacklist-entry';
    link.dataset.blacklistEntry = '';
    link.setAttribute('aria-label', 'Acceso privado');
    link.title = 'Acceso privado';
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5Zm0 1.5a7.75 7.75 0 0 1 7.1 10.84 3.25 3.25 0 0 0-3.9-1.14 3.25 3.25 0 0 0-6.4 0 3.25 3.25 0 0 0-3.9 1.14A7.75 7.75 0 0 1 12 4.25ZM7.75 10.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm8.5 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm-4.25 4.3a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7Z"/></svg>';
    if (headerActions) headerActions.prepend(link);
    else catalogLink.before(link);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addEntryPoint, { once: true });
  else addEntryPoint();
})();
