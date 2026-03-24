"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "Semua", icon: "🌈" },
  { name: "Makanan", icon: "🍔" },
  { name: "Transportasi", icon: "🚗" },
  { name: "Hiburan", icon: "🎮" },
  { name: "Belanja", icon: "🛍️" },
  { name: "Kesehatan", icon: "💊" },
  { name: "Lainnya", icon: "✨" },
];

export default function TransactionsPage() {
  // 1. PANGGIL WALLETS DARI CONTEXT UNTUK DITAMPILKAN
  const { refreshGlobalData, wallets } = useFyntra();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editCategory, setEditCategory] = useState("Makanan");

  // 2. STATE BARU UNTUK EDIT DOMPET
  const [editWalletId, setEditWalletId] = useState("");

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
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setEditAmount(t.amount.toString());
    setEditDescription(t.description);
    setEditType(t.type);
    setEditCategory(t.category);

    // 3. SET DOMPET DEFAULT SAAT EDIT DIBUKA
    setEditWalletId(t.wallet_id || (wallets.length > 0 ? wallets[0].id : ""));

    setShowEditModal(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWalletId) {
      toast.error("Validasi Gagal", {
        description: "Pilih sumber dana terlebih dahulu.",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !editingId) return;

    // 4. KIRIM p_new_wallet_id KE SUPABASE UNTUK ALGORITMA PINDAH DOMPET
    const { error } = await supabase.rpc("update_fyntra_transaction", {
      p_transaction_id: editingId,
      p_user_id: user.id,
      p_new_wallet_id: editWalletId, // <-- INI YANG BARU
      p_new_amount: parseInt(editAmount),
      p_new_type: editType,
      p_new_category: editType === "income" ? "Income" : editCategory,
      p_new_description: editDescription,
    });

    if (error) {
      toast.error("Gagal Update", { description: error.message });
    } else {
      toast.success("Update Berhasil!", {
        description: "Data transaksi dan saldo dompet telah disesuaikan.",
      });
      setShowEditModal(false);
      refreshGlobalData();
      fetchTransactions();
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (
      !confirm(
        "Batalkan transaksi? Saldo akan dikembalikan otomatis ke dompet asal.",
      )
    )
      return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc("revert_fyntra_transaction", {
      p_transaction_id: transactionId,
      p_user_id: user.id,
    });

    if (!error) {
      toast.success("Transaksi Dibatalkan", {
        description: "Saldo dompet Anda telah dikembalikan.",
      });
      refreshGlobalData();
      fetchTransactions();
    } else {
      toast.error("Gagal Membatalkan", { description: error.message });
    }
  };

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

  // Fungsi pembantu untuk mencari nama/ikon dompet berdasarkan ID
  const getWalletDetails = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    return wallet ? `${wallet.icon} ${wallet.wallet_name}` : "💳 Dompet Utama";
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Audit Transaksi
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Log Aktivitas Keuangan
          </p>
        </div>
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Cari deskripsi..."
            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-600/20 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilterCategory(cat.name)}
            className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${filterCategory === cat.name ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

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
                className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 hover:bg-slate-50/50 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${t.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
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
                    {/* 5. TAMPILKAN NAMA DOMPET DI SINI */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase italic border border-slate-200 px-2 py-0.5 rounded-md bg-white">
                        {getWalletDetails(t.wallet_id)}
                      </span>
                      <p className="text-[9px] font-bold text-slate-300 uppercase italic">
                        • {t.category} •{" "}
                        {new Date(t.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end mt-4 md:mt-0">
                  <p
                    className={`text-lg font-black italic tracking-tighter ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {t.type === "income" ? "+" : "-"} Rp{" "}
                    {t.amount.toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(t)}
                      className="text-[9px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-md"
                    >
                      Batalkan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-slate-300 font-black italic uppercase">
            Data Kosong
          </div>
        )}
      </div>

      {/* MODAL EDIT TRANSAKSI */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-6">
              Edit Transaction
            </h3>
            <form onSubmit={handleUpdateTransaction} className="space-y-5">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setEditType("expense")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${editType === "expense" ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setEditType("income")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${editType === "income" ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400"}`}
                >
                  Pemasukan
                </button>
              </div>

              {/* 6. DROPDOWN EDIT SUMBER DANA */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Sumber Dana
                </label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-600/20 outline-none"
                  value={editWalletId}
                  onChange={(e) => setEditWalletId(e.target.value)}
                >
                  <option value="" disabled>
                    Pilih Dompet...
                  </option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.icon} {w.wallet_name} (Sisa: Rp{" "}
                      {w.balance.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <input
                required
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Deskripsi"
              />
              <input
                required
                type="number"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Nominal"
              />

              {editType === "expense" && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CATEGORIES.filter(
                    (c) => c.name !== "Semua" && c.name !== "Income",
                  ).map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setEditCategory(c.name)}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${editCategory === c.name ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
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
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
