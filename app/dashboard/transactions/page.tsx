"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

// SVG PREMIUM KATEGORI (Termasuk icon "Semua")
const CATEGORIES = [
  {
    name: "Semua",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    name: "Makanan",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    name: "Transportasi",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    name: "Hiburan",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <path d="M6 12h4" />
        <path d="M8 10v4" />
        <path d="M15 13h.01" />
        <path d="M18 11h.01" />
      </svg>
    ),
  },
  {
    name: "Belanja",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    name: "Kesehatan",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    ),
  },
  {
    name: "Lainnya",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
];

// 💡 KOMPONEN FORMAT UANG ELITE (Desimal Dinamis)
const FormattedMoney = ({
  amount,
  prefix = "Rp ",
  showSign = false,
}: {
  amount: number;
  prefix?: string;
  showSign?: boolean;
}) => {
  const safeAmount = amount || 0;
  const isNegative = safeAmount < 0;
  const absAmount = Math.abs(safeAmount);

  const formattedRaw = absAmount.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  const parts = formattedRaw.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let sign = "";
  if (showSign) {
    sign = isNegative ? "-" : "+";
  } else if (isNegative) {
    sign = "-";
  }

  return (
    <span>
      {sign} {prefix}
      {integerPart}
      {decimalPart && (
        <span className="text-[0.6em] opacity-60 ml-[1px]">,{decimalPart}</span>
      )}
    </span>
  );
};

export default function TransactionsPage() {
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
    const { error } = await supabase.rpc("update_fyntra_transaction", {
      p_transaction_id: editingId,
      p_user_id: user.id,
      p_new_wallet_id: editWalletId,
      p_new_amount: parseInt(editAmount),
      p_new_type: editType,
      p_new_category: editType === "income" ? "Income" : editCategory,
      p_new_description: editDescription,
    });
    if (error) {
      toast.error("Gagal Update", { description: error.message });
    } else {
      toast.success("Update Berhasil!");
      setShowEditModal(false);
      refreshGlobalData();
      fetchTransactions();
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Batalkan transaksi? Saldo akan dikembalikan otomatis."))
      return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.rpc("revert_fyntra_transaction", {
      p_transaction_id: transactionId,
      p_user_id: user?.id,
    });
    if (!error) {
      toast.success("Dibatalkan!");
      refreshGlobalData();
      fetchTransactions();
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

  const getWalletDetails = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    return wallet ? `${wallet.icon} ${wallet.wallet_name}` : "Main Wallet";
  };

  return (
    <div
      className={`animate-in fade-in duration-700 pb-20 bg-transparent`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2
            className={`font-space-grotesk text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase`}
          >
            Transaction Audit
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">
            Financial Activity Ledger
          </p>
        </div>
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search descriptions..."
            className="w-full px-6 py-4 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-2xl font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/50 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FILTER CATEGORY */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilterCategory(cat.name)}
            className={`px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${filterCategory === cat.name ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/50 hover:border-blue-600 dark:hover:border-slate-600"}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* TRANSACTION LIST */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">
            Loading Records...
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group"
              >
                <div className="flex items-center gap-6">
                  {/* ICON */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.type === "income" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:border dark:border-rose-500/20"}`}
                  >
                    {t.type === "income" ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14" />
                        <path d="m19 12-7 7-7-7" />
                      </svg>
                    ) : (
                      CATEGORIES.find((c) => c.name === t.category)?.icon || (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 19V5" />
                          <path d="m5 12 7-7 7 7" />
                        </svg>
                      )
                    )}
                  </div>

                  {/* DETAIL */}
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-700/50 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800/50 flex items-center gap-1">
                        {getWalletDetails(t.wallet_id)}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        • {t.category} •{" "}
                        {new Date(t.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* NOMINAL & ACTIONS */}
                <div className="text-right flex flex-col items-end mt-4 md:mt-0">
                  <p
                    className={`font-space-grotesk text-lg font-bold tracking-tight ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    <FormattedMoney
                      amount={t.type === "income" ? t.amount : t.amount * -1}
                      showSign={true}
                    />
                  </p>
                  <div className="flex items-center gap-3 mt-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(t)}
                      className="text-[9px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 dark:border dark:border-blue-500/20 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-[9px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 dark:border dark:border-rose-500/20 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Revert
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            No Records Found
          </div>
        )}
      </div>

      {/* MODAL EDIT (GLASSMORPHISM TANPA SCROLLBAR) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/50 w-full max-w-md p-8 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors relative">
            <h3
              className={`font-space-grotesk text-xl font-bold mb-6 dark:text-white text-slate-900 uppercase`}
            >
              Edit Transaction
            </h3>

            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl transition-colors">
                <button
                  type="button"
                  onClick={() => setEditType("expense")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${editType === "expense" ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-500"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setEditType("income")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${editType === "income" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-500"}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Source Wallet
                </label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                  value={editWalletId}
                  onChange={(e) => setEditWalletId(e.target.value)}
                >
                  <option value="" disabled>
                    Select Wallet...
                  </option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.icon} {w.wallet_name} (Rp{" "}
                      {w.balance.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <input
                required
                type="text"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />
              <input
                required
                type="number"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Amount (Rp)"
              />

              {editType === "expense" && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {CATEGORIES.filter(
                    (c) => c.name !== "Semua" && c.name !== "Income",
                  ).map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setEditCategory(c.name)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${editCategory === c.name ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20" : "bg-white dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <span
                        className={
                          editCategory === c.name
                            ? "text-white"
                            : "text-slate-400"
                        }
                      >
                        {c.icon}
                      </span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
