// components/filters/ShopFilter.tsx
export const ShopFilter = ({ shops, filters, setFilters }) => {
  const toggle = (shop: string) => {
    setFilters((prev) => {
      const exists = prev.shops.includes(shop);

      return {
        ...prev,
        shops: exists
          ? prev.shops.filter((s) => s !== shop)
          : [...prev.shops, shop],
      };
    });
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Shop</h3>

      {shops.map((s) => (
        <label key={s} className="flex gap-2 p-2 hover:bg-muted rounded cursor-pointer">
          <input type="checkbox" onChange={() => toggle(s)} />
          {s}
        </label>
      ))}
    </div>
  );
};