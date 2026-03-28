// ProductGallery.tsx
'use client';
import { useState } from "react";

export const ProductGallery = ({ images, name }) => {
  const [main, setMain] = useState(images?.[0]);

  return (
    <div>
      <div className="aspect-square bg-muted rounded mb-4 overflow-hidden">
        <img src={main} className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setMain(img)}
            className={`border-2 rounded overflow-hidden ${
              main === img ? "border-primary" : ""
            }`}
          >
            <img src={img} />
          </button>
        ))}
      </div>
    </div>
  );
};