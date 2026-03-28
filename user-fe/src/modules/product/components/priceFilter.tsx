// components/filters/PriceFilter.tsx
type PriceRange = { min: number; max: number; label: string };

export const PriceFilter = ({
  ranges,
  filters,
  setFilters,
}) => {
  const toggle = (range: PriceRange) => {
    setFilters((prev) => {
      const exists = prev.price.find(
        (r) => r.min === range.min && r.max === range.max
      );

      return {
        ...prev,
        price: exists
          ? prev.price.filter(
              (r) => r.min !== range.min || r.max !== range.max
            )
          : [...prev.price, range],
      };
    });
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Giá</h3>

      {ranges.map((r) => (
        <label key={r.label} className="flex gap-2 p-2 hover:bg-muted rounded cursor-pointer">
          <input
            type="checkbox"
            onChange={() => toggle(r)}
          />
          {r.label}
        </label>
      ))}
    </div>
  );
};