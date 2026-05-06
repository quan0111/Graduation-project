// components/shippingInfo.tsx

import {
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";

export const ShippingInfo = () => {
  return (
    <div className="space-y-5 mt-6">

      <div className="flex gap-8">

        <span className="w-24 text-[#757575]">
          Vận Chuyển
        </span>

        <div>

          <div className="flex items-center gap-2">
            <Truck size={18} />
            Miễn phí vận chuyển
          </div>

          <p className="text-[#05a] text-sm mt-1">
            Nhận hàng từ 2-5 ngày
          </p>

        </div>

      </div>

      <div className="flex gap-8">

        <span className="w-24 text-[#757575]">
          An Tâm
        </span>

        <div className="space-y-2">

          <div className="flex items-center gap-2">
            <RotateCcw size={18} />
            Trả hàng miễn phí 15 ngày
          </div>

          <div className="flex items-center gap-2">
            <Shield size={18} />
            Bảo hiểm thời trang
          </div>

        </div>

      </div>

    </div>
  );
};