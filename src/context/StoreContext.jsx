import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, fetchCategories, fetchProducts, subscribeSettings } from '../lib/db';

const StoreContext = createContext(null);

/**
 * Public storefront data: active products, categories and store settings.
 * Products and categories are fetched once per visit (cheap on Firestore reads);
 * settings are live so shipping/payment changes apply immediately.
 */
export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [productList, categoryList] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(productList.filter((p) => p.active !== false));
      setCategories(categoryList);
      setError(null);
    } catch (err) {
      console.error('Failed to load catalog', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeSettings(setSettings, (err) => console.error('Failed to load settings', err));
  }, [load]);

  const value = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return {
      products,
      categories,
      settings,
      loading,
      error,
      reload: load,
      getProduct: (id) => byId.get(String(id)) || null,
    };
  }, [products, categories, settings, loading, error, load]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
