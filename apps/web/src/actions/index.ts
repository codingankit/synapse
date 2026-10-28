"use server";

import { clearMemoryCore, getMemoryStatusCore } from "@synapse/core/memory";
import { ingestBrandBible } from "@synapse/core/ingest";
import { runAudit } from "@synapse/core/audit";
import { revalidatePath } from "next/cache";
import { MaxFileSize, type ActionState, type AuditActionResult } from "@/types";

export async function handleIngestion(
  formData: FormData,
): Promise<ActionState> {
  try {
    const file = formData.get("brandBible");
    if (!file || !(file instanceof File)) {
      return { success: false, error: "No file was uploaded. Please select a PDF file." };
    }

    if (file.size === 0) {
      return {
        success: false,
        error: "The uploaded file is empty (0 bytes). Please select a valid PDF.",
      };
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".pdf")) {
      return {
        success: false,
        error: "Only .PDF files are supported. Please upload a valid PDF document.",
      };
    }

    if (
      file.type &&
      file.type !== "application/pdf" &&
      file.type !== "application/x-pdf" &&
      file.type !== "application/octet-stream"
    ) {
      return {
        success: false,
        error: "Invalid file format. Only PDF files are allowed.",
      };
    }

    if (file.size > MaxFileSize.BYTES) {
      return {
        success: false,
        error: `File size exceeds the ${MaxFileSize.MB}MB limit. Please upload a smaller file.`,
      };
    }

    // Deep check: Read header bytes to verify PDF magic bytes (%PDF)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const magicHeader = buffer.subarray(0, 5).toString("utf-8");
    if (!magicHeader.startsWith("%PDF")) {
      return {
        success: false,
        error: "The selected file does not appear to be a genuine PDF document.",
      };
    }

    const status = await getMemoryStatusCore();
    if (status.error) {
      return {
        success: false,
        error: `Could not verify memory state: ${status.error}`,
      };
    }
    if (status.hasMemory) {
      return {
        success: false,
        error: "Clear existing memory before ingesting a new Brand Bible.",
      };
    }

    const res = await ingestBrandBible(buffer, file.name);
    return res.success
      ? { success: true, fileName: res.fileName }
      : {
          success: false,
          error: res.error || "Failed to process and ingest brand rules.",
        };
  } catch (err: unknown) {
    console.error("[handleIngestion] Uncaught error during ingestion:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while processing the file.",
    };
  }
}

export async function getMemoryStatus() {
  try {
    return await getMemoryStatusCore();
  } catch (err: unknown) {
    console.error("[getMemoryStatus] Failed to retrieve status:", err);
    return {
      hasMemory: false,
      count: 0,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to memory store.",
    };
  }
}

export async function clearMemory(): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await clearMemoryCore();
    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (err: unknown) {
    console.error("[clearMemory] Failed to clear memory:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while clearing memory.",
    };
  }
}

export async function runAuditContent(
  content: string,
): Promise<AuditActionResult> {
  try {
    if (!content || !content.trim()) {
      return {
        ok: false,
        message: "No content was provided for auditing.",
      };
    }

    const outcome = await runAudit(content.trim());
    if (!outcome.ok) {
      return {
        ok: false,
        message: `Audit unavailable (${outcome.reason}): ${outcome.message}`,
      };
    }
    return { ok: true, report: outcome.report };
  } catch (err: unknown) {
    console.error("[runAuditContent] Error running audit:", err);
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while executing the audit.",
    };
  }
}
