import type { IShop } from "@/modules/shop/types";
import type { Filters } from "../types/filter";

interface ShopFilterProps {
  shops: IShop[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const ShopFilter: React.FC<ShopFilterProps> = ({
  shops,
  filters,
  setFilters,
}) => {
  const toggle = (shopId: number) => {
    setFilters((prev) => {
      const current = prev.shop_ids ?? [];
      const exists = current.includes(shopId);

      return {
        ...prev,
        shop_ids: exists
          ? current.filter((id) => id !== shopId)
          : [...current, shopId],
      };
    });
  };

  const isChecked = (shopId: number) =>
    filters.shop_ids?.includes(shopId);

  return (
    <div className="bg-white rounded-2xl shadow p-4 border">
  <h3 className="font-semibold mb-3 text-gray-800">Cửa hàng</h3>

  <div className="space-y-2">
    {/* Tất cả */}
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
      <input
        type="checkbox"
        checked={!filters.shop_ids?.length}
        onChange={() =>
          setFilters((p) => ({ ...p, shop_ids: [] }))
        }
        className="accent-black"
      />
      <span className="text-sm font-medium">Tất cả</span>
    </label>

    {shops.map((shop) => (
      <label
        key={shop.id}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
      >
        <input
          type="checkbox"
          checked={isChecked(shop.id)}
          onChange={() => toggle(shop.id)}
          className="accent-black"
        />
        <span className="text-sm">{shop.name}</span>
      </label>
    ))}
  </div>
</div>
  );
};
