import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Look for any request starting with /api
      "/api": {
        target: "http://localhost:5000", // Your backend Express server port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
