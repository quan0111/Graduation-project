import type { PaymentMethodType } from "../../types";

type PaymentMethodItem = {
  id: PaymentMethodType;
  name: string;
  icon?: React.ReactNode;
};

interface PaymentMethodProps {
  value: PaymentMethodType;
  onChange: (value: PaymentMethodType) => void;
  methods: PaymentMethodItem[];
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  value,
  onChange,
  methods,
}) => {
  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <div
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`p-4 border rounded cursor-pointer flex gap-2
          ${value === m.id ? "border-primary bg-primary/5" : ""}`}
        >
          <span>{m.icon}</span>
          <span>{m.name}</span>
        </div>
      ))}
    </div>
  );
};