// components/Confirmation.tsx

import { Key } from "lucide-react";

interface ConfirmationProps {
  total: number;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ total }) => {
  return (
    <div className="space-y-4">

      {/* Security notice */}
      <div className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-lg">
        <Key size={18} />
        <span className="text-sm font-medium">
          Thanh toán bảo mật
        </span>
      </div>

      {/* Checkout button */}
      <button className="btn-accent w-full py-3 text-sm font-semibold">
        Thanh toán {total.toLocaleString("vi-VN")}đ
      </button>

    </div>
  );
};