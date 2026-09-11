import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Explicit include/exclude — a compiled dist/test/*.test.js (from `tsc` building src/test
    // before tsconfig.json excluded it) would otherwise be picked up by Vitest's own default
    // glob alongside these real sources, silently running every suite twice.
    include: ["src/test/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    setupFiles: ["./src/test/setup.ts"],
    // Integration tests share one MySQL test database and mutate real rows — running them
    // concurrently would race. Sequential is slower but deterministic.
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
