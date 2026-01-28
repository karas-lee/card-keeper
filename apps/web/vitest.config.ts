import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/test/**", "**/*.d.ts"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cardkeeper/shared-constants": path.resolve(__dirname, "../../packages/shared-constants/src"),
      "@cardkeeper/shared-utils": path.resolve(__dirname, "../../packages/shared-utils/src"),
      "@cardkeeper/shared-types": path.resolve(__dirname, "../../packages/shared-types/src"),
    },
  },
});
