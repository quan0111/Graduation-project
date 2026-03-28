import { Key } from "lucide-react";

export const Confirmation = ({ total }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded">
        <Key></Key> Thanh toán bảo mật
      </div>

      <button className="btn-accent w-full">
        Thanh toán {total.toLocaleString()}đ
      </button>
    </div>
  );
};