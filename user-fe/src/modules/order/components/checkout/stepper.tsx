// Stepper.tsx
export const Stepper = ({ step }) => {
  const steps = ["Địa chỉ", "Giao hàng", "Thanh toán", "Xác nhận"];

  return (
    <div className="flex items-center mb-10">
      {steps.map((s, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${step >= i + 1 ? "bg-primary text-white" : "bg-muted"}`}
          >
            {i + 1}
          </div>
          <span className="ml-2 text-sm">{s}</span>
        </div>
      ))}
    </div>
  );
};