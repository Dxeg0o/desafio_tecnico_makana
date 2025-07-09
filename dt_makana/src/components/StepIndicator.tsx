import React from "react";

export interface StepIndicatorProps {
  step: number;
  steps: string[];
  onStepChange?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step, steps, onStepChange }) => {
  return (
    <div className="flex space-x-2 mb-4">
      {steps.map((title, idx) => {
        const current = idx + 1 === step;
        return (
          <button
            key={idx}
            disabled={!onStepChange || idx + 1 > step}
            onClick={() => onStepChange?.(idx + 1)}
            className={`px-2 py-1 rounded text-sm border ${current ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            {idx + 1}. {title}
          </button>
        );
      })}
    </div>
  );
};
