import type { Filters, PriceRange } from "../types/filter";

interface PriceFilterProps {
  ranges: PriceRange[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const PriceFilter: React.FC<PriceFilterProps> = ({
  ranges,
  filters,
  setFilters,
}) => {
  const toggle = (range: PriceRange) => {
    setFilters((prev) => {
      const price = prev.price ?? [];

      const exists = price.some(
        (r) => r.min === range.min && r.max === range.max
      );

      return {
        ...prev,
        price: exists
          ? price.filter(
              (r) => r.min !== range.min || r.max !== range.max
            )
          : [...price, range],
      };
    });
  };

  const isChecked = (range: PriceRange) =>
    filters.price?.some(
      (r) => r.min === range.min && r.max === range.max
    );

  return (
    <div className="bg-white rounded-2xl shadow p-4 border">
  <h3 className="font-semibold mb-3 text-gray-800">Giá</h3>

  <div className="space-y-2">
    {ranges.map((r, i) => {
      const checked = isChecked(r);

      return (
        <label
          key={`${r.min}-${r.max}-${i}`}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggle(r)}
            className="accent-black"
          />
          <span className="text-sm">{r.label}</span>
        </label>
      );
    })}
  </div>
</div>
  );
};