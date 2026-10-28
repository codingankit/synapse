"use client";

import { IngestionCardProps, MaxFileSize } from "@/types";
import { Upload, Database, Loader2, AlertCircle, X } from "lucide-react";
import { useState } from "react";

export function IngestionCard({
  hasMemory,
  ruleCount,
  isClearing,
  isAuditing,
  isUploading,
  showError,
  errorMessage,
  fileInputRef,
  onClearClick,
  onDismissError,
  ingestAction,
}: IngestionCardProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const displayedError = localError || (showError ? errorMessage : null);

  const validateFile = (file: File): string | null => {
    if (file.size === 0) {
      return "The selected file is empty (0 bytes). Please choose a valid PDF.";
    }

    const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    const isPdfMime =
      !file.type ||
      file.type === "application/pdf" ||
      file.type === "application/x-pdf" ||
      file.type === "application/octet-stream";

    if (!isPdfExtension || !isPdfMime) {
      return "Only .PDF files are allowed. Please select a valid PDF document.";
    }

    if (file.size > MaxFileSize.BYTES) {
      return `File size exceeds the ${MaxFileSize.MB}MB limit. Please choose a file under ${MaxFileSize.MB}MB.`;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    onDismissError?.();

    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setLocalError(error);
    }
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    const input = fileInputRef?.current;
    const file = input?.files?.[0];

    if (!file) {
      e.preventDefault();
      setLocalError("Please select a PDF file before uploading.");
      return;
    }

    const error = validateFile(file);
    if (error) {
      e.preventDefault();
      setLocalError(error);
      return;
    }

    setLocalError(null);
  };

  const handleDismiss = () => {
    setLocalError(null);
    onDismissError?.();
  };

  return (
    <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs sm:text-sm font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
            Memory Ingestion
          </h2>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-400 font-mono font-medium">
          .PDF Format (Max {MaxFileSize.MB}MB)
        </span>
      </div>

      {displayedError && (
        <div className="mb-4 p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs sm:text-sm text-rose-700 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3 pr-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
            <span className="font-medium">{displayedError}</span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {hasMemory ? (
        <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                Brand Context Active ({ruleCount} Rules)
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Clear current context before uploading a new Brand Bible.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearClick}
            disabled={isClearing || isAuditing || isUploading}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-bold rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {isClearing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Clear Context</span>
          </button>
        </div>
      ) : (
        <form
          action={ingestAction}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              ref={fileInputRef}
              type="file"
              name="brandBible"
              accept=".pdf,application/pdf"
              required
              disabled={isUploading || isClearing || isAuditing}
              onChange={handleFileChange}
              className="block w-full text-xs sm:text-sm text-slate-600 file:mr-3 file:sm:mr-4 file:py-2 file:sm:py-2.5 file:px-3.5 file:sm:px-5 file:rounded-lg file:border-0 file:text-xs file:sm:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer file:cursor-pointer border border-slate-200 rounded-xl bg-slate-50/50 p-1.5 outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading || isClearing || isAuditing}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5 shrink-0 shadow-xs transition-all active:scale-[0.98]"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? "Uploading..." : "Upload Context"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
