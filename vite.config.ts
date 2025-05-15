import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Determine if we're running in Replit environment
const isReplitEnv = process.env.REPL_ID !== undefined;

export default defineConfig({
  plugins: [
    react(),
    // Only include Replit-specific plugins when in Replit environment
    ...(isReplitEnv && process.env.NODE_ENV !== "production" 
      ? [
          // Dynamic import of Replit-specific plugins to prevent errors in other environments
          (async () => {
            try {
              const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal")
                .then(m => m.default);
              return runtimeErrorOverlay();
            } catch (e) {
              console.warn("Replit runtime error overlay plugin not available");
              return null;
            }
          })(),
          (async () => {
            try {
              return await import("@replit/vite-plugin-cartographer")
                .then(m => m.cartographer());
            } catch (e) {
              console.warn("Replit cartographer plugin not available");
              return null;
            }
          })()
        ].filter(Boolean)
      : []),
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
    'import.meta.env.VITE_API_URL': JSON.stringify('https://reflectai-n3f0.onrender.com')
  }
});
