import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

const GUEST_CART_STORAGE_KEY = 'strideon_guest_cart';

function readGuestCartFromStorage() {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) {
      return { items: [] };
    }
    const cleanItems = parsed.items.filter(
      (item) =>
        item &&
        item.productId &&
        item.colorway &&
        item.size !== undefined &&
        item.size !== null &&
        typeof item.qty === 'number' &&
        item.qty > 0
    );
    return { items: cleanItems };
  } catch {
    return { items: [] };
  }
}

function writeGuestCartToStorage(cartData) {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch {
    // ignore storage write errors
  }
}

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(() => {
    const token = localStorage.getItem('strideon_token');
    if (!token) {
      return readGuestCartFromStorage();
    }
    return { items: [] };
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mergeNotice, setMergeNotice] = useState(null);

  const prevUserRef = useRef(user);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(readGuestCartFromStorage());
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart(data || { user: user._id, items: [] });
    } catch {
      // silently fail; cart is non-critical on page load
    }
  }, [user]);

  // Sync guest cart across browser tabs via storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === GUEST_CART_STORAGE_KEY && !user) {
        setCart(readGuestCartFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Handle user authentication transitions: login merge, logout cleanup
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    if (!prevUser && user) {
      // User just logged in
      const guestCart = readGuestCartFromStorage();
      if (guestCart.items && guestCart.items.length > 0) {
        (async () => {
          const failedItems = [];
          for (const item of guestCart.items) {
            try {
              await api.post('/cart/add', {
                productId: item.productId,
                colorway: item.colorway,
                size: item.size,
                qty: item.qty,
              });
            } catch {
              failedItems.push(item.name || `${item.colorway} (Size ${item.size})`);
            }
          }
          try {
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          } catch {
            // ignore storage removal errors
          }
          if (failedItems.length > 0) {
            setMergeNotice(
              `Some items from your guest bag could not be added due to stock changes: ${failedItems.join(', ')}.`
            );
          }
          await fetchCart();
        })();
      } else {
        fetchCart();
      }
    } else if (prevUser && !user) {
      // User just logged out: clear in-memory cart, do NOT write server cart to guest localStorage
      setCart({ items: [] });
      setMergeNotice(null);
    } else if (user) {
      fetchCart();
    } else {
      setCart(readGuestCartFromStorage());
    }
  }, [user, fetchCart]);

  const addItem = async (productId, colorway, size, qty = 1, metadata = {}) => {
    if (user) {
      const { data } = await api.post('/cart/add', { productId, colorway, size, qty });
      setCart(data);
      setDrawerOpen(true);
      return data;
    }

    const currentGuestCart = readGuestCartFromStorage();
    const existingIndex = currentGuestCart.items.findIndex(
      (i) => i.productId === productId && i.colorway === colorway && i.size === size
    );

    const availableStock = metadata.stock;
    const currentQty = existingIndex > -1 ? currentGuestCart.items[existingIndex].qty : 0;
    const targetQty = currentQty + qty;

    if (availableStock !== undefined && availableStock !== null && targetQty > availableStock) {
      const err = new Error('Insufficient stock');
      err.response = { data: { message: 'Insufficient stock' } };
      throw err;
    }

    let nextItems = [...currentGuestCart.items];
    if (existingIndex > -1) {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        qty: targetQty,
      };
    } else {
      const productObj = metadata.product || {};
      const newItem = {
        productId,
        slug: productObj.slug || '',
        name: productObj.name || 'Product',
        brand: productObj.brand || '',
        image: productObj.images?.[0] || '',
        colorway,
        size,
        price: productObj.price || 0,
        qty,
        stock: availableStock !== undefined ? availableStock : null,
      };
      nextItems.push(newItem);
    }

    const updatedCart = { items: nextItems };
    writeGuestCartToStorage(updatedCart);
    setCart(updatedCart);
    setDrawerOpen(true);
    return updatedCart;
  };

  const updateItem = async (productId, colorway, size, qty) => {
    if (user) {
      const { data } = await api.put('/cart/update', { productId, colorway, size, qty });
      setCart(data);
      return data;
    }

    const currentGuestCart = readGuestCartFromStorage();
    let nextItems;
    if (qty <= 0) {
      nextItems = currentGuestCart.items.filter(
        (i) => !(i.productId === productId && i.colorway === colorway && i.size === size)
      );
    } else {
      const targetItem = currentGuestCart.items.find(
        (i) => i.productId === productId && i.colorway === colorway && i.size === size
      );
      if (targetItem && targetItem.stock !== null && targetItem.stock !== undefined && qty > targetItem.stock) {
        const err = new Error('Insufficient stock');
        err.response = { data: { message: 'Insufficient stock' } };
        throw err;
      }
      nextItems = currentGuestCart.items.map((i) => {
        if (i.productId === productId && i.colorway === colorway && i.size === size) {
          return { ...i, qty };
        }
        return i;
      });
    }

    const updatedCart = { items: nextItems };
    writeGuestCartToStorage(updatedCart);
    setCart(updatedCart);
    return updatedCart;
  };

  const removeItem = async (productId, colorway, size) => {
    if (user) {
      const { data } = await api.delete('/cart/remove', {
        data: { productId, colorway, size },
      });
      setCart(data);
      return data;
    }

    const currentGuestCart = readGuestCartFromStorage();
    const nextItems = currentGuestCart.items.filter(
      (i) => !(i.productId === productId && i.colorway === colorway && i.size === size)
    );
    const updatedCart = { items: nextItems };
    writeGuestCartToStorage(updatedCart);
    setCart(updatedCart);
    return updatedCart;
  };

  const clearCart = async () => {
    if (user) {
      await api.delete('/cart/clear');
      setCart({ items: [] });
      return;
    }
    const emptyCart = { items: [] };
    writeGuestCartToStorage(emptyCart);
    setCart(emptyCart);
  };

  const cartCount = cart.items.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);

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
        updateQuantity: updateItem,
        removeItem,
        clearCart,
        fetchCart,
        mergeNotice,
        setMergeNotice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
