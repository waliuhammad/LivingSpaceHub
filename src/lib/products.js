export { formatPrice } from './format';

/* ── fallback descriptions by category, used when a product has none ── */
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

export function getDescription(product) {
  if (product.description) return product.description;
  const templates = descriptionTemplates[product.category] || descriptionTemplates.decor;
  const hash = [...String(product.id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

const createdMs = (p) => (p.createdAt?.toMillis ? p.createdAt.toMillis() : 0);

export function sortProducts(products, sort) {
  const sorted = [...products];
  switch (sort) {
    case 'low_high':
      return sorted.sort((a, b) => a.price - b.price);
    case 'high_low':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => createdMs(b) - createdMs(a));
    default:
      // Featured first, then newest
      return sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || createdMs(b) - createdMs(a));
  }
}

export function getRelatedProducts(products, product, count = 4) {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, count);
}

export const isInStock = (product) => (Number(product.stock) || 0) > 0;
