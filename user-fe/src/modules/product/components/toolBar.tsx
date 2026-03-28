// components/products/ProductToolbar.tsx
export const ProductToolbar = ({ count }) => {
  return (
    <div className="flex justify-between p-4 bg-card rounded mb-4">
      <span className="text-sm text-muted">
        Tìm thấy {count} sản phẩm
      </span>
    </div>
  );
};