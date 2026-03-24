"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  { id: "home", label: "Home", icon: "🏠", path: "/dashboard" },
  {
    id: "transactions",
    label: "Trans",
    icon: "📑",
    path: "/dashboard/transactions",
  },
  {
    id: "analytics",
    label: "Analytic",
    icon: "📊",
    path: "/dashboard/analytics",
  },
  { id: "wallets", label: "Wallet", icon: "💼", path: "/dashboard/wallets" },
  { id: "settings", label: "Set", icon: "⚙️", path: "/dashboard/settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 p-2 pb-5 shadow-2xl rounded-t-[1.5rem]">
      <div className="flex justify-around items-center gap-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              className="relative flex flex-col items-center justify-center p-3 w-16 group outline-none"
            >
              {/* Indikator Active Estetik */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-0 bg-blue-600 rounded-2xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Konten Menu */}
              <span
                className={`relative z-10 text-lg transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
              >
                {item.icon}
              </span>
              <span
                className={`relative z-10 text-[8px] font-black uppercase tracking-widest mt-1 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
