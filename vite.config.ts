import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  server: {
    host: true,
    allowedHosts: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(projectRoot, "src/test/setup.ts")],
  },
});
