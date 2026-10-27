(() => {
  const grid = document.querySelector('[data-blacklist-grid]');
  const intro = document.querySelector('[data-blacklist-intro]');
  const logout = document.querySelector('[data-blacklist-logout]');
  const cartPanel = document.querySelector('[data-blacklist-cart]');
  const overlay = document.querySelector('[data-blacklist-overlay]');
  const detailDialog = document.querySelector('[data-blacklist-detail]');
  const detailContent = document.querySelector('[data-blacklist-detail-content]');
  const toast = document.querySelector('[data-blacklist-toast]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CART_STORAGE_KEY = 'dorelab-blacklist-cart-v1';
  let catalog = [];
  let cart = [];
  let activeDetailId = null;
  let toastTimer;

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const money = value => Number.isFinite(value)
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
    : 'PENDING REVIEW';
  const entryById = id => catalog.find(entry => entry.id === id);
  const unitCount = () => cart.reduce((total, item) => total + item.qty, 0);
  const total = () => cart.reduce((sum, item) => sum + (entryById(item.id)?.price || 0) * item.qty, 0);

  const readCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      cart = Array.isArray(saved) ? saved
        .filter(item => item && typeof item.id === 'string' && Number.isInteger(item.qty) && item.qty > 0)
        .map(item => ({ id: item.id, qty: item.qty })) : [];
    } catch {
      cart = [];
    }
  };

  const persistCart = () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  };

  const showToast = message => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
  };

  const renderCart = () => {
    cart = cart.filter(item => entryById(item.id));
    persistCart();
    const units = unitCount();
    document.querySelectorAll('[data-blacklist-cart-count]').forEach(element => {
      element.textContent = String(units).padStart(2, '0');
    });
    document.querySelectorAll('[data-blacklist-cart-units]').forEach(element => {
      element.textContent = String(units).padStart(2, '0');
    });
    const items = document.querySelector('[data-blacklist-cart-items]');
    const empty = document.querySelector('[data-blacklist-cart-empty]');
    const footer = document.querySelector('[data-blacklist-cart-footer]');
    if (items) {
      items.innerHTML = cart.map(item => {
        const entry = entryById(item.id);
        if (!entry) return '';
        return `<article class="blacklist-cart-item">
          <img src="/${escapeHTML(entry.image)}" alt="${escapeHTML(entry.originalName)}">
          <div class="blacklist-cart-item-copy"><p>${escapeHTML(entry.caseId)}</p><h3><s>${escapeHTML(entry.originalName)}</s> <span>${escapeHTML(entry.alias)}</span></h3><b>${money(entry.price)}</b><small>SUBTOTAL // ${money(entry.price * item.qty)}</small></div>
          <div class="blacklist-quantity" aria-label="Cantidad de ${escapeHTML(entry.alias)}"><button type="button" data-blacklist-cart-action="decrement" data-blacklist-id="${escapeHTML(entry.id)}" aria-label="Restar ${escapeHTML(entry.alias)}">−</button><b>${item.qty}</b><button type="button" data-blacklist-cart-action="increment" data-blacklist-id="${escapeHTML(entry.id)}" aria-label="Sumar ${escapeHTML(entry.alias)}">+</button><button class="blacklist-remove" type="button" data-blacklist-cart-action="remove" data-blacklist-id="${escapeHTML(entry.id)}">REMOVE</button></div>
        </article>`;
      }).join('');
    }
    if (empty) empty.hidden = cart.length > 0;
    if (footer) footer.hidden = cart.length === 0;
    const totalElement = document.querySelector('[data-blacklist-cart-total]');
    if (totalElement) totalElement.textContent = money(total());
  };

  const changeQuantity = (id, amount) => {
    const item = cart.find(entry => entry.id === id);
    if (!entryById(id)) return;
    if (!item && amount > 0) cart.push({ id, qty: amount });
    else if (item) {
      item.qty += amount;
      if (item.qty <= 0) cart = cart.filter(entry => entry !== item);
    }
    renderCart();
  };

  const addToCart = (id, amount = 1) => {
    if (!entryById(id)) return;
    changeQuantity(id, amount);
    showToast(`${entryById(id).alias} // ADDED TO ORDER`);
  };

  const openCart = () => {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.add('is-open');
    overlay.classList.add('is-open');
    cartPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('blacklist-lock-scroll');
  };

  const closeCart = () => {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.remove('is-open');
    overlay.classList.remove('is-open');
    cartPanel.setAttribute('aria-hidden', 'true');
    if (!detailDialog?.open) document.body.classList.remove('blacklist-lock-scroll');
  };

  const nameMarkup = entry => `<s>${escapeHTML(entry.originalName)}</s> <span>${escapeHTML(entry.alias)}</span>`;

  const renderCatalog = records => {
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = records.map((entry, index) => `
      <article class="blacklist-card" style="--entry-index:${index}" data-blacklist-entry="${escapeHTML(entry.id)}">
        <button class="blacklist-image blacklist-file-button" type="button" data-blacklist-view="${escapeHTML(entry.id)}" aria-label="Abrir ficha de ${escapeHTML(entry.alias)}"><img src="/${escapeHTML(entry.image)}" alt="Cookie ${escapeHTML(entry.originalName)}" loading="lazy"><span class="blacklist-image-scan" aria-hidden="true"></span></button>
        <div class="blacklist-card-copy">
          <div class="blacklist-card-top"><small>${escapeHTML(entry.classification)}</small><span>${escapeHTML(entry.status)}</span></div>
          <p class="blacklist-case">${escapeHTML(entry.caseId)}</p>
          <h3>${nameMarkup(entry)}</h3>
          <p class="blacklist-profile">${escapeHTML(entry.description)}</p>
          <div class="blacklist-card-bottom"><b>${money(entry.price)}</b><div><button type="button" data-blacklist-view="${escapeHTML(entry.id)}">VIEW FILE</button><button class="blacklist-add" type="button" data-blacklist-add="${escapeHTML(entry.id)}">+ ADD TO CART</button></div></div>
        </div>
      </article>`).join('');
  };

  const showDetail = id => {
    const entry = entryById(id);
    if (!entry || !detailDialog || !detailContent) return;
    activeDetailId = id;
    detailContent.innerHTML = `<div class="blacklist-detail-layout">
      <div class="blacklist-detail-image"><img src="/${escapeHTML(entry.image)}" alt="Cookie ${escapeHTML(entry.originalName)}"><span>ARCHIVE IMAGE // ORIGINAL</span></div>
      <div class="blacklist-detail-copy"><p class="blacklist-case">${escapeHTML(entry.caseId)}</p><h2 id="blacklist-detail-title">${nameMarkup(entry)}</h2><p class="blacklist-detail-description">${escapeHTML(entry.description)}</p>
        <dl class="blacklist-dossier"><div><dt>FORMULA / ORIGINAL</dt><dd>${escapeHTML(entry.formula)}</dd></div><div><dt>ALLERGENS / STATUS</dt><dd>${escapeHTML(entry.allergenNotice)}</dd></div><div><dt>REFERENCE PRICE</dt><dd class="blacklist-detail-price">${money(entry.price)}</dd></div></dl>
        <p class="blacklist-demo-notice">DEMO MODE // No se habilitan pedidos, pagos ni procesamiento comercial.</p>
        <div class="blacklist-detail-buy"><div class="blacklist-quantity"><button type="button" data-blacklist-detail-change="-1" aria-label="Reducir cantidad">−</button><b data-blacklist-detail-quantity>1</b><button type="button" data-blacklist-detail-change="1" aria-label="Aumentar cantidad">+</button></div><button class="blacklist-add-detail" type="button" data-blacklist-add-detail>+ ADD TO CART</button></div>
      </div>
    </div>`;
    if (!detailDialog.open) detailDialog.showModal();
    document.body.classList.add('blacklist-lock-scroll');
  };

  const closeDetail = () => {
    if (detailDialog?.open) detailDialog.close();
    activeDetailId = null;
    if (!cartPanel?.classList.contains('is-open')) document.body.classList.remove('blacklist-lock-scroll');
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
      catalog = payload.catalog;
      readCart();
      renderCatalog(catalog);
      renderCart();
    } catch {
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = '<p class="blacklist-loading is-error">CONNECTION INTERRUPTED. RELOAD TO RETRY.</p>';
    }
  };

  const initMatrix = () => {
    const canvas = document.querySelector('[data-blacklist-matrix]');
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    const symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-<>/{}[]';
    let columns = [];
    let frame = 0;
    let running = !document.hidden;
    let width = 0;
    let height = 0;
    let size = 15;

    const buildColumns = () => {
      const count = Math.max(1, Math.ceil(width / size));
      columns = Array.from({ length: count }, (_, index) => ({
        x: index * size,
        y: Math.random() * -height,
        speed: 0.45 + Math.random() * 1.35,
        opacity: 0.12 + Math.random() * 0.4,
        trail: 4 + Math.floor(Math.random() * 12)
      }));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      size = width < 620 ? 12 : 15;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      buildColumns();
      draw(true);
    };

    const draw = staticFrame => {
      context.fillStyle = staticFrame ? 'rgba(3,6,4,.58)' : 'rgba(3,6,4,.15)';
      context.fillRect(0, 0, width, height);
      context.font = `${size - 2}px ui-monospace, SFMono-Regular, Consolas, monospace`;
      columns.forEach(column => {
        for (let trailIndex = 0; trailIndex < column.trail; trailIndex += 1) {
          const y = column.y - trailIndex * size;
          if (y < -size || y > height + size) continue;
          const strength = column.opacity * (1 - trailIndex / (column.trail + 1));
          context.fillStyle = trailIndex === 0 ? `rgba(57,255,136,${Math.min(.94, strength + .42)})` : `rgba(0,255,102,${strength})`;
          context.fillText(symbols[Math.floor(Math.random() * symbols.length)], column.x, y);
        }
        if (!staticFrame) {
          column.y += column.speed * size;
          if (column.y - column.trail * size > height) {
            column.y = Math.random() * -height * .35;
            column.speed = 0.45 + Math.random() * 1.35;
          }
        }
      });
    };

    const tick = () => {
      if (!running || reducedMotion.matches) return;
      draw(false);
      frame = window.requestAnimationFrame(tick);
    };

    const setMotion = () => {
      window.cancelAnimationFrame(frame);
      if (reducedMotion.matches) draw(true);
      else if (running) frame = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      running = !document.hidden;
      window.cancelAnimationFrame(frame);
      if (running) setMotion();
    };

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener?.('change', setMotion);
    window.addEventListener('pagehide', () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener?.('change', setMotion);
    }, { once: true });
    resize();
    setMotion();
  };

  grid?.addEventListener('click', event => {
    const add = event.target.closest('[data-blacklist-add]');
    if (add) {
      addToCart(add.dataset.blacklistAdd);
      return;
    }
    const view = event.target.closest('[data-blacklist-view]');
    if (view) showDetail(view.dataset.blacklistView);
  });

  document.querySelector('[data-blacklist-open-cart]')?.addEventListener('click', openCart);
  document.querySelector('[data-blacklist-close-cart]')?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  document.querySelector('[data-blacklist-clear-cart]')?.addEventListener('click', () => {
    cart = [];
    renderCart();
    showToast('ORDER BUFFER // EMPTIED');
  });
  cartPanel?.addEventListener('click', event => {
    const control = event.target.closest('[data-blacklist-cart-action]');
    if (!control) return;
    const id = control.dataset.blacklistId;
    const action = control.dataset.blacklistCartAction;
    if (action === 'increment') changeQuantity(id, 1);
    if (action === 'decrement') changeQuantity(id, -1);
    if (action === 'remove') {
      cart = cart.filter(item => item.id !== id);
      renderCart();
    }
  });
  document.querySelector('[data-blacklist-close-detail]')?.addEventListener('click', closeDetail);
  detailDialog?.addEventListener('click', event => {
    if (event.target === detailDialog) closeDetail();
    const delta = event.target.closest('[data-blacklist-detail-change]');
    if (delta) {
      const quantity = document.querySelector('[data-blacklist-detail-quantity]');
      if (quantity) quantity.textContent = Math.max(1, Number(quantity.textContent) + Number(delta.dataset.blacklistDetailChange));
    }
    if (event.target.closest('[data-blacklist-add-detail]') && activeDetailId) {
      const quantity = Number(document.querySelector('[data-blacklist-detail-quantity]')?.textContent || 1);
      addToCart(activeDetailId, quantity);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeCart();
      if (detailDialog?.open) closeDetail();
    }
  });

  logout?.addEventListener('click', async () => {
    logout.disabled = true;
    try {
      await fetch('/api/blacklist/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
    } finally {
      window.location.replace('/blacklist-access.html');
    }
  });

  const runIntro = () => {
    if (reducedMotion.matches) {
      intro?.classList.add('is-complete');
      loadCatalog();
      return;
    }
    window.setTimeout(() => intro?.classList.add('is-complete'), 760);
    window.setTimeout(loadCatalog, 390);
  };

  initMatrix();
  runIntro();
})();
