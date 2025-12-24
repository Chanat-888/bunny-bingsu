import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
  setCart((prev) => {
    // We add a unique 'cartId' to every single click. 
    // This ensures that even identical items are treated as separate rows.
    const newItem = {
      ...item,
      cartId: Date.now() + Math.random(), 
    };

    // Simply add the new item to the array without checking for duplicates.
    return [...prev, newItem];
  });
};

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
