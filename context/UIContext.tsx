"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
      return (saved as "light" | "dark") || "light";
    } catch {
      return "light";
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  return (
    <UIContext.Provider value={{ theme, toggleTheme, sidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUIContext must be used within a UIProvider");
  return context;
}
