"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// --- DATA FAQ ---
const FAQS = [
  {
    question: "How secure is my financial data on Fyntra?",
    answer:
      "We use bank-grade AES-256 encryption. Your data is stored securely in Supabase and is never sold to third parties. Fyntra only has read-only access to your connected institutions.",
  },
  {
    question: "Can I connect my local bank accounts?",
    answer:
      "Yes! Fyntra supports over 10,000 global financial institutions including major banks and crypto wallets via our secure API partners.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Currently, Fyntra is a highly responsive web application designed for desktop and mobile browsers. A native iOS and Android app is in our roadmap for Q4 2026.",
  },
];

export default function FyntraLanding() {
  const containerRef = useRef(null);

  // PARALLAX SETUP
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#020617] text-white selection:bg-blue-900 selection:text-white overflow-hidden relative`}
    >
      {/* GLOWING BACKGROUND LAYERS (PARALLAX) */}
      <motion.div
        style={{ y: yBg }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        style={{ y: yBg }}
        className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"
      />

      {/* 1. TOP NAV - Glassmorphism */}
      <nav className="fixed top-0 w-full bg-[#020617]/70 backdrop-blur-xl border-b border-slate-800/50 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 10 }}
              className={`font-space-grotesk w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-900/20`}
            >
              F
            </motion.div>
            <div>
              <span
                className={`font-space-grotesk text-2xl font-bold tracking-tight uppercase block leading-none`}
              >
                Fyntra<span className="text-blue-500">.</span>
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1 block">
                Faizax Ecosystem
              </span>
            </div>
          </div>

          {/* Links & Auth Buttons */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <a
                href="#features"
                className="hover:text-white transition-colors"
              >
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-4 border-l border-slate-800/50 pl-8">
              <Link
                href="/login"
                className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                Create Identity
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-52 pb-32 px-6">
        <motion.div
          style={{ y: yText }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 mb-8 text-[10px] font-bold tracking-[0.3em] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full uppercase backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Private Wealth Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            className={`font-space-grotesk text-6xl md:text-[5.5rem] font-bold tracking-tighter leading-[1] mb-8`}
          >
            Master your capital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              with precision.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
          >
            Fyntra acts as your personal AI-driven family office. Track assets,
            automate ledgers, and uncover deep financial insights securely.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row justify-center gap-5"
          >
            <Link
              href="/register"
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-1"
            >
              Start Building Wealth
            </Link>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-5 bg-slate-900/50 text-white border border-slate-700/50 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-1 backdrop-blur-md"
            >
              View Platform Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. INTERACTIVE DEMO SECTION */}
      <section id="demo" className="py-24 relative z-10 border-t border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-[10px] font-bold tracking-[0.3em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live Demo — Data Dummy
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`font-space-grotesk text-3xl md:text-4xl font-bold tracking-tight`}
            >
              Your Wealth Command Center
            </motion.h2>
            <p className="text-slate-500 mt-3 font-medium text-sm">
              Klik-klik untuk explore fitur Fyntra secara langsung.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative"
          >
            <DemoWidget spaceGrotesk="font-space-grotesk" />
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2
              className={`font-space-grotesk text-4xl font-bold tracking-tight uppercase`}
            >
              The Arsenal
            </h2>
            <p className="text-slate-500 mt-4 font-medium">
              Tools designed for the modern elite investor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-800/50 hover:bg-slate-800/40 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3
                className={`font-space-grotesk text-xl font-bold mb-4 uppercase`}
              >
                AI Magic Ledger
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect your accounts and let our Gemini-powered engine
                categorize, tag, and analyze your cash flow instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-800/50 hover:bg-slate-800/40 transition-colors group">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-8">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-3 5-3.98a1 1 0 0 1 1.17 0C12 2 14 4 16 5a1 1 0 0 1 1 1z" />
                </svg>
              </div>
              <h3
                className={`font-space-grotesk text-xl font-bold mb-4 uppercase`}
              >
                Bank-Grade Vault
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Secured by Supabase and end-to-end encryption. Your identity and
                net worth data are strictly yours.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-800/50 hover:bg-slate-800/40 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <h3
                className={`font-space-grotesk text-xl font-bold mb-4 uppercase`}
              >
                Global Portfolio
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track equities, real estate, crypto, and alternative assets in
                one unified, beautiful dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section
        id="pricing"
        className="py-32 relative z-10 border-t border-slate-800/50 bg-[#020617]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2
              className={`font-space-grotesk text-4xl font-bold tracking-tight uppercase`}
            >
              Capital Access
            </h2>
            <p className="text-slate-500 mt-4 font-medium">
              Transparent pricing. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Starter */}
            <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Basic
              </h3>
              <div className="text-4xl font-bold mb-6">
                $0
                <span className="text-lg text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 text-sm text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">✓</span> 2 Bank Connections
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">✓</span> Basic Ledger
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <span className="text-slate-700">×</span> AI Insights
                </li>
              </ul>
              <button className="w-full py-4 border border-slate-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition">
                Get Started
              </button>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-gradient-to-b from-blue-900/40 to-slate-900/40 p-10 rounded-[3.5rem] border border-blue-500/30 relative shadow-2xl shadow-blue-900/20 transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
                Wealth Pro
              </h3>
              <div className="text-5xl font-bold mb-6">
                $15
                <span className="text-lg text-slate-400 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> Unlimited Connections
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> Full AI
                  Categorization
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> Advanced Portfolio
                  Analytics
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> Priority Support
                </li>
              </ul>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-900/30">
                Upgrade to Pro
              </button>
            </div>

            {/* Elite */}
            <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Family Office
              </h3>
              <div className="text-4xl font-bold mb-6">
                $49
                <span className="text-lg text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 text-sm text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">✓</span> Everything in Pro
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">✓</span> Multi-User Access
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">✓</span> Custom API Access
                </li>
              </ul>
              <button className="w-full py-4 border border-slate-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section
        id="faq"
        className="py-32 relative z-10 border-t border-slate-800/50"
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className={`font-space-grotesk text-4xl font-bold tracking-tight uppercase`}
            >
              Clear Answers
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROFESSIONAL FINTECH FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/50 pt-20 pb-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white font-bold">
                  F
                </div>
                <span
                  className={`font-space-grotesk text-xl font-bold tracking-tight uppercase`}
                >
                  Fyntra.
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                The intelligent wealth management gateway designed for modern
                investors. Built with security, privacy, and precision in mind.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-300 mb-6">
                Platform
              </h4>
              <ul className="space-y-4 text-xs text-slate-500">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Wealth Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    AI Ledger
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-300 mb-6">
                Company
              </h4>
              <ul className="space-y-4 text-xs text-slate-500">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-300 mb-6">
                Legal
              </h4>
              <ul className="space-y-4 text-xs text-slate-500">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col items-center text-center">
            {/* Disclaimer Khas Fintech */}
            <p className="text-[9px] text-slate-600 leading-relaxed max-w-4xl mb-6">
              Fyntra is a financial technology company, not a bank. Banking
              services are provided by our partner banks, Members FDIC.
              Investment products are not FDIC insured, not bank guaranteed, and
              may lose value. The information provided is for educational
              purposes only and should not be considered legal or financial
              advice.
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              © {new Date().getFullYear()} Faizax Ecosystem. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- KOMPONEN DEMO INTERAKTIF ---
const DEMO_TABS = ["Dashboard", "Transactions", "Analytics"];

const DEMO_TRANSACTIONS = [
  { id: 1, desc: "Kopi Starbucks", category: "Makanan", amount: -65000, type: "expense", time: "09:14" },
  { id: 2, desc: "Gaji Bulan Ini", category: "Income", amount: 12500000, type: "income", time: "08:00" },
  { id: 3, desc: "Grab ke Kantor", category: "Transportasi", amount: -32000, type: "expense", time: "07:45" },
  { id: 4, desc: "Netflix", category: "Hiburan", amount: -54000, type: "expense", time: "Kemarin" },
  { id: 5, desc: "Freelance Design", category: "Income", amount: 3200000, type: "income", time: "Kemarin" },
];

const DEMO_WALLETS = [
  { name: "BCA", balance: 8450000, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { name: "GoPay", balance: 1230000, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { name: "Cash", balance: 500000, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
];

const DEMO_CATEGORIES = [
  { name: "Makanan", pct: 42, color: "#ef4444" },
  { name: "Transportasi", pct: 24, color: "#f59e0b" },
  { name: "Hiburan", pct: 18, color: "#8b5cf6" },
  { name: "Lainnya", pct: 16, color: "#64748b" },
];

function DemoWidget({ spaceGrotesk }: { spaceGrotesk: string }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedTx, setAddedTx] = useState<any[]>([]);

  const allTx = [...addedTx, ...DEMO_TRANSACTIONS];
  const totalIncome = allTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = Math.abs(allTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
  const balance = 8450000 + 1230000 + 500000;

  const fmt = (n: number) => "Rp " + Math.abs(n).toLocaleString("id-ID");

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">
      {/* Browser Bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/50 bg-slate-950/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex-1 bg-slate-800/50 rounded-lg px-4 py-1.5 text-[11px] text-slate-500 font-mono">
          fyntra.app/dashboard
        </div>
      </div>

      <div className="flex min-h-[520px]">
        {/* Sidebar Mini */}
        <div className="hidden md:flex w-48 flex-col bg-slate-950/50 border-r border-slate-800/50 p-4 gap-1">
          <p className={`${spaceGrotesk} text-lg font-bold text-white px-3 mb-4`}>
            FYNTRA<span className="text-blue-500">.</span>
          </p>
          {DEMO_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Mobile Tab Bar */}
          <div className="flex md:hidden gap-2 mb-6">
            {DEMO_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === "Dashboard" && (
            <div className="space-y-4">
              {/* Net Worth Header */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Liquid Cash</p>
                <p className={`${spaceGrotesk} text-3xl font-bold text-white`}>{fmt(balance)}</p>
                <div className="flex gap-6 mt-4 pt-4 border-t border-slate-700/30">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Net Worth</p>
                    <p className={`${spaceGrotesk} text-base font-bold text-emerald-400`}>{fmt(balance + 15000000)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Investment</p>
                    <p className={`${spaceGrotesk} text-base font-bold text-white`}>{fmt(15000000)}</p>
                  </div>
                </div>
              </div>

              {/* Wallet Pills */}
              <div className="flex gap-3 flex-wrap">
                {DEMO_WALLETS.map(w => (
                  <div key={w.name} className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold ${w.color}`}>
                    {w.name} · {fmt(w.balance)}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Income", val: fmt(totalIncome), color: "text-emerald-400" },
                  { label: "Expense", val: fmt(totalExpense), color: "text-rose-400" },
                  { label: "Cashflow", val: fmt(totalIncome - totalExpense), color: "text-blue-400" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`${spaceGrotesk} text-sm font-bold ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Add Transaction Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
              >
                + Add Transaction
              </button>

              {addedTx.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-[11px] text-emerald-400 font-bold">
                  ✓ {addedTx.length} transaksi baru ditambahkan!
                </div>
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "Transactions" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Activity</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  + Add
                </button>
              </div>
              {allTx.map((t, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {t.type === "income" ? "↓" : "↑"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.desc}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{t.category} · {t.time}</p>
                    </div>
                  </div>
                  <p className={`${spaceGrotesk} font-bold text-sm ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "Analytics" && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Expense Breakdown</p>
              {DEMO_CATEGORIES.map(c => (
                <div key={c.name} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-slate-400">{c.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Top Category</p>
                  <p className="text-sm font-bold text-white">Makanan</p>
                </div>
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Saving Rate</p>
                  <p className={`${spaceGrotesk} text-sm font-bold text-emerald-400`}>73%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 rounded-[2.5rem]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className={`${spaceGrotesk} text-lg font-bold text-white mb-4`}>Add Transaction</h3>
              <DemoAddForm
                onAdd={(tx) => { setAddedTx(prev => [tx, ...prev]); setShowAddModal(false); setActiveTab("Transactions"); }}
                onCancel={() => setShowAddModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DemoAddForm({ onAdd, onCancel }: { onAdd: (tx: any) => void; onCancel: () => void }) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!desc || !amount) return;
    onAdd({
      desc,
      category: type === "income" ? "Income" : "Lainnya",
      amount: type === "income" ? Number(amount) : -Number(amount),
      type,
      time: "Baru saja",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex p-1 bg-slate-800 rounded-xl">
        {(["expense", "income"] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              type === t
                ? t === "expense" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                : "text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Deskripsi (e.g. Kopi Starbucks)"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none font-medium placeholder:text-slate-600"
      />
      <input
        type="number"
        placeholder="Jumlah (Rp)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none font-medium placeholder:text-slate-600"
      />
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// --- KOMPONEN BANTUAN UNTUK FAQ (Smooth Accordion) ---
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-800/50 rounded-2xl bg-slate-900/30 overflow-hidden transition-colors hover:bg-slate-900/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left"
      >
        <span className="font-bold text-sm text-slate-300">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-slate-500 text-xl font-light"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed pt-0 border-t border-slate-800/30 mt-2 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
