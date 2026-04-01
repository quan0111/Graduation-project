// blocks/AddProductCard.tsx
import { Plus } from "lucide-react";

interface AddProductCardProps {
  onAdd: () => void;
}

export const AddProductCard: React.FC<AddProductCardProps> = ({ onAdd }) => {
  return (
    <div
      onClick={onAdd}
      className="
        border-2 border-dashed rounded-xl
        flex flex-col items-center justify-center
        min-h-[300px]
        cursor-pointer
        transition-all duration-200
        hover:border-red-400 hover:bg-red-50
        active:scale-95
      "
    >
      <Plus size={32} className="text-gray-500 mb-2" />
      <p className="text-gray-600 font-medium">Thêm sản phẩm</p>
    </div>
  );
};