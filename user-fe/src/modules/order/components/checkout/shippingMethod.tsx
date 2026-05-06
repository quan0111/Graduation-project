import type { ReactNode } from "react";
import { CheckCircle2, Truck } from "lucide-react";
import clsx from "clsx";

type ShippingMethodItem = {
  id: string;
  name: string;
  time: string;
  fee?: number;
  icon?: ReactNode;
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
      {methods.map((m) => {
        const active = value === m.id;

        return (
          <div
            key={m.id}
            onClick={() => onChange(m.id)}
            className={clsx(
              "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
              "hover:border-primary hover:shadow-sm",
              active
                ? "border-primary bg-primary/5 shadow"
                : "border-gray-200"
            )}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded bg-muted">
                {m.icon || <Truck size={18} />}
              </div>

              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.time}</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              {m.fee !== undefined && (
                <p className="text-sm font-semibold text-primary">
                  {m.fee.toLocaleString()}₫
                </p>
              )}

              {active ? (
                <CheckCircle2 className="text-primary" size={20} />
              ) : (
                <div className="w-5 h-5 rounded-full border border-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
