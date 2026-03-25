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
  // INI DIA MENU BARUNYA BOS 🔥
  {
    id: "investments",
    label: "Asset",
    icon: "📈",
    path: "/dashboard/investments",
  },
  {
    id: "analytics",
    label: "Analytic",
    icon: "📊",
    path: "/dashboard/analytics",
  },
  {
    id: "subscriptions",
    label: "Auto",
    icon: "🔄",
    path: "/dashboard/subscriptions",
  },
  { id: "wallets", label: "Wallet", icon: "💼", path: "/dashboard/wallets" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-2 pb-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-colors duration-300 rounded-t-[1.5rem]">
      {/* 
        Container di-upgrade: 
        Ditambahin overflow-x-auto dan disembunyiin scrollbar-nya.
        Jadi kalau di HP layarnya kecil, menunya bisa digeser mulus ke kanan-kiri! 
      */}
      <div className="flex items-center gap-1 overflow-x-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              className="relative flex flex-col items-center justify-center p-3 min-w-[64px] flex-1 group outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-0 bg-blue-600 rounded-2xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <span
                className={`relative z-10 text-lg transition-transform ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`relative z-10 text-[8px] font-black uppercase tracking-widest mt-1 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600"
                }`}
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
