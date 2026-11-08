/*
 * DORÉ CAKE LAB · Catálogo y precios editables.
 * Cargá importes en ARS (por ejemplo price: 2500) cuando el laboratorio
 * publique su lista. Mientras sean null, la interfaz muestra “A cotizar”.
 */
window.DoreCakeLabCatalog = {
  shapes: [
    { id: 'round', label: 'Redonda', price: null },
    { id: 'heart', label: 'Corazón', price: null },
    { id: 'square', label: 'Cuadrada', price: null },
    { id: 'rectangle', label: 'Rectangular', price: null }
  ],
  sizes: [
    { id: 'individual', label: 'Individual', scale: .72, price: null },
    { id: '15', label: '15 cm', scale: .82, price: null },
    { id: '18', label: '18 cm', scale: .92, price: null },
    { id: '20', label: '20 cm', scale: 1, price: null },
    { id: '24', label: '24 cm', scale: 1.12, price: null },
    { id: '26', label: '26 cm', scale: 1.2, price: null }
  ],
  tiers: [
    { id: 1, label: 'Un piso', price: null },
    { id: 2, label: 'Dos pisos', price: null },
    { id: 3, label: 'Tres pisos', price: null }
  ],
  flavors: [
    { id: 'vanilla', label: 'Vainilla', tone: '#f1cb80', price: null },
    { id: 'chocolate', label: 'Chocolate', tone: '#65321f', price: null },
    { id: 'red-velvet', label: 'Red Velvet', tone: '#9d2437', price: null },
    { id: 'lemon', label: 'Limón', tone: '#edd563', price: null },
    { id: 'marble', label: 'Marmolado', tone: '#bf8056', price: null }
  ],
  fillings: [
    { id: 'dulce-de-leche', label: 'Dulce de leche', tone: '#b8682b', price: null },
    { id: 'nutella', label: 'Nutella', tone: '#65301d', price: null },
    { id: 'chocolate', label: 'Chocolate', tone: '#432017', price: null },
    { id: 'ganache', label: 'Ganache', tone: '#754028', price: null },
    { id: 'pistachio', label: 'Crema de pistacho', tone: '#90a65b', price: null },
    { id: 'berries', label: 'Frutos rojos', tone: '#b1284b', price: null },
    { id: 'strawberry', label: 'Frutilla', tone: '#e96778', price: null },
    { id: 'oreo', label: 'Oreo', tone: '#24252b', price: null },
    { id: 'vanilla-cream', label: 'Crema de vainilla', tone: '#fff3ce', price: null }
  ],
  coatings: [
    { id: 'dark-chocolate', label: 'Chocolate negro', tone: '#53261c', price: null },
    { id: 'white-chocolate', label: 'Chocolate blanco', tone: '#fff6df', price: null },
    { id: 'white-cream', label: 'Crema blanca', tone: '#fffdf5', price: null },
    { id: 'pink-cream', label: 'Crema rosa', tone: '#f1a1af', price: null },
    { id: 'sky-cream', label: 'Crema celeste', tone: '#a8d9e7', price: null },
    { id: 'yellow-cream', label: 'Crema amarilla', tone: '#f2d55b', price: null },
    { id: 'pistachio-cream', label: 'Crema de pistacho', tone: '#9db56d', price: null },
    { id: 'buttercream', label: 'Buttercream', tone: '#f6dfb9', price: null }
  ],
  decorations: [
    { id: 'swirl', label: 'Copete', group: 'Cremas', price: null },
    { id: 'rosette', label: 'Roseta', group: 'Cremas', price: null },
    { id: 'cream-flower', label: 'Flor de crema', group: 'Cremas', price: null },
    { id: 'border', label: 'Borde decorativo', group: 'Cremas', price: null },
    { id: 'cream-star', label: 'Estrella de crema', group: 'Cremas', price: null },
    { id: 'chocolate-piece', label: 'Chocolate pequeño', group: 'Chocolates', price: null },
    { id: 'curl', label: 'Rulo de chocolate', group: 'Chocolates', price: null },
    { id: 'shavings', label: 'Virutas', group: 'Chocolates', price: null },
    { id: 'tablet', label: 'Tableta', group: 'Chocolates', price: null },
    { id: 'chocolate-heart', label: 'Corazón de chocolate', group: 'Chocolates', price: null },
    { id: 'strawberry', label: 'Frutilla', group: 'Frutas', price: null },
    { id: 'blueberry', label: 'Arándano', group: 'Frutas', price: null },
    { id: 'raspberry', label: 'Frambuesa', group: 'Frutas', price: null },
    { id: 'cherry', label: 'Cereza', group: 'Frutas', price: null },
    { id: 'lemon-slice', label: 'Rodaja de limón', group: 'Frutas', price: null },
    { id: 'oreo', label: 'Oreo', group: 'Dulces', price: null },
    { id: 'cookie', label: 'Mini cookie', group: 'Dulces', price: null },
    { id: 'macaron', label: 'Macaron', group: 'Dulces', price: null },
    { id: 'sprinkles', label: 'Confites', group: 'Dulces', price: null },
    { id: 'rainbow-sprinkles', label: 'Granas', group: 'Dulces', price: null },
    { id: 'marshmallow', label: 'Malvavisco', group: 'Dulces', price: null },
    { id: 'chocolate-bar', label: 'Barrita', group: 'Dulces', price: null },
    { id: 'candle', label: 'Vela', group: 'Extras', price: null },
    { id: 'plaque', label: 'Cartel', group: 'Extras', price: null },
    { id: 'letter', label: 'Letra', group: 'Extras', price: null },
    { id: 'number', label: 'Número', group: 'Extras', price: null },
    { id: 'pearl', label: 'Perla comestible', group: 'Extras', price: null }
  ],
  messageFonts: [
    { id: 'script', label: 'Pastelera', value: 'Georgia, serif' },
    { id: 'lab', label: 'Laboratorio', value: 'Trebuchet MS, sans-serif' },
    { id: 'classic', label: 'Clásica', value: 'Times New Roman, serif' }
  ]
};
