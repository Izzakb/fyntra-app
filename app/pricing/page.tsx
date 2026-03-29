"use client";
import { useState } from "react";
import { toast } from "sonner";

// FONT PREMIUM
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    toast.info("Menyiapkan enkripsi pembayaran aman...");

    // Integrasi Snap Midtrans (Sandbox/Production)
    setTimeout(() => {
      setLoading(false);
      toast.error("Sistem pembayaran sedang dikonfigurasi.");
    }, 2000);
  };

  return (
    <div
      className={`${inter.className} max-w-6xl mx-auto pb-24 px-6 lg:px-0 bg-transparent`}
    >
      {/* --- HERO SECTION --- */}
      <header className="mb-20 text-center relative pt-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>
        <span className="px-4 py-1.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block border border-blue-600/20">
          Limited Launch Offer
        </span>
        <h1
          className={`${spaceGrotesk.className} text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase italic`}
        >
          Master Your <span className="text-blue-600">Money.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-6 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Kelola keuangan lebih rapi dan otomatis tanpa batas menggunakan
          teknologi pendukung AI.
        </p>
      </header>

      {/* --- PRICING CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 relative">
        {/* STARTER - FREE */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col transition-all">
          <div className="mb-10">
            <h3
              className={`${spaceGrotesk.className} text-2xl font-bold dark:text-white uppercase italic tracking-tight`}
            >
              Starter
            </h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black dark:text-white">
                Gratis
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-4 font-bold uppercase tracking-widest leading-relaxed">
              Esensial untuk disiplin keuangan harian.
            </p>
          </div>

          <ul className="space-y-5 mb-12 flex-1">
            <FeatureItem text="Maksimal 2 Dompet (Bank/Cash)" active />
            <FeatureItem text="Catat Transaksi Manual" active />
            <FeatureItem text="3x Scan/voice input (AI) / Bulan" active />
            <FeatureItem text="Maksimal 3 Target (Goals)" active />
            <FeatureItem text="Export Laporan Excel/PDF" active={false} />
            <FeatureItem text="AI Financial Advisor" active={false} />
          </ul>

          <button
            disabled
            className="w-full py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] border border-slate-100 dark:border-slate-700"
          >
            Paket Saat Ini
          </button>
        </div>

        {/* PRO - PAID (19rb) */}
        <div className="relative bg-slate-900 dark:bg-blue-600/5 dark:backdrop-blur-3xl p-10 rounded-[3.5rem] border-2 border-blue-600 shadow-2xl shadow-blue-500/20 flex flex-col overflow-hidden transform transition-all">
          <div className="absolute top-6 right-8 px-4 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
            Best Value
          </div>

          <div className="mb-10">
            <h3
              className={`${spaceGrotesk.className} text-2xl font-bold text-white uppercase italic tracking-tight`}
            >
              Pro
            </h3>
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400 mr-1 uppercase">
                  Rp
                </span>
                <span className="text-5xl font-black text-white">19.000</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  / Bulan
                </span>
              </div>
              <p className="text-emerald-400 text-[11px] font-black uppercase tracking-wider ml-1">
                ≈ Rp 600 / hari
              </p>
            </div>
            <p className="text-blue-200/60 text-[11px] mt-4 font-bold uppercase tracking-widest leading-relaxed">
              Kelola keuangan lebih rapi dan otomatis tanpa batas.
            </p>
          </div>

          <ul className="space-y-5 mb-12 flex-1">
            <FeatureItem text="Unlimited Dompet & Rekening" active white />
            <FeatureItem text="Unlimited Scan/voice input (AI)" active white />
            <FeatureItem text="Automasi Tagihan Tanpa Batas" active white />
            <FeatureItem text="AI Dashboard Insight Advisor" active white />
            <FeatureItem text="Export Ready (Excel & PDF)" active white />
            <FeatureItem text="Investment Suite (Coming Soon)" active white />
            <FeatureItem text="Akses Prioritas Fitur Baru" active white />
          </ul>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/40 active:scale-95"
          >
            {loading ? "Processing..." : "Berlangganan Sekarang"}
          </button>
          <p className="text-center text-[9px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
            Pembayaran diproses melalui Midtrans.
          </p>
        </div>
      </div>

      {/* --- PAYMENT LOGOS --- */}
      <section className="text-center mb-20 p-8 border border-slate-100 dark:border-slate-800/50 rounded-[3rem]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 text-center">
          Metode Pembayaran Aman
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">
            QRIS
          </span>
          <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">
            Virtual Account
          </span>
          <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">
            Gopay
          </span>
          <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">
            ShopeePay
          </span>
          <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">
            e-wallet
          </span>
        </div>
      </section>

      {/* --- DETAIL PRODUK --- */}
      <section className="grid md:grid-cols-2 gap-12 mb-20 bg-white dark:bg-slate-900/20 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800/50 leading-relaxed transition-all">
        <div>
          <h4
            className={`${spaceGrotesk.className} text-xl font-bold dark:text-white uppercase mb-6 italic`}
          >
            Kenapa Fyntra Pro?
          </h4>
          <div className="space-y-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <p>
              <strong className="text-slate-900 dark:text-white block mb-1 uppercase tracking-wide">
                Pencatatan Cepat (AI)
              </strong>
              Gunakan fitur Scan/voice input (AI) untuk mencatat pengeluaran
              tanpa perlu mengetik manual. AI kami akan memproses detail
              transaksi Anda secara instan.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white block mb-1 uppercase tracking-wide">
                Metode Pembayaran Lokal
              </strong>
              Mendukung berbagai opsi pembayaran populer di Indonesia seperti
              QRIS, Virtual Account, dan e-wallet untuk kenyamanan transaksi
              Anda.
            </p>
          </div>
        </div>
        <div>
          <h4
            className={`${spaceGrotesk.className} text-xl font-bold dark:text-white uppercase mb-6 italic`}
          >
            Pertanyaan Umum
          </h4>
          <div className="space-y-4 text-xs font-medium">
            <details className="group border-b border-slate-100 dark:border-slate-800 pb-4 cursor-pointer">
              <summary className="list-none dark:text-white font-bold uppercase tracking-tighter flex justify-between">
                Apakah aktivasi otomatis? <span>↓</span>
              </summary>
              <p className="mt-3 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
                Ya, setelah pembayaran terverifikasi oleh Midtrans, akun Anda
                akan otomatis aktif ke paket Pro.
              </p>
            </details>
            <details className="group border-b border-slate-100 dark:border-slate-800 pb-4 cursor-pointer">
              <summary className="list-none dark:text-white font-bold uppercase tracking-tighter flex justify-between">
                Keamanan Data? <span>↓</span>
              </summary>
              <p className="mt-3 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
                Seluruh data transaksi dan informasi sensitif dienkripsi secara
                aman melalui infrastruktur Midtrans.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* --- FOOTER LEGAL & CONTACT --- */}
      <footer className="text-center pt-16 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12">
          <a href="/legal/terms" className="hover:text-blue-500">
            Syarat & Ketentuan
          </a>
          <a href="/legal/privacy" className="hover:text-blue-500">
            Kebijakan Privasi
          </a>
          <a href="/legal/refund" className="hover:text-blue-500">
            Refund Policy
          </a>
        </div>

        <div className="inline-block p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-medium min-w-[300px]">
          <p className="font-black text-slate-900 dark:text-white mb-4 uppercase tracking-[0.3em]">
            Kontak Bisnis:
          </p>
          <p className="flex items-center justify-center gap-2 mb-1">
            WhatsApp: +62 821-1713-2290
          </p>
          <p className="flex items-center justify-center gap-2">
            Email: faizax.app@gmail.com
          </p>
          <p className="mt-8 opacity-40 font-bold uppercase tracking-[0.2em]">
            Fyntra Financial by Faizax Ecosystem &copy; 2026
          </p>
        </div>
      </footer>
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
        {active ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
      {text}
    </li>
  );
}
