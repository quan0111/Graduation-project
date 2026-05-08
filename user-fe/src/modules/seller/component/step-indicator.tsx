'use client'

import { Check } from 'lucide-react'
import type { RegistrationStep } from '../types'
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: { id: RegistrationStep; label: string }[]
  currentStep: RegistrationStep
  completedSteps: RegistrationStep[]
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  
  return (
    <div className="relative mb-20 px-10">
      {/* Background Line */}
      <div className="absolute left-15 right-15 top-5 h-0.5 bg-slate-100" />
      
      {/* Progress Line */}
      <div 
        className="absolute left-15 h-0.5 bg-primary transition-all duration-700 ease-in-out top-5"
        style={{ 
          width: `calc((${currentIndex} / ${steps.length - 1}) * (100% - 120px))`
        }}
      />

      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          
          return (
            <div key={step.id} className="relative flex flex-col items-center group">
              {/* Step Circle */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white font-bold transition-all duration-500",
                  isCompleted 
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" 
                    : isCurrent 
                      ? "border-primary text-primary scale-110 ring-8 ring-primary/10 shadow-sm" 
                      : "border-slate-200 text-slate-300 group-hover:border-slate-300 group-hover:text-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 animate-in zoom-in duration-300" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="absolute top-14 w-max text-center left-1/2 -translate-x-1/2">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                    isCurrent ? "text-primary" : isCompleted ? "text-slate-900" : "text-slate-300"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
