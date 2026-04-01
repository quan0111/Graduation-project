// ProductDescription.tsx
import { useState } from "react";

interface ProductDescriptionProps {
  text?: string;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  text,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) {
    return (
      <div className="p-4 text-gray-400 italic">
        Chưa có mô tả sản phẩm
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border">
      <p
        className={`text-gray-700 whitespace-pre-line ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>

      {text.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-red-500 text-sm mt-2 hover:underline"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};