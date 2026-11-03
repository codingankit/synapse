"use client";

import {
  useActionState,
  useState,
  useTransition,
  useRef,
  useCallback,
} from "react";
import { Layers } from "lucide-react";
import type { AuditReport } from "@synapse/core/audit";
import {
  handleIngestion,
  runAuditContent,
  getMemoryStatus,
  clearMemory,
} from "@/actions";
import { IngestionCard } from "@/components/IngestionCard";
import { ExecutionTestbench } from "@/components/ExecutionTestbench";
import { AuditFeedback } from "@/components/AuditFeedback";
import { ConfirmClearModal } from "@/components/ConfirmClearModal";
import type { ActionState, ConsoleDashboardProps } from "@/types";

export function ConsoleDashboard({ initialMemory }: ConsoleDashboardProps) {
  const [isAuditing, startAudit] = useTransition();
  const [isClearing, startClearing] = useTransition();
  const [hasMemory, setHasMemory] = useState<boolean>(initialMemory.hasMemory);
  const [ruleCount, setRuleCount] = useState<number>(initialMemory.count || 0);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [content, setContent] = useState("");
  const [auditResults, setAuditResults] = useState<AuditReport | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [currentError, setCurrentError] = useState<string | null>(
    initialMemory.error ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshMemory = useCallback(async () => {
    try {
      const status = await getMemoryStatus();
      if (status.error) {
        // Upload succeeded but we can't confirm the rule count — warn the user.
        setCurrentError(
          "Upload succeeded, but the rule count could not be refreshed. Try reloading the page if the count looks wrong.",
        );
        return;
      }
      setHasMemory(status.hasMemory);
      setRuleCount(status.count || 0);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh memory status.";
      console.error("[refreshMemory] Unexpected error:", msg);
      setCurrentError(
        "Upload succeeded but the memory status could not be refreshed. Try reloading the page.",
      );
    }
  }, []);

  const [, ingestAction, isUploading] = useActionState<
    ActionState,
    FormData
  >(
    async (_prevState: ActionState, formData: FormData) => {
      setCurrentError(null);
      try {
        const result = await handleIngestion(formData);
        if (result.success) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          setCurrentError(null);
          await refreshMemory();
        } else if (result.error) {
          setCurrentError(result.error);
        }
        return result;
      } catch (err: unknown) {
        console.error("[useActionState] handleIngestion error:", err);
        const fallbackMsg =
          err instanceof Error
            ? err.message
            : "Failed to upload file. Please check your connection and try again.";
        setCurrentError(fallbackMsg);
        return { success: false, error: fallbackMsg };
      }
    },
    { success: false, fileName: null, error: null },
  );

  const confirmClear = () => {
    if (isAuditing || isClearing) return;
    setShowClearConfirm(false);
    startClearing(async () => {
      try {
        const res = await clearMemory();
        if (res.success) {
          setHasMemory(false);
          setRuleCount(0);
          setAuditResults(null);
          setAuditError(null);
          setCurrentError(null);
        } else {
          setCurrentError(res.error || "Failed to clear memory context.");
        }
      } catch (err: unknown) {
        console.error("[confirmClear] Unexpected error:", err);
        setCurrentError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while clearing memory context.",
        );
      }
    });
  };

  const triggerAudit = () => {
    if (!content.trim() || isAuditing || isClearing) return;

    startAudit(async () => {
      setAuditError(null);
      try {
        const response = await runAuditContent(content.trim());
        if (response.ok) {
          setAuditResults(response.report);
        } else {
          setAuditResults(null);
          setAuditError(response.message);
        }
      } catch (err: unknown) {
        console.error("[triggerAudit] Unexpected error:", err);
        setAuditResults(null);
        setAuditError(
          err instanceof Error
            ? err.message
            : "Audit request failed. Please try again.",
        );
      }
    });
  };

  return (
    <main className="min-h-screen lg:h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col overflow-y-auto lg:overflow-hidden antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* NAVBAR */}
      <header className="h-16 sm:h-18 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-none">
              SYNAPSE
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1 block">
              Brand Governance Console
            </span>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-0">
        <div className="lg:col-span-7 flex flex-col h-auto lg:h-full bg-slate-50/50 min-h-0">
          <IngestionCard
            hasMemory={hasMemory}
            ruleCount={ruleCount}
            isClearing={isClearing}
            isAuditing={isAuditing}
            isUploading={isUploading}
            showError={Boolean(currentError)}
            errorMessage={currentError}
            fileInputRef={fileInputRef}
            onClearClick={() => setShowClearConfirm(true)}
            onDismissError={() => setCurrentError(null)}
            ingestAction={ingestAction}
          />

          <ExecutionTestbench
            hasMemory={hasMemory}
            content={content}
            isAuditing={isAuditing}
            isClearing={isClearing}
            onChangeContent={setContent}
            onClearContent={() => setContent("")}
            onTriggerAudit={triggerAudit}
          />
        </div>

        <AuditFeedback
          auditResults={auditResults}
          errorMessage={auditError}
          isAuditing={isAuditing}
          onClearAudit={() => {
            setAuditResults(null);
            setAuditError(null);
          }}
        />
      </div>

      {showClearConfirm && (
        <ConfirmClearModal
          ruleCount={ruleCount}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={confirmClear}
        />
      )}
    </main>
  );
}
