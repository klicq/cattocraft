"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import type { CartProduct } from "@/lib/products";
import { cartReducer, initialCartState, loadCart, persistCart, restoreCart, lineKey, CART_STORAGE_KEY, STORAGE_WARNING, type CartAction, type CartInput, type CartLine } from "@/lib/cart";
import CartDrawer from "./CartDrawer";

export type CartContextValue = {
  catalog: CartProduct[];
  items: CartLine[]; count: number; ready: boolean; storageWarning: string; additionCount: number;
  addItem: (item: CartInput) => boolean;
  updateQuantity: (key: string, quantity: number) => boolean;
  removeItem: (key: string) => void;
  clearCart: () => void;
  openCart: () => void;
};
export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}

export default function CartProvider({ children, catalog }: { children: ReactNode; catalog: CartProduct[] }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  // Advance the same pure reducer synchronously so batched actions never save a stale render.
  const latestState = useRef(initialCartState);
  const [open, setOpen] = useState(false);
  const closeCart = useCallback(() => setOpen(false), []);

  const apply = useCallback((action: CartAction) => {
    const next = cartReducer(latestState.current, action);
    if (next === latestState.current) return false;
    latestState.current = next;
    dispatch(action);
    return true;
  }, []);

  useEffect(() => {
    try { apply({ type: "hydrate", ...loadCart(localStorage, catalog) }); }
    catch { apply({ type: "hydrate", items: [], warning: STORAGE_WARNING }); }
    function onStorage(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
      // Receive other tabs without writing back or replaying the addition animation.
      apply({ type: "hydrate", items: restoreCart(event.newValue, catalog) });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [apply, catalog]);

  function commit(action: CartAction) {
    if (!apply(action)) return false;
    let warning = "";
    try { warning = persistCart(localStorage, latestState.current.items); }
    catch { warning = STORAGE_WARNING; }
    apply({ type: "storage_status", warning });
    return true;
  }

  function addItem(item: CartInput) {
    const product = catalog.find(({ id }) => id === item.productId);
    return product ? commit({ type: "add_item", item, product }) : false;
  }
  function updateQuantity(key: string, quantity: number) {
    const item = latestState.current.items.find((line) => lineKey(line) === key);
    const product = catalog.find(({ id }) => id === item?.productId);
    return product ? commit({ type: "update_quantity", key, quantity, product }) : false;
  }
  function removeItem(key: string) { commit({ type: "remove_item", key }); }
  function clearCart() { commit({ type: "clear_cart" }); }

  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <CartContext.Provider value={{ catalog, items: state.items, count, ready: state.ready, storageWarning: state.storageWarning, additionCount: state.additionCount, addItem, updateQuantity, removeItem, clearCart, openCart: () => setOpen(true) }}>
      {children}
      <CartDrawer open={open} onClose={closeCart} items={state.items} catalog={catalog} onRemove={removeItem} onUpdateQuantity={updateQuantity} onClear={clearCart} warning={state.storageWarning} />
    </CartContext.Provider>
  );
}
