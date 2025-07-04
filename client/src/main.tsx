import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  // Force dark mode as default by clearing any stored preferences
  localStorage.removeItem("reflect-theme");
  
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="reflect-theme">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
