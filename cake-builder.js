/* Doré Lab cake builder — all editable options and future prices live in CAKE_CONFIG. */
(() => {
  const builder = document.querySelector('[data-cake-builder]');
  if (!builder) return;

  // Prices are intentionally null until Doré Lab defines a public cake price list.
  // Set a numeric ARS value in this object to enable the automatic estimate.
  const CAKE_CONFIG = {
    sizes: [
      { id: '16', name: '16 cm', detail: 'Medida de molde disponible', visual: 'small', scale: '.76', price: null },
      { id: '18', name: '18 cm', detail: 'Medida de molde disponible', visual: 'medium', scale: '.86', price: null },
      { id: '20', name: '20 cm', detail: 'Medida de molde disponible', visual: 'large', scale: '.96', price: null },
      { id: '24', name: '24 cm', detail: 'Medida de molde disponible', visual: 'xlarge', scale: '1.08', price: null }
    ],
    shapes: [
      { id: 'round', name: 'Redonda', detail: 'Forma a confirmar con el laboratorio', visual: 'round', price: null },
      { id: 'square', name: 'Cuadrada', detail: 'Forma a confirmar con el laboratorio', visual: 'square', price: null },
      { id: 'rectangle', name: 'Rectangular', detail: 'Forma a confirmar con el laboratorio', visual: 'rectangle', price: null }
    ],
    flavors: [
      { id: 'vanilla', name: 'Vainilla', detail: 'Bizcochuelo suave de vainilla', visual: 'vanilla', crumb: '#f2d28f', price: null },
      { id: 'chocolate', name: 'Chocolate', detail: 'Bizcochuelo intenso de chocolate', visual: 'chocolate', crumb: '#5a2f20', price: null },
      { id: 'marble', name: 'Marmolado', detail: 'Vainilla y chocolate', visual: 'marble', crumb: '#d6a66f', price: null },
      { id: 'lemon', name: 'Limón', detail: 'Bizcochuelo de limón', visual: 'lemon', crumb: '#eedb73', price: null },
      { id: 'orange', name: 'Naranja', detail: 'Bizcochuelo de naranja', visual: 'orange', crumb: '#e6a44a', price: null }
    ],
    fillings: [
      { id: 'dulce-de-leche', name: 'Dulce de leche', detail: 'Relleno disponible', visual: 'dulce', color: '#b86d2c', price: null },
      { id: 'chocotorta', name: 'Crema chocotorta', detail: 'Relleno disponible', visual: 'chocotorta', color: '#674331', price: null },
      { id: 'oreo', name: 'Crema Oreo', detail: 'Relleno disponible', visual: 'oreo', color: '#3b393b', price: null },
      { id: 'nutella', name: 'Ganache de Nutella', detail: 'Relleno disponible', visual: 'nutella', color: '#6b3120', price: null },
      { id: 'frutos-rojos', name: 'Ganache de frutos rojos', detail: 'Relleno disponible', visual: 'berries', color: '#a83255', price: null },
      { id: 'chocolate-blanco', name: 'Chocolate blanco', detail: 'Relleno disponible', visual: 'white', color: '#f8e8bf', price: null }
    ],
    coatings: [
      { id: 'chocolate', name: 'Chocolate', detail: 'Acabado a confirmar', visual: 'chocolate', color: '#5a2f20', price: null },
      { id: 'white-chocolate', name: 'Chocolate blanco', detail: 'Acabado a confirmar', visual: 'white', color: '#f9edcf', price: null },
      { id: 'dulce-de-leche', name: 'Dulce de leche', detail: 'Acabado a confirmar', visual: 'dulce', color: '#c67d37', price: null }
    ],
    colors: [
      { id: 'cream', name: 'Crema', visual: 'cream', color: '#f7e9cf', price: null },
      { id: 'white', name: 'Blanco', visual: 'white', color: '#fffdf7', price: null },
      { id: 'chocolate', name: 'Chocolate', visual: 'chocolate', color: '#6a3726', price: null },
      { id: 'pink', name: 'Rosa', visual: 'pink', color: '#e7a2b5', price: null },
      { id: 'sky', name: 'Celeste', visual: 'sky', color: '#a9d7e8', price: null },
      { id: 'dore-blue', name: 'Azul Doré', visual: 'blue', color: '#527bbd', price: null },
      { id: 'green', name: 'Verde', visual: 'green', color: '#9dbf9a', price: null },
      { id: 'yellow', name: 'Amarillo', visual: 'yellow', color: '#ebd36e', price: null }
    ],
    numbers: Array.from({ length: 10 }, (_, value) => ({ id: String(value), name: String(value), visual: 'number', price: null })),
    decorations: [
      { id: 'infantil', name: 'Infantil', detail: 'Estilo disponible', visual: 'confetti', symbol: '●', price: null },
      { id: 'meme', name: 'Meme', detail: 'Estilo disponible', visual: 'face', symbol: '☺', price: null },
      { id: 'numbers', name: 'Números', detail: 'Estilo disponible', visual: 'number', symbol: '✦', price: null },
      { id: 'vintage', name: 'Vintage', detail: 'Estilo disponible', visual: 'vintage', symbol: '♡', price: null },
      { id: 'flowers', name: 'Flores', detail: 'Estilo disponible', visual: 'flowers', symbol: '✿', price: null },
      { id: 'minimal', name: 'Minimal', detail: 'Estilo disponible', visual: 'minimal', symbol: '✦', price: null }
    ]
  };

  const STEPS = [
    { key: 'size', source: 'sizes', summaryLabel: 'Tamaño', eyebrow: 'PRIMER COMPONENTE', title: 'Elegí el tamaño', description: 'Las medidas disponibles del laboratorio. Las porciones se confirman según altura y relleno.', required: true },
    { key: 'shape', source: 'shapes', summaryLabel: 'Forma', eyebrow: 'GEOMETRÍA DEL MOLDE', title: 'Elegí la forma', description: 'Elegí una silueta para la vista previa. La disponibilidad final se confirma con el laboratorio.', required: true },
    { key: 'flavor', source: 'flavors', summaryLabel: 'Sabor', eyebrow: 'FÓRMULA BASE', title: 'Elegí el sabor', description: 'Estas son las bases que ya estaban disponibles para tu torta personalizada.', required: true },
    { key: 'fillings', source: 'fillings', summaryLabel: 'Relleno', eyebrow: 'CENTRO DEL EXPERIMENTO', title: 'Elegí el relleno', description: 'Podés combinar hasta dos rellenos disponibles para contarle tu idea al laboratorio.', multiple: true, max: 2, required: true },
    { key: 'coating', source: 'coatings', summaryLabel: 'Cobertura', eyebrow: 'CAPA EXTERIOR', title: 'Elegí la cobertura', description: 'Elegí el acabado de referencia. El laboratorio valida la combinación antes de producirla.', required: true },
    { key: 'color', source: 'colors', summaryLabel: 'Color', eyebrow: 'PALETA DEL LAB', title: 'Elegí el color', description: 'Probá una paleta Doré Lab y mirá el cambio en la torta al instante.', required: true },
    { key: 'numbers', source: 'numbers', summaryLabel: 'Número', eyebrow: 'DETALLE ESPECIAL', title: '¿Qué número querés?', description: 'Elegí uno o dos números. Si no lleva edad, podés seguir sin seleccionar ninguno.', multiple: true, max: 2, required: false },
    { key: 'decorations', source: 'decorations', summaryLabel: 'Decoración', eyebrow: 'TOQUE FINAL', title: 'Elegí la decoración', description: 'Combiná hasta dos estilos que ya estaban disponibles en el pedido personalizado.', multiple: true, max: 2, required: false }
  ];
  window.DoreLabCakeConfig = CAKE_CONFIG;

  const state = { size: null, shape: null, flavor: null, fillings: [], coating: null, color: null, numbers: [], decorations: [] };
  let stepIndex = 0;
  const $ = selector => builder.querySelector(selector);
  const start = $('[data-builder-start]');
  const workspace = $('[data-builder-workspace]');
  const complete = $('[data-builder-complete]');
  const previewCake = $('[data-preview-cake]');
  const previewNumber = $('[data-preview-number]');
  const previewDecorations = $('[data-preview-decorations]');
  const cakeStage = $('[data-cake-preview]');
  const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
  const stepOptions = step => CAKE_CONFIG[step.source];
  const isMultiple = step => Boolean(step.multiple);
  const selectedIds = step => isMultiple(step) ? state[step.key] : state[step.key] ? [state[step.key]] : [];
  const optionFor = (step, id) => stepOptions(step).find(option => option.id === id);
  const selectedOptions = step => selectedIds(step).map(id => optionFor(step, id)).filter(Boolean);
  const isStepReady = step => !step.required || selectedIds(step).length > 0;
  const selectionLabel = step => {
    const selected = selectedOptions(step);
    if (!selected.length) return 'Sin elegir';
    return step.key === 'numbers' ? selected.map(option => option.name).join('') : selected.map(option => option.name).join(' + ');
  };
  const allSelected = () => STEPS.flatMap(step => selectedOptions(step).map(option => ({ step, option })));

  function quote() {
    const choices = allSelected();
    const priced = choices.filter(({ option }) => Number.isFinite(option.price));
    const allPriced = choices.length > 0 && priced.length === choices.length;
    return { total: allPriced ? priced.reduce((sum, { option }) => sum + option.price, 0) : null, choices };
  }

  function optionArt(step, option) {
    if (step.key === 'colors') return `<span class="cake-option-swatch" style="--option-tone:${option.color}"></span>`;
    if (step.key === 'numbers') return `<span class="cake-option-art art-number">${option.name}</span>`;
    if (step.key === 'fillings') return `<span class="cake-option-art art-filling art-${option.visual}" style="--option-tone:${option.color}"></span>`;
    if (step.key === 'decorations') return `<span class="cake-option-art art-decor art-${option.visual}">${option.symbol}</span>`;
    return `<span class="cake-option-art art-${step.key} art-${option.visual}"${option.color ? ` style="--option-tone:${option.color}"` : ''}></span>`;
  }

  function renderOptions() {
    const step = STEPS[stepIndex];
    const selected = selectedIds(step);
    $('[data-cake-options]').innerHTML = stepOptions(step).map(option => {
      const active = selected.includes(option.id);
      const price = Number.isFinite(option.price) ? money(option.price) : 'A cotizar';
      return `<button class="cake-option-card ${active ? 'is-selected' : ''}" type="button" data-builder-option="${option.id}" aria-pressed="${active}">${optionArt(step, option)}<span class="cake-option-content"><b>${option.name}</b>${option.detail ? `<small>${option.detail}</small>` : ''}</span><em>${price}</em></button>`;
    }).join('');
  }

  function renderPrice() {
    const estimate = quote();
    const total = estimate.total === null ? 'A cotizar' : money(estimate.total);
    $('[data-builder-total]').textContent = total;
    $('[data-builder-complete-total]').textContent = total;
    const lines = STEPS.map(step => {
      const selected = selectedOptions(step);
      if (!selected.length) return '';
      const price = selected.every(option => Number.isFinite(option.price))
        ? selected.reduce((sum, option) => sum + option.price, 0)
        : null;
      return `<span><b>${step.summaryLabel}</b><em>${price === null ? 'A cotizar' : money(price)}</em></span>`;
    }).join('');
    $('[data-builder-price-lines]').innerHTML = lines || '<span><b>Tu fórmula</b><em>pendiente</em></span>';
  }

  function decorationMarkup(option) {
    return `<span class="preview-decor preview-${option.visual}">${option.symbol}</span>`;
  }

  function renderPreview() {
    const size = optionFor(STEPS[0], state.size);
    const shape = optionFor(STEPS[1], state.shape);
    const flavor = optionFor(STEPS[2], state.flavor);
    const fillings = selectedOptions(STEPS[3]);
    const filling = fillings[0];
    const coating = optionFor(STEPS[4], state.coating);
    const color = optionFor(STEPS[5], state.color);
    const decorations = selectedOptions(STEPS[7]);
    previewCake.className = `cake-preview-body shape-${shape?.visual || 'round'}${flavor?.visual === 'marble' ? ' is-marble' : ''}${fillings.length > 1 ? ' has-double-filling' : ''}`;
    previewCake.style.setProperty('--cake-scale', size?.scale || '.84');
    previewCake.style.setProperty('--cake-icing', color?.color || coating?.color || '#f7e9cf');
    previewCake.style.setProperty('--cake-crumb', flavor?.crumb || '#e7bd79');
    previewCake.style.setProperty('--cake-fill', filling?.color || '#c78341');
    previewCake.style.setProperty('--cake-fill-secondary', fillings[1]?.color || filling?.color || '#c78341');
    previewNumber.textContent = state.numbers.join('');
    previewNumber.classList.toggle('has-number', state.numbers.length > 0);
    previewDecorations.innerHTML = decorations.map(decorationMarkup).join('');
    const selectedCount = allSelected().length;
    $('[data-builder-status]').textContent = selectedCount === 0 ? 'Esperando tu primera fórmula.' : STEPS.every(isStepReady) ? 'Experimento listo ✓' : 'Ingrediente aprobado ✓';
    renderCompletePreview();
  }

  function renderCompletePreview() {
    const target = $('[data-complete-preview]');
    if (!target || !cakeStage) return;
    const clone = cakeStage.cloneNode(true);
    clone.removeAttribute('data-cake-preview');
    clone.setAttribute('aria-hidden', 'true');
    target.replaceChildren(clone);
  }

  function renderSummary() {
    const rows = STEPS.map(step => `<p><b>${step.summaryLabel}</b><span>${selectionLabel(step)}</span></p>`).join('');
    $('[data-builder-summary]').innerHTML = rows;
  }

  function renderStep() {
    const step = STEPS[stepIndex];
    $('[data-builder-progress-label]').textContent = `${String(stepIndex + 1).padStart(2, '0')} / 08`;
    $('[data-builder-progress-bar]').style.width = `${((stepIndex + 1) / STEPS.length) * 100}%`;
    $('[data-builder-step-label]').textContent = step.title;
    $('[data-builder-eyebrow]').textContent = step.eyebrow;
    $('[data-builder-title]').textContent = step.title;
    $('[data-builder-description]').textContent = step.description;
    $('[data-builder-prev]').disabled = stepIndex === 0;
    $('[data-builder-next]').textContent = stepIndex === STEPS.length - 1 ? '🧪 Terminar experimento' : 'Siguiente →';
    const selected = selectedIds(step).length;
    const helper = step.multiple ? `Podés elegir hasta ${step.max}${step.required ? '.' : ' o seguir sin seleccionar.'}` : 'Seleccioná una opción para continuar.';
    $('[data-builder-feedback]').textContent = selected ? `Combinación detectada ✓ ${selectionLabel(step)}` : helper;
    $('[data-builder-feedback]').classList.toggle('is-approved', selected > 0);
    renderOptions();
    renderPreview();
    renderPrice();
  }

  function selectOption(id) {
    const step = STEPS[stepIndex];
    if (!optionFor(step, id)) return;
    if (isMultiple(step)) {
      const values = state[step.key];
      if (values.includes(id)) state[step.key] = values.filter(value => value !== id);
      else if (values.length < step.max) state[step.key] = [...values, id];
      else state[step.key] = [...values.slice(1), id];
    } else state[step.key] = id;
    renderStep();
  }

  function showWorkspace() {
    start.hidden = true;
    complete.hidden = true;
    workspace.hidden = false;
    renderStep();
    $('[data-builder-title]').focus?.();
  }

  function showComplete() {
    workspace.hidden = true;
    complete.hidden = false;
    renderSummary();
    renderPrice();
    renderPreview();
    complete.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cartPayload() {
    const estimate = quote();
    const details = STEPS.map(step => `${step.summaryLabel}: ${selectionLabel(step)}`);
    return { title: 'Torta Doré Lab personalizada', details, total: estimate.total, priceStatus: estimate.total === null ? 'A cotizar' : null, image: 'assets/cake-passion.png' };
  }

  function addToCart() {
    const cartApi = window.DoreLabCart;
    if (!cartApi?.addCustomCake) return;
    cartApi.addCustomCake(cartPayload());
    const button = $('[data-builder-add]');
    button.textContent = '✓ Agregada a tu pedido';
    window.setTimeout(() => { button.textContent = 'Agregar al pedido'; }, 2200);
  }

  async function shareCreation() {
    const details = STEPS.map(step => `${step.summaryLabel}: ${selectionLabel(step)}`).join('\n');
    const text = `MI CREACIÓN DORÉ LAB 🧪\nDiseñé mi torta en el laboratorio.\n\n${details}\n\nTotal estimado: ${quote().total === null ? 'A cotizar' : money(quote().total)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Mi creación Doré Lab', text, url: window.location.href });
      else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } catch (error) {
      if (error?.name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  }

  builder.addEventListener('click', event => {
    if (event.target.closest('[data-builder-start-button]')) { showWorkspace(); return; }
    const option = event.target.closest('[data-builder-option]');
    if (option) { selectOption(option.dataset.builderOption); return; }
    if (event.target.closest('[data-builder-prev]')) { if (stepIndex > 0) { stepIndex -= 1; renderStep(); } return; }
    if (event.target.closest('[data-builder-next]')) {
      const step = STEPS[stepIndex];
      if (!isStepReady(step)) { $('[data-builder-feedback]').textContent = 'Necesitás elegir una opción para continuar.'; return; }
      if (stepIndex === STEPS.length - 1) showComplete();
      else { stepIndex += 1; renderStep(); }
      return;
    }
    if (event.target.closest('[data-builder-edit]')) { showWorkspace(); return; }
    if (event.target.closest('[data-builder-add]')) { addToCart(); return; }
    if (event.target.closest('[data-builder-share]')) shareCreation();
  });

  renderPreview();
  renderPrice();
})();
