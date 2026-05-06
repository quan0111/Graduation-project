// components/gallery.tsx

"use client";

import { useState, useEffect } from "react";

interface ProductGalleryProps {
  images?: string[];
  name?: string;
}

export const ProductGallery = ({
  images = [],
  name = "product",
}: ProductGalleryProps) => {
  const [main, setMain] = useState("");

  useEffect(() => {
    if (images.length > 0) {
      setMain(images[0]);
    }
  }, [images]);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        Không có ảnh
      </div>
    );
  }

  return (
    <div>

      {/* MAIN */}
      <div className="aspect-square border overflow-hidden">
        <img
          src={main}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* THUMB */}
      <div className="flex gap-2 mt-4 overflow-x-auto">

        {images.map((img, i) => {
          const active = img === main;

          return (
            <button
              key={i}
              onClick={() => setMain(img)}
              className={`w-20 h-20 border-2 overflow-hidden shrink-0 ${
                active
                  ? "border-[#ee4d2d]"
                  : "border-gray-200"
              }`}
            >
              <img
                src={img}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}

      </div>

    </div>
  );
};