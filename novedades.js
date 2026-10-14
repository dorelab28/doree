/*
  Archivo de contenido de Novedades.
  Para sumar una tarjeta, agregá un objeto a NEWS_ITEMS. Dejá date en null si no
  hay fecha de publicación; los elementos con fecha se ordenan automáticamente
  de más reciente a más antiguo.
*/
const NEWS_ITEMS = [
  {
    title: 'Torta de chocolate y frutos rojos',
    category: 'Tortas personalizadas',
    description: 'Una creación de chocolate terminada con frutos rojos, picos de crema y velas para celebrar.',
    date: null,
    image: 'assets/novedad-torta-chocolate-frutos-rojos.jpeg',
    alt: 'Torta de chocolate con crema, frutos rojos y velas',
    link: 'tortas.html',
    linkLabel: 'Ver tortas',
    status: 'published'
  },
  {
    title: 'Cheesecake con frutos rojos',
    category: 'Tortas',
    description: 'Base crocante, crema suave y una terminación fresca de frutos rojos.',
    date: null,
    image: 'assets/novedad-cheesecake-frutos-rojos.jpeg',
    alt: 'Cheesecake decorado con frutos rojos y hojas verdes',
    link: 'tortas.html',
    linkLabel: 'Conocer las tortas',
    status: 'published'
  },
  {
    title: 'Torta de cumpleaños personalizada',
    category: 'Tortas personalizadas',
    description: 'Una fórmula a medida para una celebración con temática propia.',
    date: null,
    image: 'assets/novedad-torta-personalizada-gonzarok.jpeg',
    alt: 'Torta de cumpleaños personalizada con decoración temática',
    link: 'tortas.html',
    linkLabel: 'Crear mi fórmula',
    status: 'published'
  },
  {
    title: 'Torta de chocolate con frutos rojos',
    category: 'Tortas',
    description: 'Capas de crema de chocolate y una decoración intensa de frutos rojos.',
    date: null,
    image: 'assets/novedad-torta-cumple-frutos-rojos.jpeg',
    alt: 'Torta de chocolate decorada con frutos rojos en una mesa de festejo',
    link: 'tortas.html',
    linkLabel: 'Ver opciones',
    status: 'published'
  },
  {
    title: 'Cookie XL Pistacho',
    category: 'Cookies',
    description: 'Galletita de vainilla, centro cremoso de pistacho, chips blancos y pistachos.',
    date: null,
    image: 'assets/updated-pistacho.jpeg',
    alt: 'Cookie XL de pistacho Doré Lab',
    link: 'cookies.html',
    linkLabel: 'Ver cookies',
    status: 'published'
  },
  {
    title: 'Doré Bar Pistacho',
    category: 'Doré Bars',
    description: 'Chocolate blanco, cookies de chocolate y relleno de pistacho en formato Doré Bar.',
    date: null,
    image: 'assets/dore-bar-pistacho.jpeg',
    alt: 'Doré Bar de pistacho',
    link: 'bars.html',
    linkLabel: 'Explorar Doré Bars',
    status: 'published'
  },
  {
    title: 'Detrás del laboratorio',
    category: 'Proceso',
    description: 'Parte del trabajo que hay detrás de cada producción en el laboratorio.',
    date: null,
    image: 'assets/lab-process.jpeg',
    alt: 'Proceso de elaboración en Doré Lab',
    link: 'https://instagram.com/dore_lab',
    linkLabel: 'Seguir el proceso',
    status: 'published'
  }
];

const TESTIMONIALS = [
  {
    quote: 'Yo comi esa torta! Recomiendo muy rica.',
    product: 'Torta personalizada',
    source: 'Comentario compartido en Instagram',
    status: 'published'
  },
  {
    quote: 'Increíble',
    product: null,
    source: 'Comentario compartido en Instagram',
    status: 'published'
  },
  {
    quote: 'Simplemente asombroso 😍',
    product: null,
    source: 'Comentario compartido en Instagram',
    status: 'published'
  }
];

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

function sortNews(items) {
  return items
    .filter(item => item.status === 'published')
    .sort((first, second) => {
      if (!first.date && !second.date) return 0;
      if (!first.date) return 1;
      if (!second.date) return -1;
      return new Date(second.date) - new Date(first.date);
    });
}

function createNewsCard(item) {
  const article = document.createElement('article');
  article.className = 'dore-news-card';

  const media = document.createElement('div');
  media.className = 'dore-news-card-media';
  const image = document.createElement('img');
  image.src = item.image;
  image.alt = item.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  media.append(image);

  const body = document.createElement('div');
  body.className = 'dore-news-card-body';
  const category = document.createElement('span');
  category.className = 'dore-news-card-category';
  category.textContent = item.category;
  const title = document.createElement('h3');
  title.textContent = item.title;
  const description = document.createElement('p');
  description.textContent = item.description;
  body.append(category, title, description);

  const footer = document.createElement('div');
  footer.className = 'dore-news-card-footer';
  if (item.date) {
    const date = document.createElement('time');
    date.dateTime = item.date;
    date.textContent = dateFormatter.format(new Date(`${item.date}T12:00:00`));
    footer.append(date);
  } else {
    const label = document.createElement('span');
    label.textContent = 'Expediente Doré Lab';
    footer.append(label);
  }

  if (item.link) {
    const link = document.createElement('a');
    link.href = item.link;
    link.textContent = item.linkLabel || 'Ver más';
    if (item.link.startsWith('http')) {
      link.target = '_blank';
      link.rel = 'noreferrer';
    }
    footer.append(link);
  }

  article.append(media, body, footer);
  return article;
}

function createTestimonial(item) {
  const article = document.createElement('article');
  article.className = 'dore-testimonial-card';
  const mark = document.createElement('span');
  mark.className = 'dore-testimonial-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '“';
  const quote = document.createElement('blockquote');
  quote.textContent = item.quote;
  const footer = document.createElement('footer');
  const source = document.createElement('span');
  source.textContent = item.source;
  footer.append(source);
  if (item.product) {
    const product = document.createElement('b');
    product.textContent = item.product;
    footer.append(product);
  }
  article.append(mark, quote, footer);
  return article;
}

function applyNewsGridLayout() {
  const newsGrid = document.querySelector('[data-news-grid]');
  if (!newsGrid) return;

  // Use the viewport width here as a safeguard for embedded or high-density
  // desktop browsers, where stylesheet breakpoints can report a narrow width.
  const columns = window.innerWidth >= 1200 ? 4 : window.innerWidth >= 700 ? 3 : window.innerWidth >= 540 ? 2 : 1;
  newsGrid.style.setProperty('display', 'grid', 'important');
  newsGrid.style.setProperty('grid-template-columns', `repeat(${columns}, minmax(0, 1fr))`, 'important');

  const cards = newsGrid.querySelectorAll('.dore-news-card');
  cards.forEach((card, index) => {
    card.style.removeProperty('grid-column');
    if (index === 0 && columns > 1) card.style.setProperty('grid-column', 'span 2', 'important');
  });
}

function renderNews() {
  const newsGrid = document.querySelector('[data-news-grid]');
  const testimonialGrid = document.querySelector('[data-testimonial-grid]');
  if (newsGrid) sortNews(NEWS_ITEMS).forEach(item => newsGrid.append(createNewsCard(item)));
  if (testimonialGrid) TESTIMONIALS.filter(item => item.status === 'published').forEach(item => testimonialGrid.append(createTestimonial(item)));
  applyNewsGridLayout();
}

renderNews();
window.addEventListener('resize', applyNewsGridLayout);
