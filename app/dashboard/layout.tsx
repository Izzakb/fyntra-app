"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav"; // IMPORT INI
import { FyntraProvider } from "@/context/FyntraContext";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FyntraProvider>
      <div className="flex bg-slate-50 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
        <Sidebar /> {/* Sembunyi di mobile */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <TopNav />
          {/* PERBAIKI PADDING: p-4 di mobile, p-10 di desktop. TAMBAHKAN pb-28 agar konten tidak tertutup BottomNav */}
          <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-28 md:pb-10 custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
          <BottomNav /> {/* Muncul di mobile */}
        </div>
      </div>

      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: { borderRadius: "1rem", fontWeight: "900", padding: "1rem" },
        }}
      />
    </FyntraProvider>
  );
}
