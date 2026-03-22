"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardHomeProps {
  fullName: string;
  balance: number;
  onUpdate: () => void;
}

export default function DashboardHome({
  fullName,
  balance,
  onUpdate,
}: DashboardHomeProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const fetchTransactions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Tarik data lebih banyak untuk laporan akuntansi
    const { data } = await supabase
      .from("fyntra_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, [balance]);

  // --- LOGIKA ACCOUNTANT: RINGKASAN BULAN INI ---
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let incomeThisMonth = 0;
    let expenseThisMonth = 0;

    transactions.forEach((t) => {
      const tDate = new Date(t.created_at);
      if (
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      ) {
        if (t.type === "income") incomeThisMonth += Number(t.amount);
        if (t.type === "expense") expenseThisMonth += Number(t.amount);
      }
    });

    return {
      income: incomeThisMonth,
      expense: expenseThisMonth,
      net: incomeThisMonth - expenseThisMonth,
    };
  }, [transactions]);

  // Data untuk Grafik
  const chartData = [
    { name: "Masuk", total: monthlyStats.income, color: "#10b981" },
    { name: "Keluar", total: monthlyStats.expense, color: "#f43f5e" },
  ];

  const handleTopUp = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const nominal = 50000;
    await supabase
      .from("fyntra_wallets")
      .update({ balance: balance + nominal })
      .eq("user_id", user.id);
    await supabase
      .from("fyntra_transactions")
      .insert({
        user_id: user.id,
        amount: nominal,
        type: "income",
        description: "Top Up Saldo",
      });
    onUpdate();
    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const nominal = parseInt(expenseAmount);
    if (balance < nominal) {
      alert("Saldo nggak cukup, Bos!");
      setLoading(false);
      return;
    }
    await supabase
      .from("fyntra_wallets")
      .update({ balance: balance - nominal })
      .eq("user_id", user.id);
    await supabase
      .from("fyntra_transactions")
      .insert({
        user_id: user.id,
        amount: nominal,
        type: "expense",
        description: expenseName,
      });
    setExpenseName("");
    setExpenseAmount("");
    setShowExpenseModal(false);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* HEADER & SALDO UTAMA */}
      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl mb-10 relative overflow-hidden border border-slate-800">
        <div className="relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
            Account Balance
          </p>
          <h2 className="text-6xl font-black italic tracking-tighter mb-10">
            Rp {balance.toLocaleString("id-ID")}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={handleTopUp}
              disabled={loading}
              className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
            >
              + Top Up 50k
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 backdrop-blur-md"
            >
              - Expense
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNTANT STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Income This Month
          </p>
          <p className="text-2xl font-black text-emerald-500 tracking-tight">
            + Rp {monthlyStats.income.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-rose-200 transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Expense This Month
          </p>
          <p className="text-2xl font-black text-rose-500 tracking-tight">
            - Rp {monthlyStats.expense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Net Cashflow
          </p>
          <p
            className={`text-2xl font-black tracking-tight ${monthlyStats.net >= 0 ? "text-blue-600" : "text-orange-500"}`}
          >
            {monthlyStats.net >= 0 ? "+" : ""} Rp{" "}
            {monthlyStats.net.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* CHART SECTION */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 italic">
            Visual Analytics
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Rp${v / 1000}k`}
                  tick={{ fontSize: 10, fill: "#cbd5e1" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(value: any) => [
                    `Rp ${Number(value).toLocaleString("id-ID")}`,
                    "Total",
                  ]}
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT HISTORY */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 italic">
            Recent Activity
          </h3>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:border-blue-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${t.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                  >
                    {t.type === "income" ? "💰" : "💸"}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-800">
                      {t.description}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                      {new Date(t.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-black text-xs ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {t.type === "income" ? "+" : "-"} Rp
                  {t.amount.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-2">New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Description
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Amount (Rp)
                </label>
                <input
                  required
                  type="number"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
