'use client'

import { Check } from 'lucide-react'
import type { RegistrationStep } from '../types'

interface StepIndicatorProps {
  steps: { id: RegistrationStep; label: string }[]
  currentStep: RegistrationStep
  completedSteps: RegistrationStep[]
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id

          return (
            <div key={step.id} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground border-2 border-primary'
                      : 'bg-muted text-muted-foreground border-2 border-border'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Line to next step */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between mt-4">
        {steps.map((step) => (
          <div key={step.id} className="text-center flex-1">
            <p
              className={`text-sm font-medium transition-colors ${
                completedSteps.includes(step.id) || currentStep === step.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
