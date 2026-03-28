// hooks/useCart.ts
import { useState, useMemo } from "react";

export const useCart = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<number[]>([]);

  // 🟢 select item
  const toggleItem = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 🟢 select shop
  const toggleShop = (shopItems) => {
    const ids = shopItems.map(i => i.id);
    const allSelected = ids.every(id => selected.includes(id));

    if (allSelected) {
      setSelected(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...ids])]);
    }
  };

  // 🟢 select all
  const toggleAll = () => {
    setSelected(prev =>
      prev.length === items.length ? [] : items.map(i => i.id)
    );
  };

  // 🟢 update quantity
  const updateQty = (id: number, qty: number) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, quantity: Math.min(Math.max(1, qty), i.stock) }
          : i
      )
    );
  };

  // 🟢 remove
  const remove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(prev => prev.filter(i => i !== id));
  };

  // 🟢 selected items
  const selectedItems = useMemo(
    () => items.filter(i => selected.includes(i.id)),
    [items, selected]
  );

  // 💰 subtotal
  const subtotal = selectedItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  return {
    items,
    selected,
    toggleItem,
    toggleShop,
    toggleAll,
    updateQty,
    remove,
    selectedItems,
    subtotal,
  };
};