// components/review.tsx

import { Star } from "lucide-react";

export const ProductReviews = ({
  reviews = [],
}: any) => {

  if (!reviews.length) {
    return (
      <div>Chưa có đánh giá</div>
    );
  }

  const rating =
    reviews.reduce(
      (a: number, b: any) =>
        a + (b.rating || 0),
      0
    ) / reviews.length;

  return (
    <div>

      {/* SUMMARY */}
      <div className="bg-[#fff8f5] p-8 flex gap-10 items-center mb-10">

        <div>

          <div className="text-[36px] text-[#ee4d2d]">
            {rating.toFixed(1)}
          </div>

          <div className="text-[#ee4d2d]">
            trên 5
          </div>

          <div className="flex mt-2">
            {[1,2,3,4,5].map((i) => (
              <Star
                key={i}
                size={18}
                className="fill-[#ee4d2d] text-[#ee4d2d]"
              />
            ))}
          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          <button className="border px-5 py-2 bg-[#ee4d2d] text-white">
            Tất Cả
          </button>

          <button className="border px-5 py-2">
            5 Sao
          </button>

          <button className="border px-5 py-2">
            4 Sao
          </button>

          <button className="border px-5 py-2">
            Có Bình Luận
          </button>

        </div>

      </div>

      {/* LIST */}
      <div className="space-y-8">

        {reviews.map((r: any) => (
          <div
            key={r.id}
            className="border-b pb-8"
          >

            <div className="flex gap-4">

              <div className="w-12 h-12 rounded-full bg-gray-200" />

              <div className="flex-1">

                <p className="font-medium">
                  {r.User?.full_name ||
                    "Người dùng"}
                </p>

                <div className="flex mt-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i <= r.rating
                          ? "fill-[#ee4d2d] text-[#ee4d2d]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-[#757575] mt-2">
                  {new Date(
                    r.created_at
                  ).toLocaleDateString("vi-VN")}
                </p>

                <p className="mt-4 leading-7">
                  {r.comment}
                </p>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};