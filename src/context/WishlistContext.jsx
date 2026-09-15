import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { addToWishlist, removeFromWishlist } from '../lib/db';
import { readLocalWishlist, writeLocalWishlist } from './wishlistStorage';

const WishlistContext = createContext(null);

/**
 * Wishlist of product ids. Guests keep it in localStorage; signed-in customers keep it on their
 * Firestore profile (users/{uid}.wishlist), so it follows them across devices. A guest wishlist is
 * merged into the account on sign-in.
 */
export function WishlistProvider({ children }) {
  const { user, profile } = useAuth();
  const [localIds, setLocalIds] = useState(readLocalWishlist);

  // Merge the guest wishlist into the account once the profile is available
  useEffect(() => {
    if (!user || !profile || localIds.length === 0) return;
    const missing = localIds.filter((id) => !(profile.wishlist || []).includes(id));
    const clear = () => {
      writeLocalWishlist([]);
      setLocalIds([]);
    };
    if (missing.length === 0) {
      clear();
      return;
    }
    addToWishlist(user.uid, missing).then(clear).catch((err) => console.error('Could not merge wishlist', err));
  }, [user, profile, localIds]);

  const ids = useMemo(() => (user ? profile?.wishlist || [] : localIds), [user, profile, localIds]);

  const toggle = useCallback(
    async (productId) => {
      const id = String(productId);
      if (user) {
        if ((profile?.wishlist || []).includes(id)) await removeFromWishlist(user.uid, id);
        else await addToWishlist(user.uid, [id]);
        return;
      }
      setLocalIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        writeLocalWishlist(next);
        return next;
      });
    },
    [user, profile]
  );

  const value = useMemo(() => ({ ids, count: ids.length, has: (id) => ids.includes(String(id)), toggle }), [ids, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
