"use client";

import { useEffect, useState } from "react";

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
      <div className="flex aspect-square items-center justify-center bg-gray-100 text-sm text-slate-500">
        Không có ảnh
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden border">
        <img
          src={main}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {images.map((img, i) => {
          const active = img === main;

          return (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setMain(img)}
              className={`h-20 w-20 shrink-0 overflow-hidden border-2 ${
                active ? "border-[#ee4d2d]" : "border-gray-200"
              }`}
            >
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
