import React from 'react'
import { Check, Loader2 } from 'lucide-react'

const ProgressIndicator = ({ steps, currentStep, variant = 'loading' }) => {
  return (
    <div className="card p-6">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-500' 
                  : isCurrent 
                  ? 'bg-primary' 
                  : 'bg-gray-700'
              }`}>
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isCurrent && variant === 'loading' ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <span className="text-sm font-medium text-white">{stepNumber}</span>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${
                  isCompleted || isCurrent ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {step.title}
                </p>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
              
              {isCurrent && variant === 'loading' && (
                <div className="text-primary text-sm font-medium">
                  In Progress...
                </div>
              )}
              
              {isCompleted && (
                <div className="text-green-400 text-sm font-medium">
                  Complete
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressIndicator