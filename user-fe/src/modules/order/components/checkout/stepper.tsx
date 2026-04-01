type StepType = 1 | 2 | 3 | 4;

interface StepperProps {
  step: StepType;
}

const steps = ["Địa chỉ", "Giao hàng", "Thanh toán", "Xác nhận"] as const;

export const Stepper: React.FC<StepperProps> = ({ step }) => {
  return (
    <div className="flex items-center mb-10">
      {steps.map((s, i) => {
        const currentStep = i + 1;

        return (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${
                step >= currentStep
                  ? "bg-primary text-white"
                  : "bg-muted"
              }`}
            >
              {currentStep}
            </div>

            <span className="ml-2 text-sm">{s}</span>
          </div>
        );
      })}
    </div>
  );
};