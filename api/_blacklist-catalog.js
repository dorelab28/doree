// BLACKLIST is a server-only presentation of the existing Cookie XL catalogue.
// Names, photographs, descriptions and base prices stay tied to the public
// catalogue; this module only adds the classified identity and reference price.
const publicPrices = require('../public-prices');

const blacklistPrice = publicPrice => Number.isFinite(publicPrice) ? publicPrice * 2 : null;
const demoLevels = Object.freeze([
  Object.freeze({ id: 'soft', code: 'LEVEL 01', label: 'SOFT', description: 'Nivel suave', priceAdjustment: 0 }),
  Object.freeze({ id: 'medium', code: 'LEVEL 02', label: 'MEDIUM', description: 'Nivel medio', priceAdjustment: 1000 }),
  Object.freeze({ id: 'strong', code: 'LEVEL 03', label: 'STRONG', description: 'Nivel fuerte', priceAdjustment: 2500 })
]);

const demoLevelById = levelId => demoLevels.find(level => level.id === levelId) || null;
const demoPrice = (basePrice, levelId) => {
  const level = demoLevelById(levelId);
  return Number.isFinite(basePrice) && level ? basePrice + level.priceAdjustment : null;
};

const sourceProducts = [
  { id: 'chips', caseId: 'FILE 001', originalName: 'New York', alias: 'THE OUTLAW', image: 'assets/cream-updated-new-york.webp', description: 'La fórmula clásica New York, repleta de chips y doble chocolate.', formula: 'Masa estilo New York · vainilla · chips de chocolate con leche y semiamargo · cobertura bicolor.' },
  { id: 'nutella', caseId: 'FILE 002', originalName: 'Nutella', alias: 'BLACK GOLD', image: 'assets/cream-updated-nutella.webp', description: 'Masa de vainilla, chips y un centro explosivo de Nutella.', formula: 'Masa de vainilla · chips de chocolate · núcleo de Nutella · cobertura de chocolate.' },
  { id: 'oreo', caseId: 'FILE 003', originalName: 'Oreo X', alias: 'GLITCH', image: 'assets/cream-updated-oreo.webp', description: 'Base con Oreo, crema y una generosa carga de chocolate.', formula: 'Masa de vainilla · galletas Oreo · chips de chocolate · crema de Oreo · cobertura de chocolate.' },
  { id: 'cadbury', caseId: 'FILE 004', originalName: 'Cadbury Frutilla', alias: 'RED ROOM', image: 'assets/catalog-cadbury-clean.png', description: 'Cadbury y crema de frutilla en una combinación irresistible.', formula: 'Masa de vainilla · Cadbury · crema de frutilla · chocolates blanco y con leche.' },
  { id: 'kitkat', caseId: 'FILE 005', originalName: 'KitKat', alias: 'BREAKOUT', image: 'assets/cream-updated-kitkat.webp', description: 'Masa XL con chocolate y el crocante inconfundible de KitKat.', formula: 'Masa de vainilla · chips · barras KitKat · cobertura de chocolate con leche.' },
  { id: 'kinder', caseId: 'FILE 006', originalName: 'Kinder', alias: 'DOUBLE AGENT', image: 'assets/cream-catalog-kinder.webp', description: 'Chocolate blanco, chocolate con leche y trozos de Kinder.', formula: 'Masa de vainilla · relleno blanco · Kinder · chocolate blanco y con leche.' },
  { id: 'triple', caseId: 'FILE 007', originalName: 'Triple Impacto', alias: 'TRIPLE THREAT', image: 'assets/cream-updated-triple-impacto.webp', description: 'Doble cacao, corazón cremoso y una explosión de chocolate.', formula: 'Cacao amargo 70% · chocolate con leche · chocolate blanco · Hershey’s.' },
  { id: 'redvelvet', caseId: 'FILE 008', originalName: 'Red Velvet', alias: 'RED ALERT', image: 'assets/cream-updated-red-velvet.webp', description: 'Masa red velvet con relleno cremoso y cobertura de chocolate blanco.', formula: 'Masa red velvet · relleno de chocolate blanco · chips de chocolate blanco · cobertura blanca.' },
  { id: 'pistacho', caseId: 'FILE 009', originalName: 'Pistacho', alias: 'GREEN MATTER', image: 'assets/catalog-pistacho-clean.png', description: 'Centro de pistacho, galletita de vainilla, chips blancos y pistachos.', formula: 'Galletita de vainilla · centro cremoso de pistacho · chips de chocolate blanco · pistachos.' },
  { id: 'mantecol', caseId: 'FILE 010', originalName: 'Mantecol', alias: 'THE FIX', image: 'assets/cream-updated-mantecol.webp', description: 'Centro de Mantecol con cubierta de Mantecol y chocolate.', formula: 'Masa XL · centro de Mantecol · cubierta de Mantecol · chocolate.' },
  { id: 'coco', caseId: 'FILE 011', originalName: 'Coco', alias: 'GHOST PROTOCOL', image: 'assets/cream-updated-coco.webp', description: 'Centro de dulce de leche, masa de coco y vainilla, y cubierta de dulce de leche con coco.', formula: 'Masa de coco y vainilla · centro de dulce de leche · cubierta de dulce de leche · coco rallado.' },
  { id: 'limon', caseId: 'FILE 012', originalName: 'Limón', alias: 'COLD CASE', image: 'assets/cream-updated-limon.webp', description: 'Centro de ganache de chocolate blanco con limón.', formula: 'Masa XL · ganache de chocolate blanco con limón · chocolate blanco · nota cítrica.' }
];

const catalog = sourceProducts.map(product => {
  const publicPrice = publicPrices[product.id];
  return {
    ...product,
    price: blacklistPrice(publicPrice),
    classification: 'RESTRICTED / ARCHIVE',
    status: 'ACTIVE',
    allergenNotice: 'Información de alérgenos pendiente de verificación por el laboratorio.'
  };
});

function hiddenCatalogHelperEndpoint(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.status(404).end();
}

module.exports = Object.assign(hiddenCatalogHelperEndpoint, {
  catalog,
  blacklistPrice,
  demoLevels,
  demoPrice
});
