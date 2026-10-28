import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/ingest.ts", "src/memory.ts", "src/context.ts", "src/audit.ts"],
  target: "node24",
  format: ["esm"],
  fixedExtension: false,
  dts: true,
  sourcemap: true,
});
