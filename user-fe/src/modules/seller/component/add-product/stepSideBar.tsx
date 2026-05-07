import { CheckCircle2 } from "lucide-react";

import { STEPS } from "../../utils/addproduct";
import type { WizardStep } from "../../types/addproduct";

export function StepSidebar({
  currentStep,
  currentStepIndex,
  onStepChange,
}: {
  currentStep: WizardStep;
  currentStepIndex: number;
  onStepChange: (step: WizardStep) => void;
}) {
  return (
    <aside className="space-y-4">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = index < currentStepIndex;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepChange(step.id)}
            className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
              isActive
                ? "border-orange-300 bg-orange-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="size-4" /> : index + 1}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{step.label}</p>
                <p className="mt-1 text-sm text-slate-500">{step.description}</p>
              </div>
            </div>
          </button>
        );
      })}

      <div className="rounded-[24px] bg-slate-950 p-6 text-white">
        <p className="text-sm font-semibold"></p>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>Cần tối thiểu 3 ảnh.</li>
          <li>Mô tả rõ ràng thuộc tính đầy đủ</li>
          <li>Mỗi biến thể phải có tên số lượng,giá.</li>
        </ul>
      </div>
    </aside>
  );
}