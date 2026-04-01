// sections/CompareSummary.tsx

interface Product {
  id: string | number;
  name: string;
  price: number;
  rating?: number;
}

interface CompareSummaryProps {
  list: Product[];
}

export const CompareSummary: React.FC<CompareSummaryProps> = ({ list }) => {
  if (!list || list.length < 2) return null;

  const bestPrice = list.reduce((min, p) =>
    p.price < min.price ? p : min
  );

  const bestRating = list.reduce((max, p) =>
    (p.rating ?? 0) > (max.rating ?? 0) ? p : max
  );

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">

      {/* Best price */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <p className="text-sm text-gray-600">Giá tốt nhất</p>
        <p className="font-bold text-green-600">{bestPrice.name}</p>
        <p className="text-sm">
          {new Intl.NumberFormat("vi-VN").format(bestPrice.price)}đ
        </p>
      </div>

      {/* Best rating */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <p className="text-sm text-gray-600">Đánh giá cao nhất</p>
        <p className="font-bold text-yellow-600">{bestRating.name}</p>
        <p className="text-sm">
          ⭐ {bestRating.rating ?? 0}
        </p>
      </div>

    </div>
  );
};