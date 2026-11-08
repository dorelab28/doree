/* DORÉ CAKE LAB · renderer, interaction state, persistence and ordering flow. */
(() => {
  const root = document.querySelector('[data-cake-lab]');
  const catalog = window.DoreCakeLabCatalog;
  if (!root || !catalog) return;

  const STORE_KEY = 'dore-cake-lab-design-v1';
  const tabs = [
    { id: 'structure', label: 'Forma y tamaño', short: 'Estructura', description: 'La base de todo buen experimento.' },
    { id: 'flavor', label: 'Bizcochuelo', short: 'Bizcochuelo', description: 'Elegí la fórmula que sostiene tu torta.' },
    { id: 'fillings', label: 'Rellenos', short: 'Rellenos', description: 'Podés mezclar hasta dos capas.' },
    { id: 'coating', label: 'Cobertura', short: 'Cobertura', description: 'El acabado que define la primera impresión.' },
    { id: 'decorations', label: 'Decoraciones', short: 'Decorá', description: 'Elegí un elemento y tocá la torta para colocarlo.' },
    { id: 'toppings', label: 'Toppings', short: 'Toppings', description: 'Una pizca de caos delicioso.' },
    { id: 'message', label: 'Mensaje', short: 'Mensaje', description: 'Decí algo que merezca estar sobre la torta.' },
    { id: 'extras', label: 'Extras', short: 'Extras', description: 'Los detalles también forman parte de la fórmula.' }
  ];
  const $ = selector => root.querySelector(selector);
  const tabBox = $('[data-lab-tabs]');
  const controls = $('[data-lab-controls]');
  const stage = $('[data-cake-stage]');
  const svg = $('[data-cake-svg]');
  const stageTip = $('[data-canvas-tip]');
  const selectedBox = $('[data-selected-object]');
  const result = document.querySelector('[data-cake-result]');
  const copy = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
  const byId = (list, id) => list.find(item => String(item.id) === String(id));
  const labelFor = (list, id) => byId(list, id)?.label || 'A definir';
  const initialState = () => ({
    shape: 'round', size: '20', tiers: 1, flavor: 'vanilla', fillings: ['dulce-de-leche'], coating: 'white-cream',
    decorations: [], message: { text: '', font: 'script', color: '#073b78', size: 25 }, activeTab: 'structure'
  });
  let state = initialState();
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY));
    if (stored && typeof stored === 'object') {
      const base = initialState();
      state = { ...base, ...stored, fillings: Array.isArray(stored.fillings) ? stored.fillings.slice(0, 2) : base.fillings, decorations: Array.isArray(stored.decorations) ? stored.decorations : [], message: { ...base.message, ...(stored.message || {}) } };
    }
  } catch { /* Fresh formula when storage is unavailable or invalid. */ }
  let history = [copy(state)];
  let historyIndex = 0;
  let view = 'front';
  let zoom = 1;
  let armedType = null;
  let selectedId = null;
  let drag = null;
  let status = state.decorations.length ? '¡Excelente combinación!' : 'Mezclando ingredientes...';

  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function commit() {
    history = history.slice(0, historyIndex + 1);
    history.push(copy(state));
    historyIndex = history.length - 1;
  }
  function change(mutator, nextStatus) {
    mutator();
    commit();
    save();
    status = nextStatus || 'Fórmula actualizada ✓';
    render();
  }
  function isSelected(group, id) { return Array.isArray(state[group]) ? state[group].includes(id) : String(state[group]) === String(id); }
  function optionButton(group, option, extra = '') {
    const selected = isSelected(group, option.id);
    const visual = option.tone ? ` style="--tone:${option.tone}"` : '';
    const classes = `${extra} ${selected ? 'is-selected' : ''}`.trim();
    return `<button class="choice-chip ${classes}" type="button" data-choice="${group}" data-value="${escape(option.id)}"${visual}>${escape(option.label)}</button>`;
  }
  function field(title, items, group, className = '', note = '') {
    return `<section class="control-field"><span class="control-label">${title}</span><div class="control-options">${items.map(item => optionButton(group, item, className)).join('')}</div>${note ? `<p class="choice-note">${note}</p>` : ''}</section>`;
  }
  function icon(type) { return `<svg class="decoration-icon" viewBox="-22 -22 44 44" aria-hidden="true">${decorationGraphic(type)}</svg>`; }
  function library(groups) {
    return `<div class="decoration-library">${groups.map(group => {
      const items = catalog.decorations.filter(item => item.group === group);
      return `<section class="decoration-group"><div class="decoration-group-head"><b>${group}</b><small>${items.length} elementos</small></div><div class="decoration-items">${items.map(item => `<button class="decoration-item ${armedType === item.id ? 'is-armed' : ''}" type="button" data-add-decoration="${item.id}">${icon(item.id)}${item.label}</button>`).join('')}</div></section>`;
    }).join('')}<div class="placement-notice"><b>${armedType ? `${labelFor(catalog.decorations, armedType)} listo` : 'Elegí un elemento'}</b>${armedType ? 'Tocá una zona de la torta para colocarlo. Después podés arrastrarlo, rotarlo, duplicarlo o borrarlo.' : 'Cada topping se convierte en una pieza independiente.'}</div></div>`;
  }
  function renderControls() {
    const tab = state.activeTab;
    const content = {
      structure: `${field('Forma', catalog.shapes, 'shape', 'shape-chip')}${field('Tamaño', catalog.sizes, 'size')}${field('Pisos', catalog.tiers, 'tiers', '', 'Los pisos cambian la silueta de la torta en tiempo real.')}`,
      flavor: field('Bizcochuelo', catalog.flavors, 'flavor', 'flavor-chip', 'Podés ver la miga en la vista frontal.'),
      fillings: field('Rellenos (hasta dos)', catalog.fillings, 'fillings', 'flavor-chip', 'Tocá uno o dos rellenos. Las capas aparecen en la vista frontal.'),
      coating: field('Cobertura', catalog.coatings, 'coating', 'coating-chip', 'Color y acabado de la capa exterior.'),
      decorations: library(['Cremas', 'Chocolates']),
      toppings: library(['Frutas', 'Dulces']),
      extras: library(['Extras']),
      message: `<div class="message-controls"><section class="control-field"><label for="cake-message">Tu mensaje</label><input id="cake-message" data-message-text maxlength="34" value="${escape(state.message.text)}" placeholder="Feliz cumpleaños"></section><div class="message-settings"><section class="control-field"><label for="cake-font">Tipografía</label><select id="cake-font" data-message-font>${catalog.messageFonts.map(font => `<option value="${font.id}" ${state.message.font === font.id ? 'selected' : ''}>${font.label}</option>`).join('')}</select></section><section class="control-field"><label for="cake-size">Tamaño</label><input id="cake-size" type="range" min="16" max="42" value="${state.message.size}" data-message-size><span class="choice-note">${state.message.size}px</span></section></div><section class="control-field"><span class="control-label">Color</span><div class="message-colors">${['#073b78', '#ffffff', '#d95151', '#5b3a25', '#f2c94c'].map(color => `<button class="message-color ${state.message.color === color ? 'is-selected' : ''}" type="button" style="--tone:${color}" data-message-color="${color}" aria-label="Color ${color}"></button>`).join('')}</div></section><p class="placement-notice"><b>Mensaje aplicado en vivo</b>Podés cambiarlo cuando quieras: tu diseño no se pierde.</p></div>`
    };
    controls.innerHTML = content[tab] || '';
  }
  function renderTabs() {
    const active = tabs.findIndex(tab => tab.id === state.activeTab);
    tabBox.innerHTML = tabs.map((tab, index) => `<button class="lab-tab ${tab.id === state.activeTab ? 'is-active' : ''} ${index < active ? 'is-done' : ''}" type="button" data-tab="${tab.id}"><span>${index < active ? '✓' : String(index + 1).padStart(2, '0')}</span><b>${tab.short}</b><small>${tab.label}</small></button>`).join('');
    const current = tabs[active] || tabs[0];
    $('[data-lab-eyebrow]').textContent = `${String(active + 1).padStart(2, '0')} · ${current.short.toUpperCase()}`;
    $('[data-lab-title]').textContent = current.label;
    $('[data-lab-description]').textContent = current.description;
    $('[data-next-tab]').textContent = active === tabs.length - 1 ? 'Revisar mi fórmula →' : 'Siguiente etapa →';
  }
  function shapeTop(shape, cx, cy, width, color, stroke = '#073b78') {
    const h = width * .43;
    if (shape === 'heart') return `<path d="M ${cx} ${cy + h * .32} C ${cx - width * .66} ${cy - h * .12}, ${cx - width * .45} ${cy - h * .92}, ${cx} ${cy - h * .3} C ${cx + width * .45} ${cy - h * .92}, ${cx + width * .66} ${cy - h * .12}, ${cx} ${cy + h * .32} Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>`;
    if (shape === 'square' || shape === 'rectangle') return `<rect x="${cx - width / 2}" y="${cy - h / 2}" width="${width}" height="${h}" rx="${shape === 'square' ? 8 : 10}" fill="${color}" stroke="${stroke}" stroke-width="3"/>`;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${h / 2}" fill="${color}" stroke="${stroke}" stroke-width="3"/>`;
  }
  function frontTier(shape, width, y, height, coating, crumb, fills) {
    const x = 300 - width / 2;
    const rounded = shape === 'round' ? Math.min(width * .22, 45) : shape === 'heart' ? 38 : 8;
    const top = shapeTop(shape, 300, y + 11, width, coating);
    const lines = fills.map((fill, index) => `<rect x="${x + 8}" y="${y + 38 + index * 22}" width="${width - 16}" height="9" rx="4.5" fill="${fill}"/>`).join('');
    const spongeY = y + 25;
    return `<g>${top}<rect x="${x}" y="${spongeY}" width="${width}" height="${height - 20}" rx="${rounded}" fill="${coating}" stroke="#073b78" stroke-width="3"/><rect x="${x + 5}" y="${spongeY + 29}" width="${width - 10}" height="${Math.max(17, height - 57)}" rx="${Math.max(3, rounded - 8)}" fill="${crumb}" opacity=".93"/>${lines}<path d="M ${x + 6} ${spongeY + 8} Q ${x + width * .22} ${spongeY + 22} ${x + width * .37} ${spongeY + 7} Q ${x + width * .58} ${spongeY + 21} ${x + width * .75} ${spongeY + 7} Q ${x + width * .9} ${spongeY + 20} ${x + width - 6} ${spongeY + 7}" fill="none" stroke="#073b78" stroke-width="3" opacity=".34"/></g>`;
  }
  function cakeBase() {
    const size = byId(catalog.sizes, state.size)?.scale || 1;
    const coating = byId(catalog.coatings, state.coating)?.tone || '#fffdf5';
    const crumb = byId(catalog.flavors, state.flavor)?.tone || '#f1cb80';
    const fills = state.fillings.map(id => byId(catalog.fillings, id)?.tone).filter(Boolean);
    const configs = state.tiers === 3 ? [[330, 321], [252, 239], [178, 160]] : state.tiers === 2 ? [[330, 321], [235, 225]] : [[330, 321]];
    if (view === 'top') {
      return `<g transform="translate(300 480) scale(${size}) translate(-300 -480)"><ellipse cx="300" cy="410" rx="210" ry="32" fill="#ffffff" stroke="#073b78" stroke-width="3"/><ellipse cx="300" cy="415" rx="176" ry="19" fill="#9eb8ff" opacity=".5"/>${configs.slice().reverse().map(([width, y], index) => `${shapeTop(state.shape, 300, y - index * 12, width, coating)}<path d="M ${300 - width * .33} ${y - index * 12} Q 300 ${y + 8 - index * 12} ${300 + width * .33} ${y - index * 12}" fill="none" stroke="#073b78" stroke-width="3" opacity=".25"/>`).join('')}</g>`;
    }
    return `<g transform="translate(300 480) scale(${size}) translate(-300 -480)"><ellipse cx="300" cy="414" rx="205" ry="28" fill="#fffdf5" stroke="#073b78" stroke-width="3"/><ellipse cx="300" cy="416" rx="171" ry="16" fill="#9eb8ff" opacity=".45"/>${configs.map(([width, y], index) => frontTier(state.shape, width, y, 88 - index * 4, coating, crumb, fills)).join('')}</g>`;
  }
  function decorationGraphic(type) {
    const blue = '#073b78';
    const heart = '<path d="M0 13 C-20 0 -10 -16 0 -7 C10 -16 20 0 0 13Z"/>';
    const map = {
      swirl: `<path d="M-13 13 C-17 2 -4 5 -9 -4 C-12 -12 3 -17 6 -6 C14 -7 16 8 7 12 C3 17 -8 17 -13 13Z" fill="#fffdf5" stroke="${blue}" stroke-width="2"/><path d="M-7 9 C5 10 8 -3 0 -5" fill="none" stroke="#f1a1af" stroke-width="3"/>`,
      rosette: `<circle r="14" fill="#f1a1af" stroke="${blue}" stroke-width="2"/><path d="M0-11C12-8 11 7 0 11C-12 8-11-7 0-11Z" fill="none" stroke="#fffdf5" stroke-width="3"/>`,
      'cream-flower': `<g fill="#fffdf5" stroke="${blue}" stroke-width="1.5"><circle cx="0" cy="-10" r="8"/><circle cx="10" cy="0" r="8"/><circle cx="0" cy="10" r="8"/><circle cx="-10" cy="0" r="8"/></g><circle r="5" fill="#f2d55b" stroke="${blue}" stroke-width="1.5"/>`,
      border: `<path d="M-16 5 C-9-12 -2 16 5-4 C9-14 14 4 17-3" fill="none" stroke="#fffdf5" stroke-width="8"/><path d="M-16 5 C-9-12 -2 16 5-4 C9-14 14 4 17-3" fill="none" stroke="${blue}" stroke-width="2"/>`,
      'cream-star': `<path d="M0-17 L4-5 L17-5 L7 3 L11 16 L0 8 L-11 16 L-7 3 L-17-5 L-4-5 Z" fill="#fffdf5" stroke="${blue}" stroke-width="2"/>`,
      'chocolate-piece': `<rect x="-12" y="-9" width="24" height="18" rx="4" fill="#60321f" stroke="${blue}" stroke-width="2"/><path d="M-4-9V9M4-9V9" stroke="#b87842" stroke-width="2"/>`,
      curl: `<path d="M-16 5 C-12-15 8-14 11-4 C14 8-4 14-5 2 C-6-6 5-6 7 0" fill="none" stroke="#60321f" stroke-width="6"/><path d="M-16 5 C-12-15 8-14 11-4" fill="none" stroke="${blue}" stroke-width="1.5"/>`,
      shavings: `<g stroke="#60321f" stroke-width="4" stroke-linecap="round"><path d="M-12-9L-4 8"/><path d="M0-12L8 4"/><path d="M12-8L3 12"/></g>`,
      tablet: `<rect x="-15" y="-10" width="30" height="20" rx="2" fill="#704029" stroke="${blue}" stroke-width="2"/><path d="M0-10V10M-15 0H15" stroke="#bd8858" stroke-width="1.5"/>`,
      'chocolate-heart': `${heart.replace('/>', ' fill="#63311e" stroke="#073b78" stroke-width="2"/>')}`,
      strawberry: `<path d="M0 16 C-17 5 -12-14 0-13 C12-14 17 5 0 16Z" fill="#e65d65" stroke="${blue}" stroke-width="2"/><path d="M0-13L-6-19M0-13L6-19M0-13L0-21" stroke="#4f8d55" stroke-width="3"/><g fill="#fff4ce"><circle cx="-5" cy="0" r="1"/><circle cx="5" cy="0" r="1"/><circle cy="7" r="1"/></g>`,
      blueberry: `<circle r="13" fill="#526aac" stroke="${blue}" stroke-width="2"/><circle r="4" fill="#b8c8fb"/>`,
      raspberry: `<g fill="#ca4d68" stroke="${blue}" stroke-width="1"><circle cx="-6" cy="-5" r="6"/><circle cx="5" cy="-6" r="6"/><circle cx="-7" cy="5" r="6"/><circle cx="6" cy="5" r="6"/><circle cy="10" r="5"/></g>`,
      cherry: `<circle cy="6" r="11" fill="#d84a50" stroke="${blue}" stroke-width="2"/><path d="M0-5C1-16 10-18 13-21" fill="none" stroke="#4f8d55" stroke-width="3"/>`,
      'lemon-slice': `<circle r="15" fill="#f2d55b" stroke="${blue}" stroke-width="2"/><circle r="10" fill="#fff5ae"/><path d="M0-10V10M-9-5L9 5M-9 5L9-5" stroke="#e5bd45" stroke-width="1.5"/>`,
      oreo: `<circle r="15" fill="#282a31" stroke="${blue}" stroke-width="2"/><circle r="8" fill="none" stroke="#e9e8dc" stroke-width="2"/><circle r="2" fill="#e9e8dc"/>`,
      cookie: `<circle r="15" fill="#d99a57" stroke="${blue}" stroke-width="2"/><g fill="#60321f"><circle cx="-6" cy="-5" r="2"/><circle cx="6" cy="-3" r="2"/><circle cx="1" cy="7" r="2"/></g>`,
      macaron: `<rect x="-15" y="-11" width="30" height="22" rx="10" fill="#f1a1af" stroke="${blue}" stroke-width="2"/><path d="M-14 0H14" stroke="#fffdf5" stroke-width="5"/>`,
      sprinkles: `<g fill="#f2d55b" stroke="${blue}" stroke-width="1"><circle cx="-8" cy="-6" r="4"/><circle cx="6" cy="-7" r="4"/><circle cx="-2" cy="6" r="4"/><circle cx="11" cy="8" r="3"/></g>`,
      'rainbow-sprinkles': `<g stroke-linecap="round" stroke-width="4"><path d="M-13-8L-8-3" stroke="#d95151"/><path d="M2-12L6-6" stroke="#f2d55b"/><path d="M9 1L14 6" stroke="#526aac"/><path d="M-10 9L-4 12" stroke="#4f8d55"/></g>`,
      marshmallow: `<rect x="-14" y="-12" width="28" height="24" rx="9" fill="#fffdf5" stroke="${blue}" stroke-width="2"/><path d="M-6-5H6" stroke="#f1a1af" stroke-width="2"/>`,
      'chocolate-bar': `<rect x="-10" y="-17" width="20" height="34" rx="2" fill="#d84f3e" stroke="${blue}" stroke-width="2"/><path d="M-6-11H6M-6-3H6M-6 5H6" stroke="#fff1cf" stroke-width="2"/>`,
      candle: `<rect x="-5" y="-14" width="10" height="28" rx="2" fill="#f2d55b" stroke="${blue}" stroke-width="2"/><path d="M0-14 C-8-23 7-25 0-32 C7-23-5-22 0-14" fill="#e65d65" stroke="${blue}" stroke-width="1.5"/>`,
      plaque: `<path d="M-18-10H18V10H-18Z" fill="#fffdf5" stroke="${blue}" stroke-width="2"/><path d="M-8 0H8" stroke="#d95151" stroke-width="2"/>`,
      letter: `<text x="0" y="11" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="bold" fill="#073b78">A</text>`,
      number: `<text x="0" y="10" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="bold" fill="#073b78">18</text>`,
      pearl: `<circle r="11" fill="#fffdf5" stroke="${blue}" stroke-width="2"/><circle cx="-3" cy="-3" r="3" fill="#9eb8ff"/>`
    };
    return map[type] || map.pearl;
  }
  function decorationNode(item) {
    const selected = item.id === selectedId;
    const ring = selected ? '<circle r="24" fill="none" stroke="#073b78" stroke-width="2" stroke-dasharray="4 3"/>' : '';
    return `<g data-object-id="${item.id}" transform="translate(${item.x} ${item.y}) rotate(${item.rotation || 0}) scale(${item.scale || 1})" style="cursor:grab;touch-action:none">${ring}${decorationGraphic(item.type)}</g>`;
  }
  function messageNode() {
    if (!state.message.text.trim()) return '';
    const font = byId(catalog.messageFonts, state.message.font)?.value || 'Georgia, serif';
    const y = view === 'top' ? 286 : 275;
    return `<text x="300" y="${y}" text-anchor="middle" fill="${state.message.color}" stroke="#fef7df" stroke-width="3" paint-order="stroke" font-family="${font}" font-size="${state.message.size}" font-weight="bold">${escape(state.message.text)}</text>`;
  }
  function renderCake() {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.innerHTML = `<title>Diseño de torta Doré Cake Lab</title>${cakeBase()}<g aria-label="Decoraciones">${state.decorations.map(decorationNode).join('')}</g>${messageNode()}`;
    stage.style.setProperty('--stage-zoom', zoom);
    stage.classList.toggle('is-armed', Boolean(armedType));
    stageTip.textContent = armedType ? `${labelFor(catalog.decorations, armedType)} listo: tocá la torta para colocarlo.` : 'Elegí una decoración y tocá la torta para colocarla.';
    $('[data-zoom-label]').textContent = `${Math.round(zoom * 100)}%`;
  }
  function renderSelected() {
    const item = state.decorations.find(decoration => decoration.id === selectedId);
    if (!item) { selectedBox.hidden = true; selectedBox.innerHTML = ''; return; }
    selectedBox.hidden = false;
    selectedBox.innerHTML = `<strong>${labelFor(catalog.decorations, item.type)} seleccionado</strong><div class="object-actions"><button type="button" data-object-action="smaller" aria-label="Achicar">−</button><button type="button" data-object-action="larger" aria-label="Agrandar">+</button><button type="button" data-object-action="left" aria-label="Girar a la izquierda">↶</button><button type="button" data-object-action="right" aria-label="Girar a la derecha">↷</button><button type="button" data-object-action="duplicate">Duplicar</button><button type="button" data-object-action="delete">Eliminar</button></div>`;
  }
  function quoteRows() {
    const choices = [
      ['Base', [byId(catalog.shapes, state.shape), byId(catalog.sizes, state.size)]],
      ['Pisos', [byId(catalog.tiers, state.tiers)]],
      ['Bizcochuelo', [byId(catalog.flavors, state.flavor)]],
      ['Rellenos', state.fillings.map(id => byId(catalog.fillings, id))],
      ['Cobertura', [byId(catalog.coatings, state.coating)]],
      ['Decoraciones', state.decorations.map(item => byId(catalog.decorations, item.type))]
    ].filter(([, values]) => values.length && values.every(Boolean));
    return choices.map(([name, values]) => ({ name, value: values.every(item => Number.isFinite(item.price)) ? values.reduce((sum, item) => sum + item.price, 0) : null }));
  }
  function total() { const rows = quoteRows(); return rows.length && rows.every(row => Number.isFinite(row.value)) ? rows.reduce((sum, row) => sum + row.value, 0) : null; }
  function renderPrice() {
    const currentTotal = total();
    $('[data-price-total]').textContent = currentTotal === null ? 'A cotizar' : money(currentTotal);
    $('[data-price-copy]').textContent = currentTotal === null ? 'Los valores se confirman con el laboratorio.' : 'Estimación sujeta a validación y disponibilidad.';
    $('[data-price-lines]').innerHTML = quoteRows().map(row => `<p class="price-line"><span>${row.name}</span><span>${row.value === null ? 'A cotizar' : money(row.value)}</span></p>`).join('');
  }
  function renderHistory() {
    $('[data-undo]').disabled = historyIndex === 0;
    $('[data-redo]').disabled = historyIndex >= history.length - 1;
    $('[data-lab-status]').textContent = status;
  }
  function render() { renderTabs(); renderControls(); renderCake(); renderSelected(); renderPrice(); renderHistory(); }
  function switchTab(id) { state.activeTab = id; armedType = null; selectedId = null; render(); }
  function pickChoice(group, value) {
    change(() => {
      if (group === 'fillings') {
        state.fillings = state.fillings.includes(value) ? state.fillings.filter(id => id !== value) : [...state.fillings.slice(-1), value];
        if (!state.fillings.length) state.fillings = [value];
      } else state[group] = group === 'tiers' ? Number(value) : value;
    }, group === 'fillings' ? 'Capas detectadas ✓' : 'Tu fórmula está tomando forma.');
  }
  function makeId() { return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }
  function point(event) {
    const rect = stage.getBoundingClientRect();
    return { x: Math.max(18, Math.min(582, (event.clientX - rect.left) / rect.width * 600)), y: Math.max(18, Math.min(462, (event.clientY - rect.top) / rect.height * 480)) };
  }
  function addDecoration(type, coords) {
    change(() => {
      state.decorations.push({ id: makeId(), type, x: Math.round(coords.x), y: Math.round(coords.y), rotation: 0, scale: 1, depth: state.decorations.length + 1 });
      selectedId = state.decorations.at(-1).id;
    }, '¡Excelente combinación!');
  }
  function manipulate(action) {
    const item = state.decorations.find(decoration => decoration.id === selectedId);
    if (!item) return;
    change(() => {
      if (action === 'smaller') item.scale = Math.max(.45, +(item.scale - .15).toFixed(2));
      if (action === 'larger') item.scale = Math.min(2.1, +(item.scale + .15).toFixed(2));
      if (action === 'left') item.rotation = (item.rotation - 15 + 360) % 360;
      if (action === 'right') item.rotation = (item.rotation + 15) % 360;
      if (action === 'duplicate') { const clone = { ...item, id: makeId(), x: Math.min(570, item.x + 22), y: Math.min(450, item.y + 18), depth: state.decorations.length + 1 }; state.decorations.push(clone); selectedId = clone.id; }
      if (action === 'delete') { state.decorations = state.decorations.filter(decoration => decoration.id !== item.id); selectedId = null; }
    }, action === 'delete' ? 'Elemento retirado.' : 'Decoración ajustada ✓');
  }
  function undo() {
    if (historyIndex === 0) return;
    historyIndex -= 1;
    state = copy(history[historyIndex]); selectedId = null; armedType = null; save(); status = 'Volvimos un paso en tu fórmula.'; render();
  }
  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    state = copy(history[historyIndex]); selectedId = null; armedType = null; save(); status = 'Recuperamos ese experimento.'; render();
  }
  function summaryRows() {
    return [
      ['Forma y tamaño', `${labelFor(catalog.shapes, state.shape)} · ${labelFor(catalog.sizes, state.size)} · ${labelFor(catalog.tiers, state.tiers)}`],
      ['Bizcochuelo', labelFor(catalog.flavors, state.flavor)],
      ['Rellenos', state.fillings.map(id => labelFor(catalog.fillings, id)).join(' + ')],
      ['Cobertura', labelFor(catalog.coatings, state.coating)],
      ['Decoraciones', state.decorations.length ? `${state.decorations.length} elemento${state.decorations.length === 1 ? '' : 's'}` : 'Sin decoración extra'],
      ['Mensaje', state.message.text || 'Sin mensaje']
    ];
  }
  function showResult() {
    selectedId = null; renderCake();
    const preview = document.querySelector('[data-result-image]');
    preview.innerHTML = svg.outerHTML;
    document.querySelector('[data-result-formula]').innerHTML = summaryRows().map(([name, value]) => `<p><b>${name}</b><span>${escape(value)}</span></p>`).join('');
    document.querySelector('[data-result-price]').textContent = total() === null ? 'A cotizar' : money(total());
    result.showModal();
  }
  function downloadDesign() {
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'mi-diseno-dore-cake-lab.svg'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }
  function requestCake() {
    const name = document.querySelector('[data-creation-name]').value.trim() || 'Mi creación Cake Lab';
    const text = [`¡Hola Doré Lab! 🧪 Quiero solicitar mi torta creada en DORÉ CAKE LAB.`, '', `Nombre: ${name}`, ...summaryRows().map(([label, value]) => `• ${label}: ${value}`), `• Precio estimado: ${total() === null ? 'A cotizar' : money(total())}`, '', '¿Me confirman disponibilidad, precio final y coordinación?'].join('\n');
    window.open(`https://wa.me/5491135231567?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  tabBox.addEventListener('click', event => { const button = event.target.closest('[data-tab]'); if (button) switchTab(button.dataset.tab); });
  controls.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]');
    if (choice) { pickChoice(choice.dataset.choice, choice.dataset.value); return; }
    const item = event.target.closest('[data-add-decoration]');
    if (item) { armedType = item.dataset.addDecoration; selectedId = null; status = `${labelFor(catalog.decorations, armedType)} listo para colocar.`; render(); return; }
    const color = event.target.closest('[data-message-color]');
    if (color) change(() => { state.message.color = color.dataset.messageColor; }, 'Color del mensaje actualizado.');
  });
  controls.addEventListener('input', event => {
    if (event.target.matches('[data-message-text]')) { state.message.text = event.target.value; save(); status = 'Tu mensaje aparece sobre la torta.'; renderCake(); renderHistory(); }
    if (event.target.matches('[data-message-size]')) { state.message.size = Number(event.target.value); save(); renderCake(); event.target.nextElementSibling.textContent = `${state.message.size}px`; }
  });
  controls.addEventListener('change', event => {
    if (event.target.matches('[data-message-text],[data-message-size]')) { commit(); save(); status = 'Mensaje registrado ✓'; render(); }
    if (event.target.matches('[data-message-font]')) change(() => { state.message.font = event.target.value; }, 'Tipografía actualizada.');
  });
  $('[data-next-tab]').addEventListener('click', () => { const index = tabs.findIndex(tab => tab.id === state.activeTab); if (index === tabs.length - 1) showResult(); else switchTab(tabs[index + 1].id); });
  $('[data-reset-design]').addEventListener('click', () => { if (!window.confirm('¿Reiniciar esta fórmula? Tus decoraciones actuales se eliminarán.')) return; state = initialState(); history = [copy(state)]; historyIndex = 0; armedType = null; selectedId = null; save(); status = 'Nueva fórmula lista para mezclar.'; render(); });
  $('[data-undo]').addEventListener('click', undo); $('[data-redo]').addEventListener('click', redo);
  $('[data-zoom-in]').addEventListener('click', () => { zoom = Math.min(1.3, +(zoom + .1).toFixed(1)); renderCake(); });
  $('[data-zoom-out]').addEventListener('click', () => { zoom = Math.max(.8, +(zoom - .1).toFixed(1)); renderCake(); });
  root.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { view = button.dataset.view; root.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('is-active', item === button)); status = view === 'top' ? 'Vista superior activada.' : 'Vista frontal activada.'; renderCake(); renderHistory(); }));
  $('[data-finish-design]').addEventListener('click', showResult);
  selectedBox.addEventListener('click', event => { const button = event.target.closest('[data-object-action]'); if (button) manipulate(button.dataset.objectAction); });
  stage.addEventListener('pointerdown', event => {
    const hit = event.target.closest?.('[data-object-id]');
    if (hit) {
      selectedId = hit.dataset.objectId; armedType = null; drag = { id: selectedId, pointerId: event.pointerId }; stage.setPointerCapture?.(event.pointerId); event.preventDefault(); render(); return;
    }
    if (armedType) { addDecoration(armedType, point(event)); armedType = null; render(); }
    else { selectedId = null; renderSelected(); renderCake(); }
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const item = state.decorations.find(decoration => decoration.id === drag.id); if (!item) return;
    Object.assign(item, point(event)); renderCake(); renderSelected();
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    stage.releasePointerCapture?.(event.pointerId); drag = null; commit(); save(); status = 'Posición actualizada ✓'; render();
  });
  document.querySelector('[data-close-result]').addEventListener('click', () => result.close());
  document.querySelector('[data-edit-result]').addEventListener('click', () => result.close());
  document.querySelector('[data-download-design]').addEventListener('click', downloadDesign);
  document.querySelector('[data-request-cake]').addEventListener('click', requestCake);
  result.addEventListener('click', event => { if (event.target === result) result.close(); });
  render();
})();
