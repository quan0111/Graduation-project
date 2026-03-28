// ProductReviews.tsx
import { Star } from "lucide-react";

export const ProductReviews = ({ reviews }) => {
  return (
    <div>
      {reviews.map(r => (
        <div key={r.id} className="border-b py-4">
          <p className="font-semibold">{r.author}</p>

          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < r.rating ? "text-yellow-400" : ""}/>
            ))}
          </div>

          <p>{r.content}</p>
        </div>
      ))}
    </div>
  );
};