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
    // Format diubah ke en-GB biar koma sebelum tahun hilang (Cth: 26 March 2026)
    setDateStr(new Date().toLocaleDateString("en-GB", options));
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-10 py-5 flex justify-between items-center transition-all duration-300`}
    >
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
          /* Background Inisial Biru di Dark Mode */
          <div
            className={`font-space-grotesk w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-900/20 transition-all duration-300`}
          >
            {fullName ? fullName.charAt(0).toUpperCase() : "F"}
          </div>
        )}

        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors duration-300 leading-none">
            Welcome back,
          </p>
          {loadingGlobal ? (
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
          ) : (
            <p
              className={`font-space-grotesk text-sm font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300 mt-1 leading-none`}
            >
              {fullName ? fullName.split(" ")[0] : "User"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Kotak Tanggal */}
        <div className="hidden md:flex h-10 px-6 items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-full border border-slate-100 dark:border-slate-800/50 shadow-sm text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-all duration-300">
          {dateStr}
        </div>

        {/* SAKLAR TEMA HARUS DI SINI BOS */}
        <ThemeToggle />

        {/* TOMBOL NOTIFIKASI (Sekarang proporsional w-10 h-10) */}
        <button className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm group">
          <div className="relative group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-300">
            {/* SVG Lonceng Minimalis */}
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
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {/* Titik Merah Notifikasi (Posisi presisi di pojok ikon) */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-[1.5px] border-white dark:border-[#020617] rounded-full"></span>
          </div>
        </button>
      </div>
    </header>
  );
}
