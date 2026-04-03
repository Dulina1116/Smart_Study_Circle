import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Use 127.0.0.1 to avoid dual-stack (IPv6/IPv4) connect issues
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
