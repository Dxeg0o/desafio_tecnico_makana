"use client";

import React from "react";

export interface ProcessingViewerProps {
  progress: number;
  stage: string;
  eta?: string;
}

export function ProcessingViewer({ progress, stage, eta }: ProcessingViewerProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <h2 className="text-2xl font-bold text-gray-900">Procesando datos...</h2>
      </div>
      <p className="text-gray-600">{stage}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">
        {progress.toFixed(0)}% completado
        {eta ? ` – aprox. ${eta} restantes` : ""}
      </p>
    </div>
  );
}
