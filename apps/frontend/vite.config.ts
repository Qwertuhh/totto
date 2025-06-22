import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../shared"),
    },
  },
  server: {
    fs: {
      allow: [".."], //? allow accessing files outside the root
    },
  },
  optimizeDeps: {
    include: ["@shared"],
  },
  envDir: "../../env",
});
