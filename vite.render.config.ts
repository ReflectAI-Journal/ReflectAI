import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  define: {
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_live_51R4aUADBTFagn9VwuddqLg0nUJFKkVCuh0736y6bqVK5m85lIYq0dhVx1aQVXPb1IJvT4woORco1Jw4c0V81BpOV009m2QPM3J'),
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:8080')
  }
}); 