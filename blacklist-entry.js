(() => {
  const addEntryPoint = () => {
    const headerActions = document.querySelector('.site-header .header-actions');
    const catalogLink = document.querySelector('.site-header .antojo-catalog-link');
    const target = headerActions || catalogLink;
    if (!target || document.querySelector('[data-blacklist-entry]')) return;

    const link = document.createElement('a');
    link.href = '/blacklist';
    link.className = 'blacklist-entry';
    link.dataset.blacklistEntry = '';
    link.setAttribute('aria-label', 'Abrir BLACKLIST');
    link.title = 'Abrir BLACKLIST';
    link.innerHTML = '<img src="assets/blacklist-detective-cookie.svg" width="44" height="44" alt="" aria-hidden="true">';
    if (headerActions) headerActions.prepend(link);
    else catalogLink.before(link);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addEntryPoint, { once: true });
  else addEntryPoint();
})();
