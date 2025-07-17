"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, FileUp, Settings, Database, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{
    title: string;
    description: string;
  }>;
  onStepChange?: (step: number) => void;
}

const stepIcons = [FileUp, Settings, Database, Download];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
  onStepChange,
}) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = onStepChange && stepNumber <= currentStep;
          const Icon = stepIcons[index];

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <motion.button
                  whileHover={isClickable ? { scale: 1.08 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => isClickable && onStepChange(stepNumber)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-200",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-blue-500 border-blue-500 text-white",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-gray-100 border-gray-300 text-gray-400",
                    isClickable && "cursor-pointer",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.span>
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.button>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-blue-600",
                      isCompleted && "text-green-600",
                      !isCompleted && !isCurrent && "text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[8rem] mx-auto text-center">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 relative bg-gray-300">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: stepNumber < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: "left" }}
                    className="absolute inset-0 bg-green-500"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
