import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import App from "./App";
import "./index.css";
import { initCapacitorPlugins } from "./capacitor-plugins";

// Initialize Capacitor plugins
initCapacitorPlugins();

// Force dark mode as default by clearing any stored preferences
localStorage.removeItem("reflect-theme");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="reflect-theme">
    <App />
  </ThemeProvider>
);
