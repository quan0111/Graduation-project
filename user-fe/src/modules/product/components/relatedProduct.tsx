// components/relatedProduct.tsx

export const RelatedProducts = () => {

  return (
    <div className="grid grid-cols-6 gap-4">

      {[1,2,3,4,5,6].map((i) => (
        <div
          key={i}
          className="border hover:shadow cursor-pointer bg-white"
        >

          <div className="aspect-square bg-gray-100" />

          <div className="p-3">

            <h3 className="line-clamp-2 text-sm min-h-[40px]">
              Áo thun local brand form rộng unisex
            </h3>

            <div className="mt-2 text-[#ee4d2d] text-lg">
              ₫99.000
            </div>

            <div className="text-xs text-[#757575] mt-1">
              Đã bán 1.2k
            </div>

          </div>

        </div>
      ))}

    </div>
  );
};