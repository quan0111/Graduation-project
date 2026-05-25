type StepType = 1 | 2 | 3 | 4 | 5;

interface StepperProps {
  step: StepType;
}

const steps = [
  "Địa chỉ nhận hàng",
  "Phương thức giao",
  "Phương thức thanh toán",
  "Xác nhận thanh toán",
  "Thanh toán QR",
] as const;

export const Stepper: React.FC<StepperProps> = ({ step }) => {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {steps.map((label, index) => {
        const currentStep = index + 1;
        const active = step >= currentStep;

        return (
          <div
            key={label}
            className={[
              "rounded-3xl border p-4 transition",
              active
                ? "border-orange-200 bg-orange-50"
                : "border-slate-200 bg-slate-50/80",
            ].join(" ")}
          >
            <div
              className={[
                "flex size-9 items-center justify-center rounded-2xl text-sm font-semibold",
                active ? "bg-[#ee4d2d] text-white" : "bg-white text-slate-500 ring-1 ring-slate-200",
              ].join(" ")}
            >
              {currentStep}
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900">{label}</p>
          </div>
        );
      })}
    </div>
  );
};
