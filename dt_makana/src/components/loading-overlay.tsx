"use client";

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        {message && <span className="text-sm font-medium text-gray-700">{message}</span>}
      </div>
    </div>
  );
}
