import { LockKeyhole } from "lucide-react";

import { formatCurrency } from "../../utils/order";

interface Props {
  total: number;
  onSubmit: () => void;
  loading?: boolean;
  paymentMethod?: string;
}

export const Confirmation: React.FC<Props> = ({
  total,
  onSubmit,
  loading,
  paymentMethod = "COD",
}) => {
  const isGatewayPayment = paymentMethod === "MOMO" || paymentMethod === "VNPAY";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-3 font-medium text-emerald-800">
          <LockKeyhole className="size-4" />
          {isGatewayPayment ? "Thanh toán trước qua cổng bảo mật" : "Thanh toán và dữ liệu giao hàng được bảo vệ"}
        </div>
        <p className="mt-2 text-sm leading-6 text-emerald-700">
          {isGatewayPayment
            ? "Hệ thống chỉ tạo hóa đơn sau khi cổng thanh toán xác nhận giao dịch thành công."
            : "Sau khi xác nhận, hệ thống sẽ tạo đơn COD và chuyển sang bước theo dõi vận chuyển."}
        </p>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="h-12 w-full rounded-full bg-[#ee4d2d] font-semibold text-white transition hover:bg-[#d93f21] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Đang xử lý..."
          : isGatewayPayment
            ? `Thanh toán ${formatCurrency(total)}`
            : `Xác nhận đơn ${formatCurrency(total)}`}
      </button>
    </div>
  );
};
