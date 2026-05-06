import type { ReactNode } from "react";
import type { PaymentMethodType } from "../../types";
import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";

type PaymentMethodItem = {
  id: PaymentMethodType;
  name: string;
  icon?: ReactNode;
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
              {/* icon */}
              <div className="w-8 h-8 flex items-center justify-center rounded bg-muted">
                {m.icon || "💳"}
              </div>

              {/* text */}
              <span className="font-medium">{m.name}</span>
            </div>

            {/* RIGHT (radio style) */}
            <div>
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
