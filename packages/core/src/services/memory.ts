import { supabase, SUPABASE_TABLE } from "../lib/supabase";

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
      console.error("Error fetching memory status:", error.message);
      return { hasMemory: false, count: 0, error: error.message };
    }

    const totalCount = count ?? 0;
    return { hasMemory: totalCount > 0, count: totalCount };
  } catch (error) {
    console.error("Failed to get memory status:", error);
    return {
      hasMemory: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function clearMemoryCore() {
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Error clearing memory:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to clear memory:", error.message);
    return { success: false, error: "Failed to clear memory from database." };
  }
}
