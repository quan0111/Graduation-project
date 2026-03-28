// components/filters/FilterSidebar.tsx
import { PriceFilter } from "./PriceFilter";
import { RatingFilter } from "./RatingFilter";
import { ShopFilter } from "./ShopFilter";

export const FilterSidebar = ({
  filters,
  setFilters,
  priceRanges,
  shops,
}) => {
  return (
    <div className="sticky top-24 space-y-4">
      <PriceFilter ranges={priceRanges} filters={filters} setFilters={setFilters} />
      <RatingFilter filters={filters} setFilters={setFilters} />
      <ShopFilter shops={shops} filters={filters} setFilters={setFilters} />
    </div>
  );
};