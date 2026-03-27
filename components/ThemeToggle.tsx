"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Mencegah layout shift: tampilkan bulatan kosong dengan ukuran yang sama saat belum dimuat
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900/50 animate-pulse border border-slate-100 dark:border-slate-800/50"></div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 group"
      aria-label="Toggle Theme"
    >
      <div className="group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-300 flex items-center justify-center">
        {theme === "dark" ? (
          /* SVG Bulan Minimalis */
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          /* SVG Matahari Minimalis */
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )}
      </div>
    </button>
  );
}
