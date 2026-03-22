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

// Daftar Kategori & Icon
const CATEGORIES = [
  { name: "Makanan", icon: "🍔" },
  { name: "Transportasi", icon: "🚗" },
  { name: "Hiburan", icon: "🎮" },
  { name: "Belanja", icon: "🛍️" },
  { name: "Kesehatan", icon: "💊" },
  { name: "Lainnya", icon: "✨" },
];

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
  const [selectedCategory, setSelectedCategory] = useState("Makanan");

  const fetchTransactions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
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

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      const tDate = new Date(t.created_at);
      if (
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      ) {
        if (t.type === "income") income += Number(t.amount);
        if (t.type === "expense") expense += Number(t.amount);
      }
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

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
    await supabase.from("fyntra_transactions").insert({
      user_id: user.id,
      amount: nominal,
      type: "income",
      description: "Top Up Saldo",
      category: "Income",
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
      alert("Saldo tipis, Bos!");
      setLoading(false);
      return;
    }

    await supabase
      .from("fyntra_wallets")
      .update({ balance: balance - nominal })
      .eq("user_id", user.id);
    await supabase.from("fyntra_transactions").insert({
      user_id: user.id,
      amount: nominal,
      type: "expense",
      description: expenseName,
      category: selectedCategory,
    });

    setExpenseName("");
    setExpenseAmount("");
    setShowExpenseModal(false);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* SALDO CARD */}
      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl mb-10 border border-slate-800">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
          Total Balance
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
            className="px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md"
          >
            - Expense
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Monthly Income
          </p>
          <p className="text-2xl font-black text-emerald-500 tracking-tight">
            +Rp{monthlyStats.income.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Monthly Expense
          </p>
          <p className="text-2xl font-black text-rose-500 tracking-tight">
            -Rp{monthlyStats.expense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
            Cashflow
          </p>
          <p
            className={`text-2xl font-black tracking-tight ${monthlyStats.net >= 0 ? "text-blue-600" : "text-orange-500"}`}
          >
            Rp{monthlyStats.net.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-64">
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
                formatter={(v: any) => [
                  `Rp ${Number(v).toLocaleString("id-ID")}`,
                ]}
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  fontWeight: "bold",
                }}
              />
              <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={40}>
                {chartData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HISTORY WITH CATEGORY */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 italic">
            Transactions
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {transactions.slice(0, 10).map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${t.type === "income" ? "bg-emerald-100" : "bg-rose-100"}`}
                  >
                    {t.type === "income"
                      ? "💰"
                      : CATEGORIES.find((c) => c.name === t.category)?.icon ||
                        "💸"}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-800">
                      {t.description}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">
                      {t.category}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-black text-xs ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {t.type === "income" ? "+" : "-"}{" "}
                  {t.amount.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPENSE MODAL WITH CATEGORY PICKER */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-6">New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-6">
              <input
                required
                type="text"
                placeholder="Description"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Amount (Rp)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedCategory(c.name)}
                    className={`p-3 rounded-xl border text-[10px] font-black transition-all ${selectedCategory === c.name ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-400"}`}
                  >
                    <div className="text-lg mb-1">{c.icon}</div>
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-rose-100"
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
