"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { FyntraProvider } from "@/context/FyntraContext";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FyntraProvider>
      {/* 1. Tambahkan dark:bg-slate-950 di sini agar sisi paling luar jadi hitam */}
      <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <TopNav />
          {/* 2. Tambahkan dark:bg-slate-950 di <main> ini kuncinya biar tengahnya nggak abu-abu */}
          <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-28 md:pb-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
          <BottomNav />
        </div>
      </div>

      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "1rem",
            fontWeight: "900",
            padding: "1rem",
            // Tambahkan sedikit sentuhan dark mode buat toast
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </FyntraProvider>
  );
}
