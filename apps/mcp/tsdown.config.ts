import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/main.ts",
  target: "node24",
  format: "esm",
  fixedExtension: false,
  sourcemap: true,
});
