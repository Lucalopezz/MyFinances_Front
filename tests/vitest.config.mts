import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("..", import.meta.url)),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./support/server-only.ts", import.meta.url),
      ),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
    ],
    environment: "node",
    setupFiles: ["tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts"],
      reporter: ["text-summary", "html", "lcovonly", "json-summary"],
      reportsDirectory: "coverage",
      thresholds: {
        statements: 25,
        lines: 25,
        branches: 18,
        functions: 18,
        "src/schemas/**": {
          statements: 100,
          lines: 100,
          functions: 100,
          branches: 90,
        },
        "src/utils/**": {
          statements: 90,
          lines: 95,
          functions: 100,
          branches: 80,
        },
        "src/lib/backend-fetch.ts": {
          statements: 90,
          lines: 90,
          functions: 100,
          branches: 95,
        },
      },
    },
  },
});
