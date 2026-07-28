import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(projectRoot, "github"),
  publicDir: path.resolve(projectRoot, "public"),
  base: process.env.GITHUB_PAGES_BASE || "/legado-fc/",
  plugins: [react()],
  build: {
    outDir: path.resolve(projectRoot, "github-dist"),
    emptyOutDir: true,
  },
});
