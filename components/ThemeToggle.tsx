"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl transition-all hover:scale-110 active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
