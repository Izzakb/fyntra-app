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
} from "recharts"; // IMPORT RECHARTS

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

    // Kita tarik 30 transaksi terakhir buat bahan grafik
    const { data } = await supabase
      .from("fyntra_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, [balance]);

  // --- LOGIKA MENGOLAH DATA UNTUK GRAFIK ---
  const chartData = useMemo(() => {
    // Kita rangkum total Pemasukan vs Pengeluaran dari data transaksi
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += Number(t.amount);
      if (t.type === "expense") totalExpense += Number(t.amount);
    });

    return [
      { name: "Pemasukan", total: totalIncome, color: "#10b981" }, // Emerald
      { name: "Pengeluaran", total: totalExpense, color: "#f43f5e" }, // Rose
    ];
  }, [transactions]);
  // -----------------------------------------

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
      alert("Saldo nggak cukup, Bos! Kerja lagi yuk!");
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
    });

    setExpenseName("");
    setExpenseAmount("");
    setShowExpenseModal(false);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* CARD SALDO UTAMA */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-blue-200 mb-10 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-80">
            Saldo Aktif @Faizax
          </p>
          <h2 className="text-6xl font-black italic tracking-tighter mb-10">
            Rp {balance.toLocaleString("id-ID")}
          </h2>

          <div className="flex gap-4">
            <button
              onClick={handleTopUp}
              disabled={loading}
              className="px-6 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl disabled:opacity-50"
            >
              {loading ? "SYNC..." : "+ Top Up 50k"}
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              disabled={loading}
              className="px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-xl shadow-rose-200 disabled:opacity-50"
            >
              - Catat Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* CHART VISUALISASI DATA */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 italic">
            Analitik Arus Kas
          </h3>

          {transactions.length > 0 ? (
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
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                    tick={{ fontSize: 10, fill: "#cbd5e1" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value: any) => [
                      `Rp ${value.toLocaleString("id-ID")}`,
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
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-300 font-bold text-xs italic">
              Belum ada data analitik.
            </div>
          )}
        </div>

        {/* DAFTAR RIWAYAT (Dipersempit & pakai scroll) */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 italic">
            Sejarah Terakhir
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50 hover:border-blue-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${t.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                  >
                    {t.type === "income" ? "💰" : "💸"}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-800 truncate max-w-[100px]">
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
                  {t.type === "income" ? "+" : "-"} {t.amount / 1000}k
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-slate-400 font-bold text-xs py-4">
                Kosong.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PENGELUARAN */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-2">
              Catat Pengeluaran
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
              Uang keluar, hati tetap tenang.
            </p>

            <form onSubmit={handleAddExpense} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Kebutuhan
                </label>
                <input
                  required
                  type="text"
                  placeholder="Misal: Beli Kopi Boba"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Nominal (Rp)
                </label>
                <input
                  required
                  type="number"
                  placeholder="Contoh: 25000"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition disabled:opacity-50"
                >
                  {loading ? "SIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
