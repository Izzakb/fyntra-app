"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AiAdvisor from "@/components/AiAdvisor";

const CATEGORIES = [
  { name: "Makanan", icon: "🍔" },
  { name: "Transportasi", icon: "🚗" },
  { name: "Hiburan", icon: "🎮" },
  { name: "Belanja", icon: "🛍️" },
  { name: "Kesehatan", icon: "💊" },
  { name: "Income", icon: "💰" },
  { name: "Lainnya", icon: "✨" },
];

export default function DashboardHomePage() {
  // 1. PANGGIL DATA WEALTH DARI CONTEXT BARU
  const {
    balance,
    totalInvestment,
    netWorth,
    wallets,
    refreshGlobalData,
    loadingGlobal,
  } = useFyntra();

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense",
  );
  const [transactionName, setTransactionName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Makanan");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  const [magicText, setMagicText] = useState("");
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleMagicProcess = async (textToProcess: string = magicText) => {
    if (!textToProcess) return toast.error("Ketik sesuatu dulu Bos!");
    setIsMagicLoading(true);
    try {
      const res = await fetch("/api/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess }),
      });
      const data = await res.json();
      applyMagicData(data);
    } catch (e) {
      toast.error("Gagal konek ke otak AI.");
    }
    setIsMagicLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsMagicLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: reader.result }),
        });
        const data = await res.json();
        applyMagicData(data);
      } catch (e) {
        toast.error("Gagal baca struk.");
      }
      setIsMagicLoading(false);
    };
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Browser ga support mic.");
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMagicText(transcript);
      handleMagicProcess(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const applyMagicData = (data: any) => {
    if (data.error) return toast.error(data.error);
    if (data.amount) setTransactionAmount(data.amount.toString());
    if (data.description) setTransactionName(data.description);
    if (data.type) setTransactionType(data.type);
    if (data.type === "expense" && data.category) {
      setSelectedCategory(data.category);
    } else if (data.type === "income") {
      setSelectedCategory("Income");
    }
    if (data.wallet_hint && wallets.length > 0) {
      const matched = wallets.find((w) =>
        w.wallet_name.toLowerCase().includes(data.wallet_hint.toLowerCase()),
      );
      if (matched) setSelectedWalletId(matched.id);
    }
    toast.success("✨ AI Berhasil Mengisi Form!");
    setMagicText("");
  };

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: trans } = await supabase
      .from("fyntra_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const { data: targetGoals } = await supabase
      .from("fyntra_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (trans) setTransactions(trans);
    if (targetGoals) setGoals(targetGoals);
  };

  useEffect(() => {
    fetchData();
  }, [balance]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      const tDate = new Date(t.created_at);
      if (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      ) {
        t.type === "income"
          ? (income += Number(t.amount))
          : (expense += Number(t.amount));
      }
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  const topExpenseCategory = useMemo(() => {
    const now = new Date();
    const expenses = transactions.filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.created_at).getMonth() === now.getMonth(),
    );
    if (expenses.length === 0) return "Belum ada";
    const grouped = expenses.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});
    return Object.keys(grouped).reduce((a, b) =>
      grouped[a] > grouped[b] ? a : b,
    );
  }, [transactions]);

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.rpc("process_fyntra_transaction", {
      p_user_id: user?.id,
      p_wallet_id: selectedWalletId,
      p_amount: parseInt(transactionAmount),
      p_type: transactionType,
      p_category: transactionType === "income" ? "Income" : selectedCategory,
      p_description: transactionName,
    });
    if (!error) {
      toast.success("Tersimpan!");
      setShowTransactionModal(false);
      refreshGlobalData();
      fetchData();
    }
    setLoading(false);
  };

  if (loadingGlobal)
    return (
      <div className="p-10 font-black italic text-slate-300 dark:text-slate-700">
        Syncing Ledger...
      </div>
    );

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-300 space-y-10 pb-20">
      {/* 2. HEADER WEALTH DASHBOARD (DESAIN BARU) */}
      <div className="bg-slate-900 dark:bg-blue-600 p-10 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 flex flex-col gap-8">
          {/* Baris Atas: Uang Liquid & Tombol Transaksi */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <p className="text-slate-400 dark:text-blue-200 text-[10px] font-black uppercase tracking-[0.5em] mb-3">
                Liquid Cash (Siap Pakai)
              </p>
              <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter">
                Rp {balance.toLocaleString("id-ID")}
              </h2>
            </div>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="px-8 py-4 bg-blue-600 dark:bg-white dark:text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
            >
              + Add Transaction
            </button>
          </div>

          {/* Baris Bawah: Investasi & Master Asset */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 dark:border-blue-500/50 pt-6 mt-2">
            <div>
              <p className="text-slate-400 dark:text-blue-200 text-[9px] font-black uppercase tracking-widest mb-1">
                Total Investment
              </p>
              <p className="text-xl md:text-2xl font-black italic">
                Rp {totalInvestment.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-emerald-400 dark:text-emerald-300 text-[9px] font-black uppercase tracking-widest mb-1">
                Net Worth (Master Asset)
              </p>
              <p className="text-xl md:text-2xl font-black italic text-emerald-400 dark:text-white">
                Rp {netWorth.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
      </div>

      {/* DOMPET LIST */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="min-w-[220px] bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300"
          >
            <p className="font-black text-xs uppercase italic text-slate-800 dark:text-slate-300 mb-4">
              {w.icon} {w.wallet_name}
            </p>
            <p className="font-black text-xl text-blue-600 dark:text-blue-400 italic tracking-tighter">
              Rp {w.balance.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      <AiAdvisor
        income={monthlyStats.income}
        expense={monthlyStats.expense}
        balance={balance}
        topCategory={topExpenseCategory}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Income (Month)
          </p>
          <p className="text-2xl font-black text-emerald-500">
            +Rp {monthlyStats.income.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Expense (Month)
          </p>
          <p className="text-2xl font-black text-rose-500">
            -Rp {monthlyStats.expense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Cashflow
          </p>
          <p
            className={`text-2xl font-black ${monthlyStats.net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500"}`}
          >
            Rp {monthlyStats.net.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* GOALS & CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm h-80 flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600 italic">
              Future Goals
            </h3>
            <Link
              href="/dashboard/goals"
              className="text-[9px] font-black text-blue-500 uppercase tracking-widest"
            >
              Detail →
            </Link>
          </div>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {goals.length > 0 ? (
              goals.map((g) => {
                const progress = Math.min(
                  (balance / g.target_amount) * 100,
                  100,
                ).toFixed(0);
                return (
                  <div key={g.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase italic truncate max-w-[150px]">
                        {g.goal_name}
                      </p>
                      <p className="font-black text-blue-600 dark:text-blue-400 text-sm italic">
                        {progress}%
                      </p>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-400 font-bold text-[10px] uppercase italic mt-10">
                No goals yet.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm h-80 flex flex-col transition-colors duration-300">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600 mb-6 italic text-center w-full">
            Cashflow Chart
          </h3>
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "In", t: monthlyStats.income, c: "#10b981" },
                  { name: "Out", t: monthlyStats.expense, c: "#f43f5e" },
                ]}
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    fontWeight: "bold",
                  }}
                />
                <Bar dataKey="t" radius={[6, 6, 6, 6]} barSize={45}>
                  {[{ c: "#10b981" }, { c: "#f43f5e" }].map((e, i) => (
                    <Cell key={i} fill={e.c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600 italic mb-8">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-50 dark:border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"}`}
                >
                  {t.type === "income" ? "💰" : "💸"}
                </div>
                <div>
                  <p className="font-black text-sm text-slate-800 dark:text-slate-200">
                    {t.description}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    {t.category}
                  </p>
                </div>
              </div>
              <p
                className={`font-black text-sm ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
              >
                {t.type === "income" ? "+" : "-"} Rp{" "}
                {t.amount.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TRANSAKSI (DARK MODE READY) */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-transparent dark:border-slate-800 transition-colors">
            <h3 className="text-2xl font-black italic mb-6 dark:text-white text-slate-900">
              Add Transaction
            </h3>

            {/* MAGIC BOX */}
            <div className="mb-8 p-1 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
              <div className="bg-white dark:bg-slate-800 rounded-[1.4rem] p-4 flex flex-col gap-3 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                    ✨ AI Magic Input
                  </span>
                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-sm transition-colors">
                      📸{" "}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={startListening}
                      className={`p-2 rounded-xl text-sm transition-all ${isListening ? "bg-rose-100 text-rose-500 animate-pulse" : "bg-slate-100 dark:bg-slate-700"}`}
                    >
                      {isListening ? "🎙️" : "🎤"}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Kopi 15rb"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl text-xs font-bold dark:text-white outline-none transition-colors"
                    value={magicText}
                    onChange={(e) => setMagicText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleMagicProcess())
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleMagicProcess()}
                    disabled={isMagicLoading}
                    className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    {isMagicLoading ? "..." : "Gas"}
                  </button>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmitTransaction} className="space-y-5">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-colors">
                <button
                  type="button"
                  onClick={() => setTransactionType("expense")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${transactionType === "expense" ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-400"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("income")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${transactionType === "income" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-400"}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Sumber Dana
                </label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.wallet_name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                required
                type="text"
                placeholder="Deskripsi"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={transactionName}
                onChange={(e) => setTransactionName(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Nominal (Rp)"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />

              {transactionType === "expense" && (
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.filter((c) => c.name !== "Income").map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedCategory(c.name)}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${selectedCategory === c.name ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-400"}`}
                    >
                      {c.icon}
                      <br />
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  {loading ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
