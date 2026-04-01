import { Star } from "lucide-react";
import type { Filters } from "../types/filter";

interface RatingFilterProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const RatingFilter: React.FC<RatingFilterProps> = ({
  filters,
  setFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border">
      <h3 className="font-semibold mb-3 text-gray-800">Đánh giá</h3>

      <div className="space-y-2">
        {/* Tất cả */}
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
          <input
            type="radio"
            checked={!filters.rating}
            onChange={() =>
              setFilters((prev) => ({
                ...prev,
                rating: undefined,
              }))
            }
          />
          <span className="text-sm">Tất cả</span>
        </label>

        {[5, 4, 3, 2, 1].map((r) => (
          <label
            key={r}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
          >
            <input
              type="radio"
              checked={filters.rating === r}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  rating: r,
                }))
              }
            />

            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < r
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            <span className="text-sm">& trở lên</span>
          </label>
        ))}
      </div>
    </div>
  );
};