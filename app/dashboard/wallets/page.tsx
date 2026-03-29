"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

// FONT PREMIUM
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

// 💡 KOMPONEN FORMAT UANG ELITE (Desimal Dinamis)
const FormattedMoney = ({
  amount,
  prefix = "Rp ",
  showSign = false,
  className = "",
}: {
  amount: number;
  prefix?: string;
  showSign?: boolean;
  className?: string;
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
    <span className={className}>
      {sign} {prefix}
      {integerPart}
      {decimalPart && (
        <span className="text-[0.6em] opacity-60 ml-[1px]">,{decimalPart}</span>
      )}
    </span>
  );
};

// 💡 FIX: PERPENDEK NAMA KEY AGAR LOLOS VARCHAR(10) DI DATABASE
const ICONS_MAP: Record<string, React.ReactNode> = {
  Card: (
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  Bank: (
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
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <path d="M12 16v-6" />
      <path d="M8 16v-6" />
      <path d="M16 16v-6" />
      <path d="M8 10h8" />
    </svg>
  ),
  Cash: (
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
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  "E-Wallet": (
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
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  ),
  Piggy: (
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
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.5L20 12V6c0-.6-.4-1-1-1Z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <path d="M16 11h.01" />
    </svg>
  ),
  Coin: (
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
      <circle cx="12" cy="12" r="10" />
      <path d="M16 12a4 4 0 0 0-8 0" />
    </svg>
  ),
  Briefcase: (
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
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Rocket: (
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
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
};
const ICON_KEYS = Object.keys(ICONS_MAP);

export default function ManageWalletsPage() {
  const { wallets, refreshGlobalData } = useFyntra();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");

  const [walletName, setWalletName] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [walletIcon, setWalletIcon] = useState("Card"); // 💡 Diubah jadi "Card"
  const [loading, setLoading] = useState(false);

  const openAddModal = () => {
    setIsEditing(false);
    setWalletName("");
    setWalletBalance("");
    setWalletIcon("Card"); // 💡 Diubah jadi "Card"
    setShowModal(true);
  };

  const openEditModal = (w: any) => {
    setIsEditing(true);
    setEditId(w.id);
    setWalletName(w.wallet_name);
    setWalletBalance(w.balance.toString());
    setWalletIcon(ICON_KEYS.includes(w.icon) ? w.icon : "Card"); // 💡 Diubah jadi "Card"
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isEditing) {
      const { error } = await supabase
        .from("fyntra_wallets")
        .update({
          wallet_name: walletName,
          balance: parseInt(walletBalance),
          icon: walletIcon,
        })
        .eq("id", editId)
        .eq("user_id", user.id);

      if (error) toast.error("Update Failed", { description: error.message });
      else toast.success("Wallet Updated!");
    } else {
      const { error } = await supabase.from("fyntra_wallets").insert({
        user_id: user.id,
        wallet_name: walletName,
        balance: parseInt(walletBalance),
        icon: walletIcon,
        is_default: wallets.length === 0,
      });

      if (error) toast.error("Failed to Add", { description: error.message });
      else toast.success("New Wallet Created!");
    }

    setShowModal(false);
    refreshGlobalData();
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Delete wallet ${name}? (WARNING: Make sure all transactions in this wallet are reassigned)`,
      )
    )
      return;

    const { error } = await supabase
      .from("fyntra_wallets")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Deletion Failed", {
        description: "There are still transactions linked to this wallet.",
      });
    } else {
      toast.success("Wallet Deleted!");
      refreshGlobalData();
    }
  };

  const setAsDefault = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Reset all to false
    await supabase
      .from("fyntra_wallets")
      .update({ is_default: false })
      .eq("user_id", user.id);

    // Set selected to true
    await supabase
      .from("fyntra_wallets")
      .update({ is_default: true })
      .eq("id", id);

    toast.success("Primary Wallet Updated!");
    refreshGlobalData();
  };

  // Helper to render icon safely (supports old emoji from DB or new SVG)
  const renderWalletIcon = (iconVal: string) => {
    return ICONS_MAP[iconVal] || <span className="text-xl">{iconVal}</span>;
  };

  return (
    <div
      className={`${inter.className} animate-in fade-in duration-700 pb-20 bg-transparent transition-all`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2
            className={`${spaceGrotesk.className} text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase transition-colors duration-300`}
          >
            Manage Wallets
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 transition-colors duration-300">
            Funding Source Control
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.length === 0 ? (
          <div className="col-span-full p-20 text-center font-bold text-slate-400 uppercase tracking-widest text-xs bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[3rem] border border-slate-100 dark:border-slate-800/50 transition-colors">
            Loading Wallets...
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all duration-300 ${
                w.is_default
                  ? "bg-slate-900 dark:bg-blue-900/20 dark:backdrop-blur-3xl text-white border-slate-800 dark:border-blue-500/30 shadow-xl dark:shadow-blue-900/20"
                  : "bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                {/* ICON BOX */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-300 ${
                    w.is_default
                      ? "bg-slate-800 dark:bg-blue-500/20 border border-slate-700 dark:border-blue-500/40 text-blue-400"
                      : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {renderWalletIcon(w.icon)}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  {!w.is_default && (
                    <button
                      onClick={() => setAsDefault(w.id)}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      title="Set as Primary Wallet"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  )}
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(w)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                        w.is_default
                          ? "text-blue-300 hover:text-white bg-slate-800 dark:bg-blue-500/20 hover:bg-slate-700 dark:hover:bg-blue-500/40"
                          : "text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                      }`}
                      title="Edit Wallet"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(w.id, w.wallet_name)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                        w.is_default
                          ? "text-rose-400 hover:text-white bg-slate-800 dark:bg-rose-500/20 hover:bg-slate-700 dark:hover:bg-rose-500/40"
                          : "text-rose-500 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                      }`}
                      title="Delete Wallet"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-2">
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 transition-colors ${w.is_default ? "text-slate-400 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {w.wallet_name}
                </p>
                <h3
                  className={`${spaceGrotesk.className} text-3xl font-bold tracking-tight transition-colors`}
                >
                  <FormattedMoney amount={w.balance} />
                </h3>
              </div>

              {w.is_default && (
                <>
                  <div className="absolute top-6 right-6 px-3 py-1 bg-blue-600 dark:bg-blue-500/20 border border-transparent dark:border-blue-500/40 text-white dark:text-blue-300 text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                    Primary
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[60px] z-0 pointer-events-none transition-colors"></div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL (GLASSMORPHISM TANPA SCROLLBAR) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/50 w-full max-w-md p-8 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors relative">
            <h3
              className={`${spaceGrotesk.className} text-xl font-bold mb-6 dark:text-white text-slate-900 uppercase transition-colors`}
            >
              {isEditing ? "Edit Wallet" : "Add New Wallet"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 ml-1 transition-colors">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_KEYS.map((key) => (
                    <button
                      type="button"
                      key={key}
                      title={key}
                      onClick={() => setWalletIcon(key)}
                      className={`h-12 rounded-2xl flex items-center justify-center transition-all ${
                        walletIcon === key
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/50 dark:text-slate-400"
                      }`}
                    >
                      {ICONS_MAP[key]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Wallet Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., BCA / Cash / Binance"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none transition-all"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Starting Balance (Rp)
                </label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none transition-all"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
