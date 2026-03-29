"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

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

// SVG PREMIUM KATEGORI
const CATEGORIES = [
  {
    name: "Makanan",
    icon: (
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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    ),
  },
  {
    name: "Income",
    icon: (
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
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    name: "Lainnya",
    icon: (
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
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
];

export default function SubscriptionsPage() {
  const { wallets } = useFyntra();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Hiburan");
  const [walletId, setWalletId] = useState("");
  const [recDate, setRecDate] = useState("1");

  const fetchSubs = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("fyntra_recurring")
      .select(`*, fyntra_wallets(wallet_name, icon)`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setSubs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const openModal = () => {
    setDesc("");
    setAmount("");
    setType("expense");
    setCategory("Hiburan");
    setRecDate("1");
    if (wallets.length > 0) {
      const defaultWallet = wallets.find((w) => w.is_default) || wallets[0];
      setWalletId(defaultWallet.id);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId)
      return toast.error("Validation Failed", {
        description: "Please select a wallet source.",
      });

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("fyntra_recurring").insert({
      user_id: user.id,
      wallet_id: walletId,
      description: desc,
      amount: parseInt(amount),
      type,
      category: type === "income" ? "Income" : category,
      recurring_date: parseInt(recDate),
      is_active: true,
    });

    if (error) {
      toast.error("Failed to Save", { description: error.message });
    } else {
      toast.success("Automation Active!", {
        description: `System will automatically record every ${recDate}th of the month.`,
      });
      setShowModal(false);
      fetchSubs();
    }
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("fyntra_recurring")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    if (!error) {
      toast.success(currentStatus ? "Automation Paused" : "Automation Resumed");
      fetchSubs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this automation schedule?")) return;
    const { error } = await supabase
      .from("fyntra_recurring")
      .delete()
      .eq("id", id);
    if (!error) {
      toast.success("Schedule Deleted");
      fetchSubs();
    }
  };

  return (
    <div
      className={`animate-in fade-in duration-700 pb-20 bg-transparent transition-all`}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2
            className={`font-space-grotesk text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase transition-colors duration-300`}
          >
            Automations
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 transition-colors duration-300">
            Auto-Pilot Billing & Income
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
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
          Add Automation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
            Loading Automations...
          </div>
        ) : subs.length > 0 ? (
          subs.map((s) => (
            <div
              key={s.id}
              className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden transition-all duration-300 ${
                s.is_active
                  ? "bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800"
                  : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/50 opacity-60 grayscale-[20%]"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-300 ${
                    s.type === "expense"
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:border dark:border-rose-500/20"
                      : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:border dark:border-emerald-500/20"
                  }`}
                >
                  {s.type === "income" ? (
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
                    CATEGORIES.find((c) => c.name === s.category)?.icon || (
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

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(s.id, s.is_active)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      s.is_active
                        ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                    }`}
                    title={
                      s.is_active ? "Pause Automation" : "Resume Automation"
                    }
                  >
                    {s.is_active ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" rx="1" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center justify-center transition-all"
                    title="Delete Automation"
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

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 transition-colors">
                  Every {s.recurring_date}
                  {s.recurring_date.toString().endsWith("1") &&
                  s.recurring_date !== 11
                    ? "st"
                    : s.recurring_date.toString().endsWith("2") &&
                        s.recurring_date !== 12
                      ? "nd"
                      : s.recurring_date.toString().endsWith("3") &&
                          s.recurring_date !== 13
                        ? "rd"
                        : "th"}{" "}
                  of the month
                </p>
                <h3
                  className={`font-space-grotesk text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate transition-colors`}
                >
                  {s.description}
                </h3>
                <p
                  className={`font-space-grotesk text-2xl font-bold tracking-tight mt-2 transition-colors ${s.type === "expense" ? "text-rose-500" : "text-emerald-500"}`}
                >
                  <FormattedMoney
                    amount={s.type === "expense" ? s.amount * -1 : s.amount}
                    showSign={true}
                  />
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700/50 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800/50 flex items-center gap-1.5 transition-colors">
                    {s.fyntra_wallets?.icon} {s.fyntra_wallets?.wallet_name}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-20 text-center bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm text-slate-400 font-bold uppercase tracking-widest text-xs transition-all">
            No automations scheduled yet.
          </div>
        )}
      </div>

      {/* MODAL (GLASSMORPHISM TANPA SCROLLBAR) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/50 w-full max-w-md p-8 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors relative">
            <h3
              className={`font-space-grotesk text-xl font-bold mb-6 dark:text-white text-slate-900 uppercase`}
            >
              Set Automation
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl transition-colors">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === "expense" ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-500"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === "income" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-500"}`}
                >
                  Income
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                    Execution Date
                  </label>
                  <select
                    required
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                    Source Wallet
                  </label>
                  <select
                    required
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none truncate transition-colors"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.wallet_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                required
                type="text"
                placeholder="Description (e.g., Netflix Sub)"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Amount (Rp)"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              {type === "expense" && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {CATEGORIES.filter((c) => c.name !== "Income").map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCategory(c.name)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${category === c.name ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20" : "bg-white dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <span
                        className={
                          category === c.name ? "text-white" : "text-slate-400"
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                  {loading ? "Saving..." : "Save Auto-Pilot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
