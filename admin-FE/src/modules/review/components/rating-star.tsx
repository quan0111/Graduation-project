import { Star } from "lucide-react";

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-warning text-warning"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}