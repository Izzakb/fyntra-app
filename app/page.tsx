"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FyntraLanding() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-500">
      {/* 1. NAV BAR - Glassmorphism style */}
      <nav className="fixed top-0 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase block leading-none">
                Fyntra.
              </span>
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Faizax Ecosystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <a
                href="#features"
                className="hover:text-blue-600 dark:hover:text-white transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hover:text-blue-600 dark:hover:text-white transition"
              >
                Pricing
              </a>
            </div>
            <Link
              href="/dashboard"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
            >
              Enter Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 to-transparent -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            AI-Powered Wealth Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-10 dark:text-white"
          >
            Master your money <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              without the headache.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
          >
            Fyntra uses advanced Gemini AI to track expenses, scan receipts, and
            give you investment insights—all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row justify-center gap-6"
          >
            <Link
              href="/register"
              className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-2xl shadow-blue-200 dark:shadow-none hover:-translate-y-1"
            >
              Start Building Wealth
            </Link>
            <button className="px-12 py-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:border-blue-600 transition hover:-translate-y-1">
              Watch Demo Video
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section
        id="features"
        className="py-32 bg-slate-50/50 dark:bg-slate-900/30 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all text-2xl">
                🧠
              </div>
              <h3 className="text-2xl font-black mb-6 dark:text-white italic">
                AI Magic Input
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Type, speak, or scan receipts. Our AI extracts data instantly so
                you don't have to type.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all text-2xl">
                🛡️
              </div>
              <h3 className="text-2xl font-black mb-6 dark:text-white italic">
                Secure Ledger
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Bank-grade security powered by Supabase. Your financial data is
                encrypted and private.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-900 transition-all group">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-all text-2xl">
                📈
              </div>
              <h3 className="text-2xl font-black mb-6 dark:text-white italic">
                Asset Tracker
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Monitor your stocks and crypto portfolio in real-time. Keep your
                net worth growing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="py-24 border-t border-slate-100 dark:border-slate-900 text-center transition-colors">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-[10px] text-white dark:text-slate-900 font-black shadow-lg">
            F
          </div>
          <span className="text-sm font-black tracking-tighter uppercase dark:text-white">
            Fyntra
          </span>
        </div>
        <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
          Designed for the 1% • Faizax Ecosystem • © 2026
        </p>
      </footer>
    </div>
  );
}
