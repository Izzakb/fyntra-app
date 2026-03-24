"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner"; // <-- IMPORT SONNER
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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
  const { balance, refreshGlobalData, loadingGlobal } = useFyntra();

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

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.rpc("process_fyntra_transaction", {
      p_user_id: user.id,
      p_amount: parseInt(transactionAmount),
      p_type: transactionType,
      p_category: transactionType === "income" ? "Income" : selectedCategory,
      p_description: transactionName,
    });

    if (error) {
      // TOAST ERROR
      toast.error("Transaksi Gagal", { description: error.message });
    } else {
      // TOAST SUCCESS
      toast.success("Transaksi Berhasil Dicatat!", {
        description: `${transactionType === "income" ? "Pemasukan" : "Pengeluaran"} Rp ${Number(transactionAmount).toLocaleString("id-ID")} telah ditambahkan.`,
      });
      setTransactionName("");
      setTransactionAmount("");
      setShowTransactionModal(false);
      refreshGlobalData();
      fetchData();
    }
    setLoading(false);
  };

  if (loadingGlobal) {
    return (
      <div className="animate-pulse p-10 font-black italic text-slate-300">
        Syncing Ledger...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-20">
      {/* MASTER BALANCE CARD */}
      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
            Master Balance
          </p>
          <h2 className="text-6xl font-black italic tracking-tighter mb-10">
            Rp {balance.toLocaleString("id-ID")}
          </h2>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-10 py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
          >
            + Add Transaction
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Income (This Month)
          </p>
          <p className="text-2xl font-black text-emerald-500">
            +Rp {monthlyStats.income.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Expense (This Month)
          </p>
          <p className="text-2xl font-black text-rose-500">
            -Rp {monthlyStats.expense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Cashflow
          </p>
          <p
            className={`text-2xl font-black ${monthlyStats.net >= 0 ? "text-blue-600" : "text-orange-500"}`}
          >
            Rp {monthlyStats.net.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* GOALS & CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
              Future Goals
            </h3>
            <Link
              href="/dashboard/goals"
              className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors"
            >
              View Detail →
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
                      <p className="font-black text-sm text-slate-800 uppercase italic truncate max-w-[150px]">
                        {g.goal_name}
                      </p>
                      <p className="font-black text-blue-600 text-sm italic">
                        {progress}%
                      </p>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
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

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-80 flex flex-col justify-center items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6 italic text-center w-full">
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
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(v: any) => [`Rp${Number(v).toLocaleString()}`]}
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
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
            Recent Activity
          </h3>
          <Link
            href="/dashboard/transactions"
            className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors"
          >
            View Detail →
          </Link>
        </div>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-5 bg-slate-50/50 rounded-[2rem] border border-slate-50 group hover:border-blue-100 transition-all"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${t.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                >
                  {t.type === "income"
                    ? "💰"
                    : CATEGORIES.find((c) => c.name === t.category)?.icon ||
                      "💸"}
                </div>
                <div>
                  <p className="font-black text-sm text-slate-800">
                    {t.description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {t.category} •{" "}
                    {new Date(t.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              <p
                className={`font-black text-sm ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
              >
                {t.type === "income" ? "+" : "-"} Rp
                {t.amount.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TRANSAKSI */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-6">Add Transaction</h3>
            <form onSubmit={handleSubmitTransaction} className="space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTransactionType("expense")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${transactionType === "expense" ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("income")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${transactionType === "income" ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400"}`}
                >
                  Pemasukan
                </button>
              </div>
              <input
                required
                type="text"
                placeholder={
                  transactionType === "income" ? "Sumber Dana" : "Deskripsi"
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                value={transactionName}
                onChange={(e) => setTransactionName(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Nominal (Rp)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
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
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${selectedCategory === c.name ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
                    >
                      {c.icon}
                      <br />
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg ${transactionType === "income" ? "bg-emerald-500" : "bg-blue-600"}`}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
