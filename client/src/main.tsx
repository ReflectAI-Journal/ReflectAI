import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  // Set dark mode as default if no theme preference exists
  if (!localStorage.getItem("reflect-theme")) {
    localStorage.setItem("reflect-theme", "dark");
  }
  
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="reflect-theme">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
