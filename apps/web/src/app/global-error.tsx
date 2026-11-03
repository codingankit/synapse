"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 antialiased">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200/80 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Critical Application Error</h2>
          <p className="text-xs text-slate-500 mt-2">
            {error?.message || "An unexpected error occurred in the application."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </body>
    </html>
  );
}

