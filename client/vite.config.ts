import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@common": path.resolve(__dirname, "./src/core/common"),
      "@identity": path.resolve(__dirname, "./src/identity"),
      "@commerce": path.resolve(__dirname, "./src/commerce"),
      "@messaging": path.resolve(__dirname, "./src/messaging"),
      "@app-platform": path.resolve(__dirname, "./src/app_platform"),
      "@ui": path.resolve(__dirname, "./src/core/common/components/ui"),
      "@hooks": path.resolve(__dirname, "./src/core/common/hooks"),
      "@contexts": path.resolve(__dirname, "./src/core/common/contexts"),
      "@controller": path.resolve(__dirname, "./src/core/common/controllers"),
      "@types": path.resolve(__dirname, "./src/core/common/types"),
      "@website": path.resolve(__dirname, "./src/config/website"),
    },
  },
  server: {
    port: 4300,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
