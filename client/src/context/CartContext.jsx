import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      // silently fail — cart is non-critical on page load
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, colorway, size, qty = 1) => {
    const { data } = await api.post('/cart/add', { productId, colorway, size, qty });
    setCart(data);
    setDrawerOpen(true);
  };

  const updateItem = async (productId, colorway, size, qty) => {
    const { data } = await api.put('/cart/update', { productId, colorway, size, qty });
    setCart(data);
  };

  const removeItem = async (productId, colorway, size) => {
    const { data } = await api.delete('/cart/remove', {
      data: { productId, colorway, size },
    });
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [] });
  };

  const cartCount = cart.items.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        drawerOpen,
        setDrawerOpen,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
