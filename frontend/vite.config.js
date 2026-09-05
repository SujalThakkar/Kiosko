import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://127.0.0.1:8000",
      "/rooms": "http://127.0.0.1:8000",
      "/components": "http://127.0.0.1:8000",
      "/requests": "http://127.0.0.1:8000",
      "/kiosk": "http://127.0.0.1:8000",
      "/issuances": "http://127.0.0.1:8000",
      "/reports": "http://127.0.0.1:8000",
    },
  },
});
