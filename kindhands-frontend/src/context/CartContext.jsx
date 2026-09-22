// src/context/CartContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCart } from "../services/cartService";

const CartContext = createContext(null);

function countItems(cart) {
  return cart.items.reduce((sum, item) => sum + (item.unavailable ? 0 : item.quantity), 0);
}

export function CartProvider({ role, children }) {
  const [itemCount, setItemCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (role !== "elder") return;
    try {
      const cart = await getCart();
      setItemCount(countItems(cart));
    } catch {
      // A failed background refresh shouldn't interrupt browsing.
    }
  }, [role]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Pages that already have the fresh cart from an API response (add/update/
  // remove/clear all return it) call this directly to avoid a second round trip.
  const setCountFromCart = useCallback((cart) => {
    setItemCount(countItems(cart));
  }, []);

  return (
    <CartContext.Provider value={{ itemCount, refreshCount, setCountFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
