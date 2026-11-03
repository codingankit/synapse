import { supabase, SUPABASE_TABLE } from "../lib/supabase";
import { errorMessage } from "../lib/errors";

export interface MemoryStatusResult {
  hasMemory: boolean;
  count: number;
  error?: string;
}

export async function getMemoryStatusCore(): Promise<MemoryStatusResult> {
  try {
    const { count, error } = await supabase
      .from(SUPABASE_TABLE)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("[Memory] Error fetching memory status:", error.message);
      return { hasMemory: false, count: 0, error: error.message };
    }

    const totalCount = count ?? 0;
    return { hasMemory: totalCount > 0, count: totalCount };
  } catch (err) {
    const msg = errorMessage(err, "Failed to connect to memory database.");
    console.error("[Memory] getMemoryStatusCore failed:", msg);
    return { hasMemory: false, count: 0, error: msg };
  }
}

export async function clearMemoryCore(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("[Memory] Error clearing memory:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const msg = errorMessage(err, "Failed to clear memory from database.");
    console.error("[Memory] clearMemoryCore failed:", msg);
    return { success: false, error: msg };
  }
}
