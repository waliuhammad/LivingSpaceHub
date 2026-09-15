import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, fetchCategories, subscribeContent, subscribeProducts, subscribeSettings } from '../lib/db';
import { mergeContent } from '../lib/content';

const StoreContext = createContext(null);

/**
 * Public storefront data: active products, categories, store settings and editable page content.
 * Products, settings and content are live, so stock, prices and admin changes show immediately
 * (after the first load, Firestore only sends documents that changed). Categories load once per visit.
 */
export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [content, setContent] = useState(() => mergeContent());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setCategories(await fetchCategories());
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  useEffect(() => {
    load();
    const stopProducts = subscribeProducts(
      (list) => {
        setProducts(list.filter((p) => p.active !== false));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load catalog', err);
        setError(err);
        setLoading(false);
      }
    );
    const stopSettings = subscribeSettings(setSettings, (err) => console.error('Failed to load settings', err));
    const stopContent = subscribeContent((data) => setContent(mergeContent(data)), (err) => console.error('Failed to load content', err));
    return () => {
      stopProducts();
      stopSettings();
      stopContent();
    };
  }, [load]);

  const value = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return {
      products,
      categories,
      settings,
      content,
      loading,
      error,
      reload: load,
      getProduct: (id) => byId.get(String(id)) || null,
    };
  }, [products, categories, settings, content, loading, error, load]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
