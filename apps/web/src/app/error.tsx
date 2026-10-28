"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Application Error Boundary caught an error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200/80 text-center flex flex-col items-center">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs flex items-center justify-center text-rose-500 mb-4 sm:mb-5">
          <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Something went wrong
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
          {error?.message || "An unexpected application error occurred."}
        </p>

        {error?.digest && (
          <span className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Digest: {error.digest}
          </span>
        )}

        <div className="flex items-center gap-3 w-full mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
        </div>
      </div>
    </div>
  );
}

