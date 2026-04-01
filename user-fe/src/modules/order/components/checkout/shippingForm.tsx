import { useState } from "react";

interface ShippingFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface ShippingFormProps {
  onNext: (data: ShippingFormValues) => void;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ onNext }) => {
  const [form, setForm] = useState<ShippingFormValues>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // validate đơn giản
    if (!form.name || !form.phone || !form.address) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    onNext(form);
  };

  return (
    <div className="space-y-4">
      <input
        name="name"
        placeholder="Tên"
        value={form.name}
        onChange={handleChange}
        className="input"
      />

      <input
        name="phone"
        placeholder="SĐT"
        value={form.phone}
        onChange={handleChange}
        className="input"
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="input"
      />

      <input
        name="address"
        placeholder="Địa chỉ"
        value={form.address}
        onChange={handleChange}
        className="input"
      />

      <button onClick={handleSubmit} className="btn-primary w-full">
        Tiếp tục
      </button>
    </div>
  );
};