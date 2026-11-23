(() => {
  const catalog = window.DoreBudines, grid = document.querySelector('[data-budin-grid]');
  if (!catalog || !grid) return;
  const render = () => {
    const selectedSizes = Object.fromEntries([...grid.querySelectorAll('[data-size-for]')].map(select => [select.dataset.sizeFor, select.value]));
    grid.innerHTML = catalog.flavors.map(flavor => `<article class="budin-card">
      <div class="budin-card-image"><img src="${flavor.image}" alt="Budín ${flavor.name}" data-budin-photo loading="lazy"><span>DORÉ LAB · ${flavor.name.toUpperCase()}</span><div class="budin-photo-switch"><button type="button" data-photo-flavor="${flavor.id}" data-photo-index="0" aria-pressed="true">Budín</button><button type="button" data-photo-flavor="${flavor.id}" data-photo-index="1" aria-pressed="false">Interior</button></div></div>
      <div class="budin-card-body"><p class="eyebrow">HORNEADO ARTESANAL</p><h3>Budín de ${flavor.name}</h3><p class="budin-description">${flavor.description}</p><p class="budin-filling"><b>Relleno y cobertura</b><br>${flavor.filling}</p>
        <label class="budin-size-label" for="size-${flavor.id}">Presentación</label><select id="size-${flavor.id}" data-size-for="${flavor.id}">${catalog.sizes.map(size => `<option value="${size.id}">${size.name} · ${new Intl.NumberFormat('es-AR').format(size.weight)} g aprox.</option>`).join('')}</select>
        <div class="budin-card-bottom"><div><span>Precio</span><b data-price-for="${flavor.id}">${catalog.money(flavor.prices.small)}</b></div><button class="button primary" type="button" data-add-budin="${flavor.id}">Agregar al pedido</button></div><small class="budin-dimensions" data-dimensions-for="${flavor.id}">${catalog.sizes[0].dimensions}</small>
      </div></article>`).join('');
    grid.querySelectorAll('[data-size-for]').forEach(select => { if (selectedSizes[select.dataset.sizeFor]) select.value = selectedSizes[select.dataset.sizeFor]; select.addEventListener('change', () => updateCard(select.dataset.sizeFor)); updateCard(select.dataset.sizeFor); });
  };
  const updateCard = id => {
    const flavor = catalog.flavors.find(item => item.id === id), select = grid.querySelector(`[data-size-for="${id}"]`), size = catalog.sizes.find(item => item.id === select?.value);
    if (!flavor || !size) return;
    grid.querySelector(`[data-price-for="${id}"]`).textContent = catalog.money(flavor.prices[size.priceKey]);
    grid.querySelector(`[data-dimensions-for="${id}"]`).textContent = size.dimensions;
  };
  grid.addEventListener('click', event => {
    const photo = event.target.closest('[data-photo-flavor]');
    if (photo) {
      const flavor = catalog.flavors.find(item => item.id === photo.dataset.photoFlavor);
      const card = photo.closest('.budin-card'), target = card?.querySelector('[data-budin-photo]'), index = Number(photo.dataset.photoIndex), source = index === 0 ? flavor?.image : flavor?.gallery[index - 1];
      if (target && source) { target.src = source; target.alt = index === 0 ? `Budín ${flavor.name}` : `Interior del budín de ${flavor.name}`; card.querySelectorAll('[data-photo-flavor]').forEach(button => button.setAttribute('aria-pressed', String(button === photo))); }
      return;
    }
    const button = event.target.closest('[data-add-budin]');
    if (!button) return;
    const flavor = button.dataset.addBudin, size = grid.querySelector(`[data-size-for="${flavor}"]`)?.value, label = button.textContent;
    button.disabled = true; button.textContent = 'Agregando…';
    Promise.resolve(catalog.priceLoad).then(() => window.DoreLabCart?.addBudin(flavor, size)).finally(() => { button.disabled = false; button.textContent = label; });
  });
  document.addEventListener('budines:prices-updated', () => { render(); });
  render();
})();
