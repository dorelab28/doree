/* Single source of truth for the public Cookie XL prices.
 * BLACKLIST derives its reference prices from this table on the server. */
const DORELAB_PUBLIC_COOKIE_PRICES = Object.freeze({
  chips: 4500,
  nutella: 6000,
  oreo: 5000,
  cadbury: 5000,
  kitkat: 5000,
  kinder: 5000,
  triple: 5000,
  redvelvet: 6000,
  pistacho: 6000,
  mantecol: 5000,
  coco: 4500,
  limon: 5000
});

if (typeof module !== 'undefined' && module.exports) module.exports = DORELAB_PUBLIC_COOKIE_PRICES;
if (typeof window !== 'undefined') window.DoreLabPublicCookiePrices = DORELAB_PUBLIC_COOKIE_PRICES;
