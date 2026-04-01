// ProductGallery.tsx
"use client";

import { useState, useEffect } from "react";

interface ProductGalleryProps {
  images?: string[];
  name?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  name = "product",
}) => {
  const [main, setMain] = useState<string>("");

  // 👉 sync khi images thay đổi
  useEffect(() => {
    if (images.length > 0) {
      setMain(images[0]);
    }
  }, [images]);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
        Không có ảnh
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="aspect-square bg-muted rounded mb-4 overflow-hidden group">
        <img
          src={main}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => {
          const isActive = main === img;

          return (
            <button
              key={`${img}-${i}`}
              onClick={() => setMain(img)}
              className={`border-2 rounded overflow-hidden transition ${
                isActive
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`${name}-${i}`}
                className="w-full h-20 object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};