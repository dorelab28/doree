/*
  Catálogo y reglas del Laboratorio del Antojo.
  Para actualizar una recomendación, editá solamente este arreglo: los componentes
  visuales no contienen reglas de sabor, textura ni enlaces de productos.
*/
const PRODUCT_CATALOG = [
  {id:'new-york', code:'NY-01', name:'New York', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-new-york.webp', link:'cookies.html#cookies', description:'La fórmula clásica New York, repleta de chips y doble chocolate.', texture:'Borde levemente crocante, corazón húmedo y chips fundentes.', tastes:['chocolate','classic'], textures:['crunch','soft'], cravings:['low','moderate'], priority:1},
  {id:'nutella-cookie', code:'N-04', name:'Nutella', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-nutella.webp', link:'cookies.html#cookies', description:'Masa de vainilla, chips y un centro explosivo de Nutella.', texture:'Exterior suavemente dorado, centro húmedo y reservorio de Nutella fundida.', tastes:['chocolate','creamy'], textures:['creamy','soft'], cravings:['moderate','high'], priority:2},
  {id:'oreo-x', code:'O-02', name:'Oreo X', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-oreo.webp', link:'cookies.html#cookies', description:'Base con Oreo, crema y una generosa carga de chocolate.', texture:'Bordes dorados, centro cremoso y partículas crocantes en cada dosis.', tastes:['chocolate','creamy'], textures:['creamy','crunch','mixed'], cravings:['moderate','high'], priority:3},
  {id:'cadbury-frutilla', code:'CF-02', name:'Cadbury Frutilla', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-cadbury-frutilla.webp', link:'cookies.html#cookies', description:'Cadbury y crema de frutilla en una combinación irresistible.', texture:'Masa tierna, corazón cremoso y cobertura de fusión rápida.', tastes:['fruit','creamy'], textures:['creamy','soft'], cravings:['moderate'], priority:4},
  {id:'kitkat', code:'K-06', name:'KitKat', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-kitkat.webp', link:'cookies.html#cookies', description:'Masa XL con chocolate y el crocante inconfundible de KitKat.', texture:'Centro tierno, inclusiones crocantes y chocolate sedoso en superficie.', tastes:['chocolate','classic'], textures:['crunch','mixed'], cravings:['moderate','high'], priority:5},
  {id:'kinder', code:'K-02', name:'Kinder', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-catalog-kinder.webp', link:'cookies.html#cookies', description:'Chocolate blanco, chocolate con leche y trozos de Kinder.', texture:'Exterior suave, centro cremoso y doble contraste de chocolates.', tastes:['creamy','chocolate'], textures:['creamy','soft','mixed'], cravings:['moderate'], priority:6},
  {id:'triple-impacto', code:'T-03', name:'Triple Impacto', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-triple-impacto.webp', link:'cookies.html#cookies', description:'Doble cacao, corazón cremoso y una explosión de chocolate.', texture:'Exterior intenso, centro húmedo y múltiples focos de chocolate derretido.', tastes:['chocolate'], textures:['creamy','soft'], cravings:['high'], priority:7},
  {id:'red-velvet', code:'R-03', name:'Red Velvet', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-red-velvet.webp', link:'cookies.html#cookies', description:'Masa red velvet con relleno cremoso y cobertura de chocolate blanco.', texture:'Exterior suave, interior cremoso y fusión blanca persistente.', tastes:['creamy'], textures:['creamy','soft'], cravings:['moderate'], priority:8},
  {id:'pistacho-cookie', code:'P-01', name:'Pistacho', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-pistacho.webp', link:'cookies.html#cookies', description:'Centro de pistacho, galletita de vainilla, chips blancos y pistachos.', texture:'Masa húmeda, crema densa de pistacho, chips blancos y mordida crocante.', tastes:['toasted','creamy'], textures:['creamy','crunch','mixed'], cravings:['moderate','high'], priority:9},
  {id:'mantecol', code:'M-01', name:'Mantecol', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-mantecol.webp', link:'cookies.html#cookies', description:'Centro de Mantecol con cubierta de Mantecol y chocolate.', texture:'Centro untuoso, cobertura sedosa y contraste de chocolate.', tastes:['toasted','creamy'], textures:['creamy'], cravings:['moderate','high'], priority:10},
  {id:'coco', code:'CO-01', name:'Coco', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-coco.webp', link:'cookies.html#cookies', description:'Centro de dulce de leche, masa de coco y vainilla, y cubierta de dulce de leche con coco.', texture:'Masa suave, centro denso y terminación granulada de coco.', tastes:['classic','creamy'], textures:['soft','mixed'], cravings:['low','moderate'], priority:11},
  {id:'limon', code:'L-01', name:'Limón', category:'Cookies XL', categoryId:'cookies', image:'assets/cream-updated-limon.webp', link:'cookies.html#cookies', description:'Centro de ganache de chocolate blanco con limón.', texture:'Centro fresco y cremoso, cobertura sedosa y final cítrico.', tastes:['fruit','creamy'], textures:['creamy','soft'], cravings:['low','moderate'], priority:12},
  {id:'bar-frutilla', code:'F-01', name:'Doré Bar — Frutilla Doré', category:'Doré Bars', categoryId:'bars', image:'assets/dore-bar-frutilla.jpeg', link:'bars.html#catalogo-bars', description:'Chocolate negro, cookie de vainilla y jalea de frutilla.', texture:'La combinación de chocolate, cookie y jalea suma contraste en cada bocado.', tastes:['fruit'], textures:['mixed','crunch'], cravings:['moderate'], priority:13},
  {id:'bar-nutella', code:'N-01', name:'Doré Bar — Nutella', category:'Doré Bars', categoryId:'bars', image:'assets/dore-bar-nutella.jpeg', link:'bars.html#catalogo-bars', description:'Chocolate, cookie de chocolate y un centro de Nutella.', texture:'El centro de Nutella se combina con la cookie de chocolate.', tastes:['chocolate','creamy'], textures:['creamy','mixed'], cravings:['moderate','high'], priority:14},
  {id:'bar-oreo', code:'O-01', name:'Doré Bar — Oreo', category:'Doré Bars', categoryId:'bars', image:'assets/dore-bar-oreo.jpeg', link:'bars.html#catalogo-bars', description:'Chocolate blanco y con leche, cookies de chocolate y Oreo.', texture:'El chocolate y las cookies de chocolate aportan una combinación de texturas.', tastes:['chocolate','creamy'], textures:['crunch','mixed'], cravings:['moderate','high'], priority:15},
  {id:'bar-pistacho', code:'P-02', name:'Doré Bar — Pistacho', category:'Doré Bars', categoryId:'bars', image:'assets/dore-bar-pistacho.jpeg', link:'bars.html#catalogo-bars', description:'Chocolate blanco, cookies de chocolate y relleno de pistacho.', texture:'Relleno de pistacho, chocolate y cookies en una misma fórmula.', tastes:['toasted','creamy'], textures:['creamy','crunch','mixed'], cravings:['moderate','high'], priority:16},
  {id:'torta-personalizada', code:'A MEDIDA', name:'Torta personalizada', category:'Tortas', categoryId:'cakes', image:'assets/cake-argentina.png', link:'tortas.html#tortas', description:'Una torta a medida: elegí tamaño, sabor, relleno y decoración con el laboratorio.', texture:'La textura y el sabor se terminan de definir según la fórmula que armes.', tastes:['chocolate','creamy','fruit','toasted','classic'], textures:['creamy','crunch','soft','mixed'], cravings:['low','moderate','high'], priority:17}
];

// Main catalog imagery is kept in sync with the cleaned product photos.
const ANTOJO_IMAGE_OVERRIDES={'cadbury-frutilla':'assets/catalog-cadbury-clean.png','pistacho-cookie':'assets/catalog-pistacho-clean.png'};
PRODUCT_CATALOG.forEach(product=>{if(ANTOJO_IMAGE_OVERRIDES[product.id])product.image=ANTOJO_IMAGE_OVERRIDES[product.id]});

const QUESTIONS = [
  {id:'taste', kicker:'PASO 01 · PERFIL', title:'¿Qué perfil de sabor te tienta más?', intro:'Elegí la señal que mejor describe tu antojo de hoy.', options:[
    {id:'chocolate', label:'Chocolate intenso', detail:'Cacao, chips y centros', art:'●'},
    {id:'creamy', label:'Cremoso y dulce', detail:'Centros suaves y chocolate blanco', art:'◌'},
    {id:'fruit', label:'Frutal', detail:'Notas de frutilla o limón', art:'✦'},
    {id:'toasted', label:'Pistacho y sabores tostados', detail:'Aromáticos y con carácter', art:'✳'},
    {id:'classic', label:'Clásicos de siempre', detail:'Las fórmulas que nunca fallan', art:'★'}
  ]},
  {id:'texture', kicker:'PASO 02 · TEXTURA', title:'¿Qué textura preferís?', intro:'No hay una respuesta correcta: solo la que te da más ganas.', options:[
    {id:'creamy', label:'Centro cremoso', detail:'Una dosis suave y fundente', art:'◒'},
    {id:'crunch', label:'Contraste crocante', detail:'Un toque para morder', art:'⌁'},
    {id:'soft', label:'Masa suave y abundante', detail:'Tierno desde el primer corte', art:'≈'},
    {id:'mixed', label:'Una combinación de texturas', detail:'La mezcla más entretenida', art:'✣'}
  ]},
  {id:'craving', kicker:'PASO 03 · INTENSIDAD', title:'¿Qué nivel de antojo tenés?', intro:'Este dato afina el resultado; no modifica las características reales de cada fórmula.', options:[
    {id:'low', label:'Nivel 1: algo rico para acompañar', detail:'Una pausa dulce, sin apuro', art:'Ⅰ'},
    {id:'moderate', label:'Nivel 2: quiero darme un gusto', detail:'Hoy merece una fórmula especial', art:'Ⅱ'},
    {id:'high', label:'Nivel 3: necesito una experiencia inolvidable', detail:'El antojo llegó con todas las señales', art:'Ⅲ'}
  ]},
  {id:'category', kicker:'PASO 04 · DESCUBRIMIENTO', title:'¿Qué te gustaría descubrir?', intro:'Podés ir por una categoría o dejar que el laboratorio cruce todas las fórmulas.', options:[
    {id:'cookies', label:'Cookies', detail:'Las fórmulas XL del laboratorio', art:'◉'},
    {id:'bars', label:'Doré Bars', detail:'Chocolate, cookie y toppings', art:'▰'},
    {id:'cakes', label:'Tortas', detail:'Una fórmula creada a medida', art:'△'},
    {id:'surprise', label:'Sorprendeme', detail:'Abrimos el expediente completo', art:'⚗'}
  ]}
];

const WHATSAPP_NUMBER = '5491135231567';
const state = {answers:{taste:'',texture:'',craving:'',category:''}, questionIndex:0, result:null};
const bySelector = selector => document.querySelector(selector);
const allBySelector = selector => [...document.querySelectorAll(selector)];
const getQuestion = id => QUESTIONS.find(question => question.id === id);
const getOption = (questionId, optionId) => getQuestion(questionId)?.options.find(option => option.id === optionId);

function showScreen(name){
  allBySelector('[data-antojo-screen]').forEach(screen => { screen.hidden = screen.dataset.antojoScreen !== name; });
  requestAnimationFrame(() => {
    const focusTarget = name === 'questions' ? bySelector('[data-question-title]') : name === 'result' ? bySelector('[data-result-name]') : null;
    focusTarget?.focus({preventScroll:true});
  });
}

function renderQuestion(){
  const question = QUESTIONS[state.questionIndex];
  const selectedAnswer = state.answers[question.id];
  bySelector('[data-question-kicker]').textContent = question.kicker;
  bySelector('[data-question-title]').textContent = question.title;
  bySelector('[data-question-intro]').textContent = question.intro;
  bySelector('[data-progress-copy]').textContent = `${state.questionIndex + 1} de ${QUESTIONS.length}`;
  const progress = bySelector('.antojo-progress');
  progress.setAttribute('aria-valuenow', String(state.questionIndex + 1));
  bySelector('[data-progress-bar]').style.width = `${((state.questionIndex + 1) / QUESTIONS.length) * 100}%`;
  const options = bySelector('[data-question-options]');
  options.setAttribute('aria-label', question.title);
  options.innerHTML = question.options.map(option => {
    const selected = selectedAnswer === option.id;
    return `<button class="antojo-option${selected ? ' is-selected' : ''}" type="button" data-answer="${option.id}" aria-pressed="${selected}" aria-label="${option.label}. ${option.detail}"><span class="antojo-option-art" aria-hidden="true">${option.art}</span><span class="antojo-option-copy"><b>${option.label}</b><small>${option.detail}</small></span><span class="antojo-option-check" aria-hidden="true">${selected ? '✓' : ''}</span></button>`;
  }).join('');
  const back = bySelector('[data-antojo-back]');
  back.textContent = state.questionIndex === 0 ? '← Inicio' : '← Anterior';
  const next = bySelector('[data-antojo-next]');
  next.disabled = !selectedAnswer;
  next.textContent = state.questionIndex === QUESTIONS.length - 1 ? 'Ver mi fórmula →' : 'Siguiente →';
  const note = bySelector('[data-selection-note]');
  note.textContent = selectedAnswer ? `Señal registrada: ${getOption(question.id, selectedAnswer).label}.` : 'Elegí una opción para continuar.';
  note.classList.toggle('is-approved', Boolean(selectedAnswer));
}

function scoreProduct(product){
  const matches = {
    taste:product.tastes.includes(state.answers.taste),
    texture:product.textures.includes(state.answers.texture),
    category:state.answers.category === 'surprise' || product.categoryId === state.answers.category,
    craving:product.cravings.includes(state.answers.craving)
  };
  return {product, matches, score:(matches.taste ? 3 : 0) + (matches.texture ? 2 : 0) + (matches.category ? 3 : 0) + (matches.craving ? 1 : 0)};
}

function getRecommendation(){
  const ranked = PRODUCT_CATALOG.map(scoreProduct).sort((a,b) => b.score - a.score || a.product.priority - b.product.priority);
  return {primary:ranked[0], alternatives:ranked.slice(1,3)};
}

function selectedLabel(questionId){ return getOption(questionId, state.answers[questionId])?.label || ''; }

function recommendationWhy(scored){
  const {matches, product} = scored;
  const details = [];
  if(matches.taste) details.push(`tu perfil ${selectedLabel('taste').toLocaleLowerCase('es-AR')}`);
  if(matches.texture) details.push(`la preferencia por ${selectedLabel('texture').toLocaleLowerCase('es-AR')}`);
  if(matches.category && state.answers.category !== 'surprise') details.push(`que querías explorar ${selectedLabel('category').toLocaleLowerCase('es-AR')}`);
  const base = details.length ? `Cruza ${details.join(details.length === 2 ? ' y ' : ', ')}.` : 'Es la coincidencia más alta entre las fórmulas disponibles del catálogo.';
  const craving = state.answers.craving === 'high' ? ' Tu nivel 3 nos llevó a presentarla como una fórmula para un antojo grande, sin cambiar sus características reales.' : state.answers.craving === 'low' ? ' Es una coincidencia pensada para cuando buscás algo rico para acompañar.' : ' La ubicamos como un gusto especial dentro de tu selección.';
  return `${base} ${product.name} suma estas señales con información real de su ficha.${craving}`;
}

function updateCravingMeter(){
  const level = {low:1, moderate:2, high:3}[state.answers.craving] || 0;
  const label = {low:'NIVEL 1', moderate:'NIVEL 2', high:'NIVEL 3'}[state.answers.craving] || '';
  allBySelector('.antojo-craving-meter i').forEach((bar,index) => bar.classList.toggle('is-active', index < level));
  bySelector('[data-craving-label]').textContent = label;
}

function renderProductImage(product){
  const container = bySelector('[data-result-image]');
  const image = bySelector('[data-result-photo]');
  const empty = bySelector('[data-result-image-empty]');
  container.classList.remove('is-ready');
  container.setAttribute('aria-busy','true');
  image.hidden = true;
  empty.hidden = true;
  image.onload = () => { container.classList.add('is-ready'); container.setAttribute('aria-busy','false'); image.hidden = false; };
  image.onerror = () => { container.setAttribute('aria-busy','false'); empty.hidden = false; };
  image.alt = `${product.name}, producto Doré Lab`;
  image.src = product.image;
  if(image.complete && image.naturalWidth) image.onload();
}

function renderAlternatives(alternatives){
  const section = bySelector('[data-alternatives-section]');
  section.hidden = alternatives.length === 0;
  bySelector('[data-alternatives]').innerHTML = alternatives.map(({product}) => `<article class="antojo-alternative"><img src="${product.image}" alt="${product.name}" loading="lazy"><div><small>${product.category.toUpperCase()}</small><b>${product.name}</b><a href="${product.link}">Ver producto →</a></div></article>`).join('');
}

function renderAnswerSummary(){
  bySelector('[data-answer-list]').innerHTML = QUESTIONS.map((question,index) => `<div class="antojo-answer"><span>${question.title}</span><b>${selectedLabel(question.id)}</b><button type="button" data-edit-question="${index}">Cambiar respuesta</button></div>`).join('');
}

function renderResult(){
  const recommendation = getRecommendation();
  state.result = recommendation;
  const {product} = recommendation.primary;
  bySelector('[data-result-code]').textContent = `FÓRMULA ${product.code}`;
  bySelector('[data-result-category]').textContent = product.category.toUpperCase();
  bySelector('[data-result-name]').textContent = product.name;
  bySelector('[data-result-why]').textContent = recommendationWhy(recommendation.primary);
  bySelector('[data-result-description]').textContent = product.description;
  bySelector('[data-result-texture]').textContent = product.texture;
  const link = bySelector('[data-result-link]');
  link.href = product.link;
  link.setAttribute('aria-label', `Ver ${product.name} en el catálogo`);
  updateCravingMeter();
  renderProductImage(product);
  renderAlternatives(recommendation.alternatives);
  renderAnswerSummary();
}

function revealResult(){ renderResult(); showScreen('result'); }

function beginAnalysis(){
  showScreen('analyzing');
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520;
  window.setTimeout(revealResult, duration);
}

function startExperiment(){ state.questionIndex = 0; renderQuestion(); showScreen('questions'); }
function resetExperiment(){
  state.answers = {taste:'',texture:'',craving:'',category:''};
  state.questionIndex = 0;
  state.result = null;
  showScreen('welcome');
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}

bySelector('[data-antojo-start]').addEventListener('click', startExperiment);
bySelector('[data-question-options]').addEventListener('click', event => {
  const button = event.target.closest('[data-answer]');
  if(!button) return;
  state.answers[QUESTIONS[state.questionIndex].id] = button.dataset.answer;
  renderQuestion();
});
bySelector('[data-antojo-back]').addEventListener('click', () => {
  if(state.questionIndex === 0){ showScreen('welcome'); return; }
  state.questionIndex -= 1;
  renderQuestion();
});
bySelector('[data-antojo-next]').addEventListener('click', () => {
  if(!state.answers[QUESTIONS[state.questionIndex].id]) return;
  if(state.questionIndex === QUESTIONS.length - 1){ beginAnalysis(); return; }
  state.questionIndex += 1;
  renderQuestion();
});
allBySelector('[data-antojo-restart]').forEach(button => button.addEventListener('click', resetExperiment));
bySelector('[data-answer-list]').addEventListener('click', event => {
  const button = event.target.closest('[data-edit-question]');
  if(!button) return;
  state.questionIndex = Number(button.dataset.editQuestion);
  renderQuestion();
  showScreen('questions');
});
bySelector('[data-result-whatsapp]').addEventListener('click', () => {
  const product = state.result?.primary.product;
  if(!product) return;
  const message = `¡Hola, Doré Lab! Hice el Laboratorio del Antojo y mi fórmula recomendada fue ${product.name}. ¿Me cuentan las opciones disponibles y cómo puedo pedirlo?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});
