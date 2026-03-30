"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [fullName, setFullName] = useState("User Fyntra");
  const [snapReady, setSnapReady] = useState(false);
  const snapCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Cek window.snap siap setiap 300ms maksimal 10 detik
  useEffect(() => {
    const checkSnap = () => {
      // @ts-ignore
      if (window.snap) {
        setSnapReady(true);
        if (snapCheckRef.current) clearInterval(snapCheckRef.current);
        return;
      }
    };
    checkSnap();
    snapCheckRef.current = setInterval(checkSnap, 300);
    const timeout = setTimeout(() => {
      if (snapCheckRef.current) clearInterval(snapCheckRef.current);
    }, 10000);
    return () => {
      if (snapCheckRef.current) clearInterval(snapCheckRef.current);
      clearTimeout(timeout);
    };
  }, []);

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
      toast.info("Anda sudah berada di paket Pro!");
      return;
    }

    // @ts-ignore
    if (!window.snap) {
      toast.error(
        "Sistem pembayaran belum siap. Tunggu sebentar lalu coba lagi.",
      );
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
      window.snap.pay(data.token, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil! Mengaktifkan Pro...");
          setIsPro(true);
          setTimeout(() => window.location.reload(), 2000);
        },
        onPending: () => {
          toast.info("Menunggu konfirmasi pembayaran...");
          setLoading(false);
        },
        onError: () => {
          toast.error("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ FIX DARK MODE: bungkus dengan bg gelap penuh
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar mini */}
      <nav className="fixed top-0 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/50 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link
            href="/"
            className="font-space-grotesk text-lg font-bold tracking-tight uppercase"
          >
            FYNTRA<span className="text-blue-500">.</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto pb-24 px-6 lg:px-0 pt-28">
        {/* HERO */}
        <header className="mb-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />
          <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block border border-blue-600/20">
            Penawaran Peluncuran Terbatas
          </span>
          <h1 className="font-space-grotesk text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase italic">
            Kendalikan <span className="text-blue-500">Uangmu.</span>
          </h1>
          <p className="text-slate-400 font-medium mt-6 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Kelola keuangan lebih rapi dan otomatis tanpa batas menggunakan
            teknologi pendukung AI.
          </p>
        </header>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* STARTER */}
          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-800/50 shadow-sm flex flex-col">
            <div className="mb-10">
              <h3 className="font-space-grotesk text-2xl font-bold text-white uppercase italic tracking-tight">
                Starter
              </h3>
              <div className="mt-4">
                <span className="text-4xl font-black text-white">Gratis</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-3 font-bold uppercase tracking-widest">
                Selamanya
              </p>
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
              className="w-full py-5 bg-slate-800/50 text-slate-500 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] border border-slate-700 cursor-default"
            >
              {isPro ? "Paket Dasar" : "Paket Saat Ini"}
            </button>
          </div>

          {/* PRO */}
          <div className="relative bg-slate-900 p-10 rounded-[3.5rem] border-2 border-blue-600 shadow-2xl shadow-blue-500/20 flex flex-col overflow-hidden">
            <div className="absolute top-6 right-8 px-4 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
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
              <p className="text-emerald-400 text-[11px] font-black uppercase tracking-wider mt-1 ml-1">
                ≈ Rp 600 / hari
              </p>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              <FeatureItem text="Unlimited Dompet & Rekening" active white />
              <FeatureItem
                text="Unlimited Scan/Voice Input (AI)"
                active
                white
              />
              <FeatureItem text="Automasi Tagihan Tanpa Batas" active white />
              <FeatureItem text="AI Dashboard Insight Advisor" active white />
              <FeatureItem text="Export Ready (Excel & PDF)" active white />
              <FeatureItem text="Akses Prioritas Fitur Baru" active white />
            </ul>
            <button
              onClick={handlePayment}
              disabled={loading || isPro}
              className={`w-full py-5 font-bold uppercase tracking-widest text-[10px] rounded-[2rem] shadow-xl transition-all
                ${
                  isPro
                    ? "bg-emerald-600 text-white cursor-default"
                    : !snapReady
                      ? "bg-slate-700 text-slate-400 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-blue-900/40"
                }`}
            >
              {loading
                ? "Memproses..."
                : isPro
                  ? "Status PRO Aktif ✓"
                  : !snapReady
                    ? "Memuat sistem pembayaran..."
                    : "Berlangganan Sekarang"}
            </button>
            <p className="text-center text-[9px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
              Pembayaran diproses melalui Midtrans.
            </p>
          </div>
        </div>

        {/* METODE PEMBAYARAN */}
        <section className="text-center mb-16 p-8 border border-slate-800/50 rounded-[3rem]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">
            Metode Pembayaran Aman
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-all duration-500">
            {["QRIS", "Virtual Account", "GoPay", "ShopeePay", "E-Wallet"].map(
              (m) => (
                <span
                  key={m}
                  className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-tighter"
                >
                  {m}
                </span>
              ),
            )}
          </div>
          <p className="text-[10px] text-slate-600 mt-5 font-medium">
            🔒 Seluruh transaksi diproses aman oleh{" "}
            <strong className="text-slate-500">Midtrans</strong>
          </p>
        </section>

        {/* FOOTER */}
        <footer className="text-center pt-12 border-t border-slate-800/50">
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-10">
            <a href="/terms" className="hover:text-blue-400 transition">
              Syarat & Ketentuan
            </a>
            <a href="/privacy" className="hover:text-blue-400 transition">
              Kebijakan Privasi
            </a>
            <a href="/refund" className="hover:text-blue-400 transition">
              Kebijakan Pengembalian Dana
            </a>
          </div>
          <div className="inline-block p-8 bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 text-slate-400 text-[11px] font-medium min-w-[300px]">
            <p className="font-black text-white mb-4 uppercase tracking-[0.3em]">
              Kontak Bisnis:
            </p>
            <p className="mb-1">
              WhatsApp:{" "}
              <a
                href="https://wa.me/6282117132290"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                +62 821-1713-2290
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:faizax.app@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                faizax.app@gmail.com
              </a>
            </p>
            <p className="mt-6 opacity-40 font-bold uppercase tracking-[0.2em]">
              Fyntra Financial by Faizax Ecosystem © 2026
            </p>
          </div>
        </footer>
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
      className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider
      ${active ? (white ? "text-blue-100" : "text-slate-200") : "text-slate-600 line-through opacity-50"}`}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]
        ${active ? (white ? "bg-blue-600 text-white" : "bg-blue-900/50 text-blue-400") : "bg-slate-800 text-slate-600"}`}
      >
        {active ? "✓" : "✕"}
      </div>
      {text}
    </li>
  );
}
