// ShippingForm.tsx
export const ShippingForm = ({ onNext }) => {
  return (
    <div className="space-y-4">

      <input placeholder="Tên" className="input"/>
      <input placeholder="SĐT" className="input"/>
      <input placeholder="Email" className="input"/>
      <input placeholder="Địa chỉ" className="input"/>

      <button onClick={onNext} className="btn-primary w-full">
        Tiếp tục
      </button>
    </div>
  );
};