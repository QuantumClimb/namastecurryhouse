import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy disabled - using production API directly via VITE_API_URL
    // Uncomment if you want to run local backend server:
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3001",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/images": {
    //     target: "http://localhost:3001",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
