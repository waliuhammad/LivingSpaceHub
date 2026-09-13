import productsData from '../data/products.json';

/* ── product descriptions by category ── */
const descriptionTemplates = {
  living: [
    "Elevate your living room with this handcrafted piece, designed to blend artisan quality with modern aesthetics. Its warm tones and organic textures create an inviting focal point.",
    "A thoughtfully curated addition to any living space. Made with sustainably sourced materials, this piece brings natural elegance and timeless style to your home.",
    "Transform your lounge with this statement piece that marries form and function. Each detail has been carefully considered to complement contemporary interiors.",
  ],
  bedroom: [
    "Create a serene sanctuary with this beautifully crafted bedroom essential. Soft textures and calming tones promote rest and relaxation.",
    "Designed for comfort and elegance, this piece turns your bedroom into a boutique retreat. Premium materials ensure lasting quality and style.",
    "Indulge in refined comfort with this luxurious bedroom accent. Its subtle design integrates seamlessly into both minimalist and layered interiors.",
  ],
  office: [
    "Boost your productivity with this sleek workspace essential. Clean lines and functional design keep your office organized and inspiring.",
    "A modern office deserves modern design. This piece combines ergonomic thinking with aesthetic appeal to create an inspiring work environment.",
    "Elevate your workspace with this premium office accessory. Thoughtfully designed to enhance both form and function at your desk.",
  ],
  decor: [
    "Add a touch of artisanal charm to any room with this decorative accent. Hand-finished details make each piece uniquely beautiful.",
    "A curated decorative piece that tells a story. Its organic form and rich finish bring warmth and character to walls and surfaces alike.",
    "Express your personal style with this striking decor item. Designed to be a conversation starter, it adds depth and texture to any space.",
  ],
};

function getDescription(product) {
  const templates = descriptionTemplates[product.category] || descriptionTemplates.decor;
  const idx = product.id % templates.length;
  return templates[idx];
}

/* ── pad catalog to ~130 items ── */
function padCatalog(original) {
  const padded = [...original];
  let nextId = Math.max(...original.map(p => p.id)) + 1;
  const priceVariations = [0.85, 0.9, 0.95, 1.05, 1.1, 1.15];
  const namePrefixes = ['Premium', 'Artisan', 'Classic', 'Modern'];

  while (padded.length < 130) {
    const source = original[padded.length % original.length];
    const prefix = namePrefixes[padded.length % namePrefixes.length];
    const priceVar = priceVariations[padded.length % priceVariations.length];
    padded.push({
      ...source,
      id: nextId++,
      name: `${prefix} ${source.name}`,
      price: Math.round(source.price * priceVar),
    });
  }
  return padded;
}

const allProducts = padCatalog(productsData);

/* ── public API ── */
export function getAllProducts() {
  return allProducts;
}

export function getProductById(id) {
  const product = allProducts.find(p => p.id === Number(id));
  if (!product) return null;
  return { ...product, description: getDescription(product) };
}

export function getProductsByCategory(cat) {
  if (!cat || cat === 'all') return allProducts;
  return allProducts.filter(p => p.category === cat);
}

export function searchProducts(query) {
  if (!query) return allProducts;
  const q = query.toLowerCase();
  return allProducts.filter(p => p.name.toLowerCase().includes(q));
}

export function sortProducts(products, sort) {
  const sorted = [...products];
  switch (sort) {
    case 'low_high':
      return sorted.sort((a, b) => a.price - b.price);
    case 'high_low':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    default:
      return sorted;
  }
}

export function getRelatedProducts(productId, category, count = 4) {
  return allProducts
    .filter(p => p.category === category && p.id !== Number(productId))
    .slice(0, count);
}

export function formatPrice(amount) {
  if (amount === undefined || amount === null) return 'Rs.0';
  return `Rs.${Number(amount).toLocaleString()}`;
}

