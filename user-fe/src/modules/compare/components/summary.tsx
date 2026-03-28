// sections/CompareSummary.tsx
export const CompareSummary = ({ list }) => {
  if (list.length < 2) return null;

  const bestPrice = list.reduce((min, p) => p.price < min.price ? p : min);
  const bestRating = list.reduce((max, p) => p.rating > max.rating ? p : max);

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">

      <div className="p-4 bg-green-50 rounded">
        <p>Giá tốt nhất</p>
        <p className="font-bold">{bestPrice.name}</p>
      </div>

      <div className="p-4 bg-yellow-50 rounded">
        <p>Đánh giá cao nhất</p>
        <p className="font-bold">{bestRating.name}</p>
      </div>

    </div>
  );
};