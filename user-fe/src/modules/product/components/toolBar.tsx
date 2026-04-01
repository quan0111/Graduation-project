// components/products/ProductToolbar.tsx

interface ProductToolbarProps {
  count: number;
}

export const ProductToolbar: React.FC<ProductToolbarProps> = ({ count }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm mb-4">
      
      {/* Count */}
      <span className="text-sm text-muted-foreground">
        Tìm thấy <strong className="text-foreground">{count}</strong> sản phẩm
      </span>

    </div>
  );
};