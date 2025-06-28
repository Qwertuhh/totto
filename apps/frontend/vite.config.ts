import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, //? Increase the chunk limit (in kB)
  },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../shared"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 4173,
    fs: {
      allow: [".."], //? allow accessing files outside the root
    },
  },
  optimizeDeps: {
    include: ["@shared"],
  },
  envDir: "../../env",
});
