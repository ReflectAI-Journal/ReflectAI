import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import App from "./App";
import "./index.css";

// Force dark mode as default by clearing any stored preferences
localStorage.removeItem("reflect-theme");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="reflect-theme">
    <App />
  </ThemeProvider>
);
