import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'lsh-cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Product ids are Firestore document ids (strings); older carts stored numbers.
    return stored ? JSON.parse(stored).map((i) => ({ ...i, id: String(i.id) })) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((product, quantity = 1) => {
    const id = String(product.id);
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          image: product.image,
          category: product.category || '',
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== String(id)));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const key = String(id);
    if (quantity < 1) {
      setCart(prev => prev.filter(i => i.id !== key));
      return;
    }
    setCart(prev => prev.map(i => i.id === key ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
