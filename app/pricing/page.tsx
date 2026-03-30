"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [fullName, setFullName] = useState("User Fyntra");
  // Kita hapus pengecekan 'if (!mounted) return' yang bikin error tadi

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_pro")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsPro(profile.is_pro || false);
        setFullName(profile.full_name || "User Fyntra");
      }
    };
    fetchUser();
  }, []);

  const handlePayment = async () => {
    if (isPro) {
      toast.info("Anda sudah berada di paket Pro, Bos!");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Silakan login terlebih dahulu.");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: fullName,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: () => {
            toast.success("Berhasil! Mengaktifkan Pro...");
            setIsPro(true);
            setTimeout(() => window.location.reload(), 2000);
          },
          onClose: () => setLoading(false),
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Gunakan suppressHydrationWarning di div utama jika masih membandel
    <div
      className="max-w-6xl mx-auto pb-24 px-6 lg:px-0 bg-transparent"
      suppressHydrationWarning
    >
      {/* HERO SECTION */}
      <header className="mb-20 text-center relative pt-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>
        <span className="px-4 py-1.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block border border-blue-600/20">
          Penawaran Peluncuran Terbatas
        </span>
        <h1 className="font-space-grotesk text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Kendalikan <span className="text-blue-600">Uangmu.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-6 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Kelola keuangan lebih rapi dan otomatis tanpa batas menggunakan
          teknologi pendukung AI.
        </p>
      </header>

      {/* PRICING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 relative">
        {/* STARTER CARD */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col transition-all">
          <div className="mb-10">
            <h3 className="font-space-grotesk text-2xl font-bold dark:text-white uppercase italic tracking-tight">
              Starter
            </h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black dark:text-white">
                Gratis
              </span>
            </div>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            <FeatureItem text="Maksimal 2 Dompet (Bank/Cash)" active />
            <FeatureItem text="Catat Transaksi Manual" active />
            <FeatureItem text="3x Scan/Voice Input (AI) / Bulan" active />
            <FeatureItem text="Maksimal 3 Target (Goals)" active />
            <FeatureItem text="Export Laporan Excel/PDF" active={false} />
            <FeatureItem text="AI Financial Advisor" active={false} />
          </ul>
          <button
            disabled
            className="w-full py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] border border-slate-100 dark:border-slate-700"
          >
            {isPro ? "Paket Dasar" : "Paket Saat Ini"}
          </button>
        </div>

        {/* PRO CARD */}
        <div className="relative bg-slate-900 dark:bg-blue-600/5 dark:backdrop-blur-3xl p-10 rounded-[3.5rem] border-2 border-blue-600 shadow-2xl shadow-blue-500/20 flex flex-col overflow-hidden transition-all">
          <div className="absolute top-6 right-8 px-4 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
            Best Value
          </div>
          <div className="mb-10">
            <h3 className="font-space-grotesk text-2xl font-bold text-white uppercase italic tracking-tight">
              Pro
            </h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-400 mr-1 uppercase">
                Rp
              </span>
              <span className="text-5xl font-black text-white">19.000</span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                / Bulan
              </span>
            </div>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            <FeatureItem text="Unlimited Dompet & Rekening" active white />
            <FeatureItem text="Unlimited Scan/Voice Input (AI)" active white />
            <FeatureItem text="Automasi Tagihan Tanpa Batas" active white />
            <FeatureItem text="AI Dashboard Insight Advisor" active white />
            <FeatureItem text="Export Ready (Excel & PDF)" active white />
            <FeatureItem text="Akses Prioritas Fitur Baru" active white />
          </ul>
          <button
            onClick={handlePayment}
            disabled={loading || isPro}
            className={`w-full py-5 ${isPro ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-500 active:scale-95"} text-white rounded-[2rem] font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/40 transition-all`}
          >
            {loading
              ? "Memproses..."
              : isPro
                ? "Status PRO Aktif ✓"
                : "Berlangganan Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  text,
  active,
  white,
}: {
  text: string;
  active: boolean;
  white?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider ${active ? (white ? "text-blue-100" : "text-slate-700 dark:text-slate-200") : "text-slate-300 dark:text-slate-600 line-through opacity-50"}`}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${active ? (white ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600") : "bg-slate-100 dark:bg-slate-800 text-slate-300"}`}
      >
        {active ? "✓" : "✕"}
      </div>
      {text}
    </li>
  );
}
