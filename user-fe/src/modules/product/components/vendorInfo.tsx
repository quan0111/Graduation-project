// components/vendorInfo.tsx

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const VendorInfo = ({ product }: any) => {

  const shop = product.shop;

  return (
    <div className="bg-white p-6">

      <div className="flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-5">

          <img
            src={
              shop?.avatarUrl ||
              "/shop-placeholder.png"
            }
            className="w-20 h-20 rounded-full border"
          />

          <div>

            <h3 className="text-[18px]">
              {shop?.name}
            </h3>

            <p className="text-[#757575] text-sm">
              Online 8 phút trước
            </p>

            <div className="flex gap-3 mt-4">

              <Button
                variant="outline"
                className="border-[#ee4d2d] text-[#ee4d2d]"
              >
                Chat Ngay
              </Button>

              <Link to={`/shop/${shop?.id}`}>
                <Button variant="outline">
                  Xem Shop
                </Button>
              </Link>

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">

          <div>
            <p className="text-[#757575]">
              Đánh Giá
            </p>

            <p className="text-[#ee4d2d]">
              4.9
            </p>
          </div>

          <div>
            <p className="text-[#757575]">
              Sản Phẩm
            </p>

            <p className="text-[#ee4d2d]">
              {shop?.productCount || 0}
            </p>
          </div>

          <div>
            <p className="text-[#757575]">
              Tỉ Lệ Phản Hồi
            </p>

            <p className="text-[#ee4d2d]">
              100%
            </p>
          </div>

          <div>
            <p className="text-[#757575]">
              Người Theo Dõi
            </p>

            <p className="text-[#ee4d2d]">
              2.1k
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};