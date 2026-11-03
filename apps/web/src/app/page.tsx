import { getMemoryStatusCore } from "@synapse/core/memory";
import { ConsoleDashboard } from "@/components/ConsoleDashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialMemory;
  try {
    initialMemory = await getMemoryStatusCore();
  } catch (err: unknown) {
    console.error("[Home Page] Failed to fetch initial memory status:", err);
    initialMemory = {
      hasMemory: false,
      count: 0,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to memory database on load.",
    };
  }

  return <ConsoleDashboard initialMemory={initialMemory} />;
}
