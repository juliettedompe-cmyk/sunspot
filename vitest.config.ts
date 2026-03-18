import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/services/**/*.ts",
        "src/models/**/*.ts",
        "src/controllers/**/*.ts",
        "src/lib/**/*.ts",
        "src/views/components/**/*.tsx",
      ],
      exclude: ["src/**/*.test.{ts,tsx}", "src/models/supabaseClient.ts"],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
