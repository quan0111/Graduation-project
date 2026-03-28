// blocks/AddProductCard.tsx
import { Plus } from "lucide-react";

export const AddProductCard = ({ onAdd }) => {
  return (
    <div
      onClick={onAdd}
      className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:border-red-400"
    >
      <Plus size={32}/>
      <p>Thêm sản phẩm</p>
    </div>
  );
};