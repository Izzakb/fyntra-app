"use client";
import { useFyntra } from "@/context/FyntraContext";
import { useEffect, useState } from "react";

export default function TopNav() {
  // PANGGIL avatarUrl DARI CONTEXT
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
    <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 px-10 py-5 flex justify-between items-center transition-all">
      <div className="flex items-center gap-4">
        {loadingGlobal ? (
          <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
        ) : /* LOGIKA MENAMPILKAN AVATAR / INISIAL */
        avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-md"
          />
        ) : (
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shadow-slate-900/20">
            {fullName ? fullName.charAt(0).toUpperCase() : "F"}
          </div>
        )}

        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Welcome back,
          </p>
          {loadingGlobal ? (
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-sm font-black italic text-slate-900 tracking-tighter">
              {fullName.split(" ")[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          {dateStr}
        </div>
        <button className="relative p-3 bg-white border border-slate-100 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
          🔔
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
