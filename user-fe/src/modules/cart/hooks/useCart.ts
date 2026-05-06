import { useMemo, useState } from "react";

type CartItemLike = {
  id: number;
  price: number;
  quantity: number;
  stock: number;
};

export const useCart = <T extends CartItemLike>(initialItems: T[]) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const toggleShop = (shopItems: T[]) => {
    const ids = shopItems.map((item) => item.id);
    const allSelected = ids.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)));
  };

  const updateQty = (id: number, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(Math.max(1, qty), item.stock) }
          : item,
      ),
    );
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => prev.filter((itemId) => itemId !== id));
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selected.includes(item.id)),
    [items, selected],
  );

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
