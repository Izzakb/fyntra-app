"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { FyntraProvider } from "@/context/FyntraContext";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. PROVIDER: Membungkus seluruh aplikasi agar data saldo sinkron
    <FyntraProvider>
      <div className="flex bg-slate-50 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* 2. SIDEBAR: Navigasi Kiri (Tetap diam saat pindah halaman) */}
        <Sidebar />

        {/* AREA KONTEN UTAMA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* 3. TOPNAV: Navigasi Atas (Glassmorphism & Profil) */}
          <TopNav />

          {/* 4. KONTEN DINAMIS: Tempat halaman Home/Transactions/Goals muncul */}
          <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>

      {/* 5. TOASTER: Pusat Notifikasi (Muncul di pojok kanan bawah) */}
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "1rem",
            fontWeight: "900", // Font tebal agar senada dengan Faizax Style
            padding: "1rem",
          },
        }}
      />
    </FyntraProvider>
  );
}
