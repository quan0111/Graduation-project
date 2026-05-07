import { PriceFilter } from "./priceFilter";
import { RatingFilter } from "./ratingFilter";
import { ShopFilter } from "./shopFilter";
import type { IShop } from "@/modules/seller/types";
import type { Filters, PriceRange } from "../types/filter";

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  priceRanges: PriceRange[];
  shops: IShop[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  priceRanges,
  shops,
}) => {
  return (
    <aside className="sticky top-24 w-full space-y-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <PriceFilter ranges={priceRanges} filters={filters} setFilters={setFilters} />
      <RatingFilter filters={filters} setFilters={setFilters} />
      <ShopFilter shops={shops} filters={filters} setFilters={setFilters} />
    </aside>
  );
};
