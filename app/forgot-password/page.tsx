"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";

// --- SMOOTH & SIMPLE CONFIG ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error("Gagal", { description: error.message });
    } else {
      toast.success("Link Terkirim!", {
        description: "Cek inbox email kamu, Bos.",
      });
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen bg-[#020617] flex items-center justify-center px-6 relative overflow-hidden`}
    >
      {/* GLOW BIRU MEWAH - Smooth breathing animation */}
      <motion.div
        animate={{ opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-slate-800/50 relative z-10"
      >
        <div className="text-center mb-10">
          <h1
            className={`font-space-grotesk text-2xl font-bold tracking-tight text-white uppercase`}
          >
            Recovery <span className="text-blue-500">Access</span>
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-widest">
            Masukkan email untuk reset kunci brankas
          </p>
        </div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleReset}
          className="flex flex-col gap-6"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Registered Email
            </label>
            <input
              required
              type="email"
              className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 text-white outline-none transition-all font-medium text-sm"
              placeholder="ceo@fyntra.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              {/* Ubah teksnya jadi "Kirim Link Reset" untuk halaman Recovery */}
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-center flex items-center justify-center"
        >
          <Link
            href="/login"
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Kembali ke Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
