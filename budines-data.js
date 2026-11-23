/* Public Budines catalog data. Production costs are kept in Supabase tables with admin-only RLS. */
(() => {
  const sizes = [
    { id: 'chico', name: 'Chico', weight: 900, dimensions: '27 × 10 × 7,5 cm', priceKey: 'small' },
    { id: 'mediano', name: 'Mediano', weight: 1200, dimensions: '30 × 10 × 9 cm', priceKey: 'medium' },
    { id: 'doble', name: 'Doble', weight: 2400, dimensions: 'Dos budineras medianas · 30 × 10 × 9 cm c/u', priceKey: 'double' }
  ];
  const flavors = [
    { id: 'nutella', name: 'Nutella', image: 'assets/budin-nutella.jpg', gallery: ['assets/budin-nutella-detail.jpg'], prices: { small: 20000, medium: 27000, double: 49000 }, description: 'Budín de chocolate intenso con un centro generoso de Nutella, terminado con una cobertura sedosa de chocolate y avellanas crocantes.', filling: 'Relleno de Nutella, cobertura de chocolate semiamargo y crema.' },
    { id: 'pistacho', name: 'Pistacho', image: 'assets/budin-pistacho.jpg', gallery: ['assets/budin-pistacho-detail.jpg'], prices: { small: 22000, medium: 30000, double: 55000 }, description: 'Miga suave con crema de pistacho, cubierta con chocolate blanco y pistachos picados.', filling: 'Relleno y cobertura de crema de pistacho con chocolate blanco.' },
    { id: 'red-velvet', name: 'Red Velvet', image: 'assets/budin-red-velvet.jpg', gallery: ['assets/budin-red-velvet-detail.jpg'], prices: { small: 19000, medium: 25000, double: 46000 }, description: 'Budín aterciopelado de cacao y vainilla con un corazón cremoso y cobertura de chocolate blanco.', filling: 'Frosting cremoso en el interior y chocolate blanco por encima.' },
    { id: 'carrot-cake', name: 'Carrot Cake', image: 'assets/budin-carrot-cake.jpg', gallery: ['assets/budin-carrot-cake-detail.jpg'], prices: { small: 18000, medium: 24000, double: 44000 }, description: 'Budín húmedo de zanahoria, nuez y canela, terminado con frosting de queso crema.', filling: 'Frosting de queso crema, manteca y azúcar impalpable.' }
  ];
  const money = amount => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  const sizeName = id => sizes.find(size => size.id === id)?.name || id;
  const cartItem = (flavorId, sizeId) => {
    const flavor = flavors.find(item => item.id === flavorId), size = sizes.find(item => item.id === sizeId);
    if (!flavor || !size) return null;
    return { flavor: flavor.id, flavorName: flavor.name, size: size.id, sizeName: size.name, weight: size.weight, unitPrice: flavor.prices[size.priceKey], image: flavor.image };
  };
  const refreshPrices = async () => {
    if (!window.doreSupabase) return;
    try {
      const { data, error } = await window.doreSupabase.from('budin_prices').select('flavor,size,price');
      if (error || !data?.length) return;
      data.forEach(row => {
        const flavor = flavors.find(item => item.id === row.flavor), size = sizes.find(item => item.id === row.size);
        if (flavor && size && Number.isFinite(Number(row.price)) && Number(row.price) >= 0) flavor.prices[size.priceKey] = Number(row.price);
        if (size && Number.isInteger(Number(row.weight_grams)) && Number(row.weight_grams) > 0) size.weight = Number(row.weight_grams);
      });
      document.dispatchEvent(new CustomEvent('budines:prices-updated'));
    } catch { /* Public catalog remains available using its initial price list. */ }
  };
  window.DoreBudines = { flavors, sizes, money, sizeName, cartItem, refreshPrices, priceLoad: null };
  window.DoreBudines.priceLoad = refreshPrices();
})();
