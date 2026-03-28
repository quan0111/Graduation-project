// EmptyState.tsx
import { Package } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="text-center py-16">
      <Package size={40} className="mx-auto mb-4 text-muted" />
      <p>Không có đơn hàng</p>
    </div>
  );
};