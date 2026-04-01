type ShippingMethodItem = {
  id: string;
  name: string;
  time: string;
  fee?: number;
};

interface ShippingMethodProps {
  value: string;
  onChange: (value: string) => void;
  methods: ShippingMethodItem[];
}

export const ShippingMethod: React.FC<ShippingMethodProps> = ({
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
          className={`p-4 border rounded cursor-pointer
          ${value === m.id ? "border-primary bg-primary/5" : ""}`}
        >
          <p>{m.name}</p>
          <p className="text-sm text-muted">{m.time}</p>

          {m.fee !== undefined && (
            <p className="text-sm font-medium">
              {m.fee.toLocaleString()}₫
            </p>
          )}
        </div>
      ))}
    </div>
  );
};