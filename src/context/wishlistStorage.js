const KEY = 'lsh-wishlist';

export function readLocalWishlist() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.map(String) : [];
  } catch {
    return [];
  }
}

export function writeLocalWishlist(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable (private mode) — wishlist just won't persist for guests
  }
}
