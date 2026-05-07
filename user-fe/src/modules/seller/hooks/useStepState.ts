import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { STEPS } from "../utils/addproduct";
import type { WizardStep } from "../types/addproduct";

export function useStepState(allErrorsByStep: Record<WizardStep, string[]>) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("media");

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((step) => step.id === currentStep),
    [currentStep],
  );

  const goNext = useCallback(() => {
    const errors = allErrorsByStep[currentStep];
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const nextStep = STEPS[currentStepIndex + 1];
    if (nextStep) setCurrentStep(nextStep.id);
  }, [allErrorsByStep, currentStep, currentStepIndex]);

  const goPrev = useCallback(() => {
    const previousStep = STEPS[currentStepIndex - 1];
    if (previousStep) setCurrentStep(previousStep.id);
  }, [currentStepIndex]);

  return {
    currentStep,
    currentStepIndex,
    setCurrentStep,
    goNext,
    goPrev,
  };
}
