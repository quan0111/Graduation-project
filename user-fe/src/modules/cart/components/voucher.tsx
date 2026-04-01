// CartVoucher.tsx

import React from "react";

type CartVoucherProps = {
  onApply: (code: string) => void;
};

export const CartVoucher: React.FC<CartVoucherProps> = ({
  onApply,
}) => {
  return (
    <div className="bg-white p-4 mt-4 rounded-lg">
      <p className="font-medium">Shopee Voucher</p>

      <button
        onClick={() => onApply("DISCOUNT10")}
        className="text-blue-500 mt-2"
      >
        Chọn mã
      </button>
    </div>
  );
};