(() => {
  const grid = document.querySelector('[data-blacklist-grid]');
  const intro = document.querySelector('[data-blacklist-intro]');
  const cartPanel = document.querySelector('[data-blacklist-cart]');
  const overlay = document.querySelector('[data-blacklist-overlay]');
  const detailDialog = document.querySelector('[data-blacklist-detail]');
  const detailContent = document.querySelector('[data-blacklist-detail-content]');
  const toast = document.querySelector('[data-blacklist-toast]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CART_STORAGE_KEY = 'dorelab-blacklist-demo-cart-v2';
  const LEGACY_CART_STORAGE_KEY = 'dorelab-blacklist-cart-v1';
  let catalog = [];
  let demoLevels = [];
  let cart = [];
  let activeDetailId = null;
  let activeLevelId = null;
  let activeDetailQuantity = 1;
  let toastTimer;

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const money = value => Number.isFinite(value)
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
    : 'PENDING REVIEW';
  const entryById = id => catalog.find(entry => entry.id === id);
  const levelById = id => demoLevels.find(level => level.id === id);
  const defaultLevel = () => demoLevels[0] || null;
  const demoPrice = (entry, levelId) => {
    const level = levelById(levelId);
    return entry && level && Number.isFinite(entry.price) ? entry.price + level.priceAdjustment : null;
  };
  const unitCount = () => cart.reduce((count, item) => count + item.qty, 0);
  const total = () => cart.reduce((sum, item) => sum + (demoPrice(entryById(item.id), item.levelId) || 0) * item.qty, 0);
  const validCartItem = item => item && typeof item.id === 'string' && entryById(item.id)
    && levelById(item.levelId) && Number.isInteger(item.qty) && item.qty > 0;

  const readCart = () => {
    try {
      const serialized = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_CART_STORAGE_KEY) || '[]';
      const saved = JSON.parse(serialized);
      const fallbackLevelId = defaultLevel()?.id;
      cart = Array.isArray(saved) ? saved
        .map(item => ({ id: item?.id, levelId: item?.levelId || fallbackLevelId, qty: item?.qty }))
        .filter(validCartItem) : [];
    } catch {
      cart = [];
    }
  };

  const persistCart = () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  };

  const showToast = message => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
  };

  const renderCart = () => {
    cart = cart.filter(validCartItem);
    persistCart();
    const units = unitCount();
    document.querySelectorAll('[data-blacklist-cart-count], [data-blacklist-cart-units]').forEach(element => {
      element.textContent = String(units).padStart(2, '0');
    });
    const items = document.querySelector('[data-blacklist-cart-items]');
    const empty = document.querySelector('[data-blacklist-cart-empty]');
    const footer = document.querySelector('[data-blacklist-cart-footer]');
    if (items) {
      items.innerHTML = cart.map(item => {
        const entry = entryById(item.id);
        const level = levelById(item.levelId);
        const price = demoPrice(entry, item.levelId);
        if (!entry || !level || !Number.isFinite(price)) return '';
        return `<article class="blacklist-cart-item">
          <img src="/${escapeHTML(entry.image)}" alt="Cookie ${escapeHTML(entry.originalName)}">
          <div class="blacklist-cart-item-copy"><p>${escapeHTML(entry.caseId)} // DEMO VARIANT</p><h3><s>${escapeHTML(entry.originalName)}</s> <span>${escapeHTML(entry.alias)}</span></h3><strong class="blacklist-cart-level">${escapeHTML(level.code)} — ${escapeHTML(level.label)}</strong><small>BASE REFERENCE // ${money(entry.price)}<br>DEMO ADD-ON // +${money(level.priceAdjustment)}<br>LINE TOTAL // ${money(price * item.qty)}</small></div>
          <div class="blacklist-quantity" aria-label="Cantidad de ${escapeHTML(entry.alias)}, nivel ${escapeHTML(level.label)}"><button type="button" data-blacklist-cart-action="decrement" data-blacklist-id="${escapeHTML(entry.id)}" data-blacklist-level="${escapeHTML(level.id)}" aria-label="Restar ${escapeHTML(entry.alias)} ${escapeHTML(level.label)}">−</button><b>${item.qty}</b><button type="button" data-blacklist-cart-action="increment" data-blacklist-id="${escapeHTML(entry.id)}" data-blacklist-level="${escapeHTML(level.id)}" aria-label="Sumar ${escapeHTML(entry.alias)} ${escapeHTML(level.label)}">+</button><button class="blacklist-remove" type="button" data-blacklist-cart-action="remove" data-blacklist-id="${escapeHTML(entry.id)}" data-blacklist-level="${escapeHTML(level.id)}">REMOVE</button></div>
        </article>`;
      }).join('');
    }
    if (empty) empty.hidden = cart.length > 0;
    if (footer) footer.hidden = cart.length === 0;
    const totalElement = document.querySelector('[data-blacklist-cart-total]');
    if (totalElement) totalElement.textContent = money(total());
  };

  const changeQuantity = (id, levelId, amount) => {
    if (!entryById(id) || !levelById(levelId)) return;
    const item = cart.find(entry => entry.id === id && entry.levelId === levelId);
    if (!item && amount > 0) cart.push({ id, levelId, qty: amount });
    else if (item) {
      item.qty += amount;
      if (item.qty <= 0) cart = cart.filter(entry => entry !== item);
    }
    renderCart();
  };

  const addToCart = (id, levelId, amount = 1) => {
    const entry = entryById(id);
    const level = levelById(levelId);
    if (!entry || !level) return;
    changeQuantity(id, levelId, amount);
    showToast(`${entry.alias} // ${level.label} DEMO VARIANT ADDED`);
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
          <div class="blacklist-card-top"><small>${escapeHTML(entry.classification)}</small><span>DEMO MODE</span></div>
          <p class="blacklist-case">${escapeHTML(entry.caseId)}</p>
          <h3>${nameMarkup(entry)}</h3>
          <p class="blacklist-profile">${escapeHTML(entry.description)}</p>
          <div class="blacklist-card-bottom"><b>BASE // ${money(entry.price)}</b><div><button type="button" data-blacklist-view="${escapeHTML(entry.id)}">VIEW DEMO FILE</button></div></div>
        </div>
      </article>`).join('');
  };

  const levelOptionsMarkup = entry => demoLevels.map(level => `<label class="blacklist-level-option" data-blacklist-level-option="${escapeHTML(level.id)}"><input type="radio" name="blacklist-intensity" value="${escapeHTML(level.id)}" data-blacklist-level ${level.id === activeLevelId ? 'checked' : ''}><span class="blacklist-level-code">${escapeHTML(level.code)}</span><strong>${escapeHTML(level.label)}</strong><small>${escapeHTML(level.description)}</small><em>+${money(level.priceAdjustment)}</em><b>${money(demoPrice(entry, level.id))}</b></label>`).join('');

  const updateDetailVariant = () => {
    const entry = entryById(activeDetailId);
    const level = levelById(activeLevelId);
    const price = demoPrice(entry, activeLevelId);
    if (!entry || !level || !Number.isFinite(price)) return;
    detailContent?.querySelectorAll('[data-blacklist-level-option]').forEach(option => {
      const selected = option.dataset.blacklistLevelOption === activeLevelId;
      option.classList.toggle('is-selected', selected);
      const input = option.querySelector('input');
      if (input) input.checked = selected;
    });
    const levelLabel = detailContent?.querySelector('[data-blacklist-detail-level-label]');
    const addOn = detailContent?.querySelector('[data-blacklist-detail-addon]');
    const totalElement = detailContent?.querySelector('[data-blacklist-detail-total]');
    if (levelLabel) levelLabel.textContent = `${level.code} — ${level.label}`;
    if (addOn) addOn.textContent = `+${money(level.priceAdjustment)}`;
    if (totalElement) totalElement.textContent = money(price);
  };

  const showDetail = id => {
    const entry = entryById(id);
    const defaultDemoLevel = defaultLevel();
    if (!entry || !defaultDemoLevel || !detailDialog || !detailContent) return;
    activeDetailId = id;
    activeLevelId = defaultDemoLevel.id;
    activeDetailQuantity = 1;
    detailContent.innerHTML = `<div class="blacklist-detail-layout">
      <div class="blacklist-detail-image"><img src="/${escapeHTML(entry.image)}" alt="Cookie ${escapeHTML(entry.originalName)}"><span>ARCHIVE IMAGE // ORIGINAL</span></div>
      <div class="blacklist-detail-copy"><div class="blacklist-detail-meta"><p class="blacklist-case">${escapeHTML(entry.caseId)}</p><span class="blacklist-demo-badge">DEMO VARIANT</span></div><h2 id="blacklist-detail-title">${nameMarkup(entry)}</h2><p class="blacklist-detail-description">${escapeHTML(entry.description)}</p>
        <dl class="blacklist-dossier"><div><dt>FORMULA / ORIGINAL</dt><dd>${escapeHTML(entry.formula)}</dd></div><div><dt>ALLERGENS / STATUS</dt><dd>${escapeHTML(entry.allergenNotice)}</dd></div><div><dt>BASE REFERENCE / PUBLIC × 2</dt><dd class="blacklist-detail-price">${money(entry.price)}</dd></div></dl>
        <section class="blacklist-intensity" aria-labelledby="blacklist-intensity-title"><div class="blacklist-intensity-heading"><div><p>VISUAL DEMO CONTROLS</p><h3 id="blacklist-intensity-title">SELECT INTENSITY</h3></div><span>NO VERIFIED DOSE</span></div><div class="blacklist-levels">${levelOptionsMarkup(entry)}</div><div class="blacklist-demo-total"><div><span>SELECTED VARIANT</span><b data-blacklist-detail-level-label></b></div><div><span>DEMO ADD-ON</span><b data-blacklist-detail-addon></b></div><div><span>ILLUSTRATIVE TOTAL</span><strong data-blacklist-detail-total></strong></div></div></section>
        <details class="blacklist-detail-safety" open><summary>SAFETY INFORMATION</summary><p>Los efectos pueden tardar en aparecer y variar. No consumas más porque no percibas un efecto inmediato; no conduzcas ni combines con alcohol u otras sustancias psicoactivas. Conservá el producto lejos de niños y mascotas. Ingredientes y alérgenos sólo se confirman cuando estén verificados.</p></details>
        <p class="blacklist-demo-notice">STATUS: DEMO MODE — ORDERS, PAYMENTS AND DELIVERY DISABLED. ADVANCE NOTICE: 72 HOURS is a conceptual condition, not availability confirmation.</p>
        <div class="blacklist-detail-buy"><div class="blacklist-quantity" aria-label="Cantidad de variante demostrativa"><button type="button" data-blacklist-detail-change="-1" aria-label="Reducir cantidad">−</button><b data-blacklist-detail-quantity>1</b><button type="button" data-blacklist-detail-change="1" aria-label="Aumentar cantidad">+</button></div><button class="blacklist-add-detail" type="button" data-blacklist-add-detail>+ ADD DEMO VARIANT</button></div>
      </div>
    </div>`;
    updateDetailVariant();
    if (!detailDialog.open) detailDialog.showModal();
    document.body.classList.add('blacklist-lock-scroll');
  };

  const closeDetail = () => {
    if (detailDialog?.open) detailDialog.close();
    activeDetailId = null;
    activeLevelId = null;
    if (!cartPanel?.classList.contains('is-open')) document.body.classList.remove('blacklist-lock-scroll');
  };

  const loadCatalog = async () => {
    try {
      const response = await fetch('/api/blacklist/catalog', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('catalog unavailable');
      const payload = await response.json();
      if (!Array.isArray(payload.catalog) || !Array.isArray(payload.demoLevels)) throw new Error('invalid catalog');
      catalog = payload.catalog;
      demoLevels = payload.demoLevels.filter(level => level && typeof level.id === 'string' && Number.isFinite(level.priceAdjustment));
      if (!defaultLevel()) throw new Error('invalid demo levels');
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
      columns = Array.from({ length: count }, (_, index) => ({ x: index * size, y: Math.random() * -height, speed: 0.45 + Math.random() * 1.35, opacity: 0.12 + Math.random() * 0.4, trail: 4 + Math.floor(Math.random() * 12) }));
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
    const view = event.target.closest('[data-blacklist-view]');
    if (view) showDetail(view.dataset.blacklistView);
  });
  document.querySelector('[data-blacklist-open-cart]')?.addEventListener('click', openCart);
  document.querySelector('[data-blacklist-close-cart]')?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  document.querySelector('[data-blacklist-clear-cart]')?.addEventListener('click', () => {
    cart = [];
    renderCart();
    showToast('DEMO BUFFER // EMPTIED');
  });
  cartPanel?.addEventListener('click', event => {
    const control = event.target.closest('[data-blacklist-cart-action]');
    if (!control) return;
    const { blacklistId: id, blacklistLevel: levelId, blacklistCartAction: action } = control.dataset;
    if (action === 'increment') changeQuantity(id, levelId, 1);
    if (action === 'decrement') changeQuantity(id, levelId, -1);
    if (action === 'remove') {
      cart = cart.filter(item => item.id !== id || item.levelId !== levelId);
      renderCart();
    }
  });
  document.querySelector('[data-blacklist-close-detail]')?.addEventListener('click', closeDetail);
  detailDialog?.addEventListener('click', event => {
    if (event.target === detailDialog) closeDetail();
    const delta = event.target.closest('[data-blacklist-detail-change]');
    if (delta) {
      activeDetailQuantity = Math.max(1, activeDetailQuantity + Number(delta.dataset.blacklistDetailChange));
      const quantity = detailContent?.querySelector('[data-blacklist-detail-quantity]');
      if (quantity) quantity.textContent = String(activeDetailQuantity);
    }
    if (event.target.closest('[data-blacklist-add-detail]') && activeDetailId && activeLevelId) addToCart(activeDetailId, activeLevelId, activeDetailQuantity);
  });
  detailDialog?.addEventListener('change', event => {
    const levelInput = event.target.closest('[data-blacklist-level]');
    if (!levelInput || !levelById(levelInput.value)) return;
    activeLevelId = levelInput.value;
    updateDetailVariant();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeCart();
      if (detailDialog?.open) closeDetail();
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
