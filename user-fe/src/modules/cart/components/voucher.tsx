// CartVoucher.tsx
export const CartVoucher = ({ onApply }) => {
  return (
    <div className="bg-white p-4 mt-4">
      <p className="font-medium">Shopee Voucher</p>
      <button
        onClick={() => onApply("DISCOUNT10")}
        className="text-blue-500"
      >
        Chọn mã
      </button>
    </div>
  );
};