"use server";

import { clearMemoryCore, getMemoryStatusCore } from "@synapse/core/memory";
import { ingestBrandBible } from "@synapse/core/ingest";
import { runAudit } from "@synapse/core/audit";
import { revalidatePath } from "next/cache";
import { type ActionState, type AuditActionResult } from "@/types";

export const MAX_FILE_UPLOAD_SIZE = 5 * 1024 * 1024;

// export async function handleIngestion(
//   formData: FormData,
// ): Promise<ActionState> {
//   const file = formData.get("brandBible") as File;
//   if (!file) {
//     return { success: false, error: "No file found" };
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const res = await ingestBrandBible(buffer, file.name);
//   if (res.success) {
//     return { success: true, fileName: res.fileName };
//   }
//   return { success: false, error: res.error };
// }

export async function handleIngestion(
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("brandBible");
  if (!(file instanceof File) || file.size === 0)
    return { success: false, error: "No file found" };
  if (!file.name.toLowerCase().endsWith(".pdf"))
    return { success: false, error: "Only PDF files are supported" };
  if (file.size > MAX_FILE_UPLOAD_SIZE)
    return { success: false, error: "File exceeds 20 MB" };

  const { hasMemory } = await getMemoryStatusCore();
  if (hasMemory)
    return { success: false, error: "Clear existing memory before ingesting" };

  const res = await ingestBrandBible(
    Buffer.from(await file.arrayBuffer()),
    file.name,
  );
  return res.success
    ? { success: true, fileName: res.fileName }
    : { success: false, error: res.error };
}

export async function getMemoryStatus() {
  return await getMemoryStatusCore();
}

export async function clearMemory() {
  const result = await clearMemoryCore();
  if (result.success) {
    revalidatePath("/");
  }
  return result;
}

export async function runAuditContent(
  content: string,
): Promise<AuditActionResult> {
  const outcome = await runAudit(content);
  if (!outcome.ok) {
    return {
      ok: false,
      message: `Audit unavailable (${outcome.reason}): ${outcome.message}`,
    };
  }
  return { ok: true, report: outcome.report };
}
