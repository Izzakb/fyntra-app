"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AiAdvisorProps {
  income: number;
  expense: number;
  balance: number;
  topCategory: string;
}

export default function AiAdvisor({
  income,
  expense,
  balance,
  topCategory,
}: AiAdvisorProps) {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (income === 0 && expense === 0) {
      setAdvice("Belum ada transaksi bulan ini Bos. Gas cari cuan dulu!");
      setLoading(false);
      return;
    }

    const fetchAdvice = async () => {
      try {
        // Ambil session token user yang sedang login
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setAdvice("Sesi login tidak ditemukan Bos. Coba login ulang ya!");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/advisor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ income, expense, balance, topCategory }),
        });
        const data = await res.json();
        setAdvice(data.advice);
      } catch (error) {
        setAdvice("Koneksi ke otak AI terputus. Coba refresh Bos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [income, expense, balance, topCategory]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-slate-700/50">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl animate-pulse border border-blue-400/30">
            ✨
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">
            Fyntra AI Insight
          </h3>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-slate-700 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded-md w-full"></div>
            <div className="h-4 bg-slate-700 rounded-md w-5/6"></div>
          </div>
        ) : (
          <p className="text-sm md:text-base font-medium leading-relaxed italic text-slate-100">
            "{advice}"
          </p>
        )}
      </div>

      {/* Efek Cahaya Estetik */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    </div>
  );
}
