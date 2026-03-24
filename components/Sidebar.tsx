"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Perhatikan kita menambahkan properti 'path'
const MENU_ITEMS = [
  { id: "home", label: "Dashboard", icon: "🏠", path: "/dashboard" },
  {
    id: "transactions",
    label: "Transactions",
    icon: "📑",
    path: "/dashboard/transactions",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    path: "/dashboard/analytics",
  },
  { id: "goals", label: "Future Goals", icon: "🎯", path: "/dashboard/goals" },
  {
    id: "wallets",
    label: "Manage Wallets",
    icon: "💼",
    path: "/dashboard/wallets",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    path: "/dashboard/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname(); // Membaca URL saat ini

  return (
    <aside className="w-72 bg-slate-950 text-white border-r border-slate-900 h-screen sticky top-0 flex flex-col p-8 transition-all">
      {/* LOGO AREA */}
      <div className="mb-12 px-4">
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          FYNTRA<span className="text-blue-500">.</span>
        </h1>
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">
          Faizax Ecosystem
        </p>
      </div>

      {/* NAV LINKS DENGAN ANIMASI SLIDING */}
      <nav className="flex-1 space-y-2 relative">
        {MENU_ITEMS.map((item) => {
          // Cek apakah menu ini sedang aktif berdasarkan URL
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {/* ANIMASI SLIDING PILL (Background) */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-blue-600 rounded-2xl z-0 shadow-lg shadow-blue-900/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* KONTEN MENU (Berada di atas background animasi) */}
              <span className="text-lg relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER SIDEBAR */}
      <div className="pt-8 border-t border-slate-900">
        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <p className="text-[9px] font-bold text-slate-300 uppercase">
              Secure & Active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
