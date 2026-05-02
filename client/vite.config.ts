import path from "path";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@common": path.resolve(__dirname, "./src/modules/common"),
      "@ui": path.resolve(__dirname, "./src/modules/common/components/ui"),
      "@hooks": path.resolve(__dirname, "./src/modules/common/hooks"),
      "@contexts": path.resolve(__dirname, "./src/modules/common/contexts"),
      "@controller": path.resolve(__dirname, "./src/modules/common/controllers"),
      "@types": path.resolve(__dirname, "./src/modules/common/types"),
      "@website": path.resolve(__dirname, "./src/config/website"),
    },
  },
  server: {
    port: 4300,
  },
});
