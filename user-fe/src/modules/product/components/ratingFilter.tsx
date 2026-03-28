// components/filters/RatingFilter.tsx
import { Star } from "lucide-react";

export const RatingFilter = ({ filters, setFilters }) => {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Đánh giá</h3>

      {[5, 4, 3, 2, 1].map((r) => (
        <label key={r} className="flex gap-2 p-2 hover:bg-muted rounded cursor-pointer">
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
              <Star key={i} size={14} className={i < r ? "text-yellow-400" : ""} />
            ))}
          </div>
        </label>
      ))}
    </div>
  );
};