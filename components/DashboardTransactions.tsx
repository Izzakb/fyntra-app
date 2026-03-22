"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { name: "Semua", icon: "🌈" },
  { name: "Makanan", icon: "🍔" },
  { name: "Transportasi", icon: "🚗" },
  { name: "Hiburan", icon: "🎮" },
  { name: "Belanja", icon: "🛍️" },
  { name: "Kesehatan", icon: "💊" },
  { name: "Lainnya", icon: "✨" },
];

export default function DashboardTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");

  const fetchTransactions = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // LOGIKA FILTER & SEARCH (Client Side biar cepet)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = t.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory =
        filterCategory === "Semua" || t.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [transactions, searchQuery, filterCategory]);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Semua Transaksi
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Audit Keuangan Faizax
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute right-6 top-4 opacity-30">🔍</span>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilterCategory(cat.name)}
            className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border ${
              filterCategory === cat.name
                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* TABLE / LIST AREA */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center font-black text-slate-200 animate-pulse italic uppercase tracking-widest text-sm">
            Loading Records...
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 hover:bg-slate-50/50 transition-all"
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                      t.type === "income"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {t.type === "income"
                      ? "💰"
                      : CATEGORIES.find((c) => c.name === t.category)?.icon ||
                        "💸"}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm italic">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md tracking-tighter">
                        {t.category}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                        {new Date(t.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-black italic tracking-tighter ${
                      t.type === "income" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"} Rp{" "}
                    {t.amount.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                    STATUS: COMPLETED
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <p className="text-slate-300 font-black italic uppercase tracking-widest">
              Tidak ada transaksi ditemukan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
