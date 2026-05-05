import { Key } from "lucide-react";

interface Props {
  total: number;
  onSubmit: () => void;
  loading?: boolean;
}

export const Confirmation: React.FC<Props> = ({
  total,
  onSubmit,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-green-50 p-4 rounded">
        <Key size={18} />
        <span>Thanh toán bảo mật</span>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="btn-accent w-full py-3"
      >
        {loading
          ? "Đang xử lý..."
          : `Thanh toán ${total.toLocaleString()}đ`}
      </button>
    </div>
  );
};