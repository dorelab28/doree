(() => {
  const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reducedMotion = !!motionQuery?.matches;

  document.querySelectorAll('.site-header').forEach(header => {
    const nav = header.querySelector('nav'), actions = header.querySelector('.header-actions');
    if (!nav || !actions || header.querySelector('[data-mobile-menu-toggle]')) return;
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.type = 'button';
    toggle.dataset.mobileMenuToggle = '';
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    header.insertBefore(toggle, actions);
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-mobile-menu-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      header.classList.remove('is-mobile-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !header.classList.contains('is-mobile-menu-open')) return;
      header.classList.remove('is-mobile-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    });
  });

  const filters = document.querySelector('[data-cookie-categories]');
  if (filters) {
    const grid = document.querySelector('[data-product-grid]');
    const newGrid = document.querySelector('[data-new-product-grid]');
    const newSection = document.querySelector('[data-new-products-section]');
    const buttons = [...filters.querySelectorAll('[data-cookie-filter]')];
    const applyFilter = value => {
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cookieFilter === value)));
      const isNew = value === 'new';
      if (newSection) newSection.classList.toggle('is-filter-hidden', value !== 'all' && !isNew);
      if (newGrid) newGrid.classList.toggle('is-filter-hidden', value !== 'all' && !isNew);
      if (grid) grid.classList.toggle('is-filter-hidden', isNew);
      [grid, newGrid].filter(Boolean).forEach(productGrid => {
        productGrid.classList.add('is-filtering');
        requestAnimationFrame(() => {
          productGrid.querySelectorAll('[data-view]').forEach(card => {
            const show = value === 'all' || (value === 'new' ? card.classList.contains('is-new-product') : card.dataset.tier === value);
            card.classList.toggle('is-filter-hidden', !show);
            card.setAttribute('aria-hidden', String(!show));
          });
          productGrid.classList.remove('is-filtering');
        });
      });
    };
    buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.cookieFilter)));
  }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealSelector = '.section-heading,.product-card,.boxes,.lab-strip,.budin-card,.budin-order-note';
    const observeReveal = root => {
      const matches = [];
      if (root.matches?.(revealSelector)) matches.push(root);
      root.querySelectorAll?.(revealSelector).forEach(element => matches.push(element));
      matches.forEach(element => {
        if (element.dataset.revealObserved) return;
        element.dataset.revealObserved = 'true';
        element.classList.add('scroll-reveal');
        revealObserver.observe(element);
      });
    };
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    document.documentElement.classList.add('motion-ready');
    observeReveal(document);
    const productGrids = document.querySelectorAll('[data-product-grid],[data-new-product-grid],[data-budin-grid]');
    if (productGrids.length) new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) observeReveal(node);
    }))).observe(document.body, { childList: true, subtree: true });
  }
})();
