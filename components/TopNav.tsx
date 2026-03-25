"use client";
import { useFyntra } from "@/context/FyntraContext";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle"; // JANGAN LUPA IMPORT INI BOS

export default function TopNav() {
  const { fullName, avatarUrl, loadingGlobal } = useFyntra();
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDateStr(new Date().toLocaleDateString("id-ID", options));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-10 py-5 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-4">
        {loadingGlobal ? (
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md transition-all duration-300"
          />
        ) : (
          /* Background Inisial ganti jadi Biru pas Dark Mode biar nggak mati warnanya */
          <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shadow-slate-900/20 transition-all duration-300">
            {fullName ? fullName.charAt(0).toUpperCase() : "F"}
          </div>
        )}

        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors duration-300">
            Welcome back,
          </p>
          {loadingGlobal ? (
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-sm font-black italic text-slate-900 dark:text-white tracking-tighter transition-colors duration-300">
              {fullName ? fullName.split(" ")[0] : "User"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Kotak Tanggal */}
        <div className="hidden md:block px-6 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 italic transition-all duration-300">
          {dateStr}
        </div>

        {/* SAKLAR TEMA HARUS DI SINI BOS */}
        <ThemeToggle />

        <button className="relative p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm group">
          <span className="group-hover:scale-110 inline-block transition-transform">
            🔔
          </span>
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
