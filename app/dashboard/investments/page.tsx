"use client";
import { useState, useEffect, useMemo } from "react";
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
      {sign}
      {prefix}
      {integerPart}
      {decimalPart && (
        <span className="text-[0.6em] opacity-60 ml-[1px]">,{decimalPart}</span>
      )}
    </span>
  );
};

// SVG PREMIUM ASSET TYPES
const ASSET_TYPES = [
  {
    name: "Saham Indonesia",
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
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    name: "Saham US",
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    name: "Crypto",
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
        <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
        <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2-.9 2-2s-.9-2-2-2H8" />
        <path d="M15 5h-2a2 2 0 1 0 0 4h3a2 2 0 1 0 0-4Z" />
        <line x1="9" x2="9" y1="7" y2="3" />
        <line x1="13" x2="13" y1="11" y2="7" />
      </svg>
    ),
  },
  {
    name: "Reksadana",
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
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    name: "Emas",
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
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13" />
        <path d="M13 3l3 6-4 13" />
        <path d="M2 9h20" />
      </svg>
    ),
  },
];

export default function InvestmentsPage() {
  const { totalInvestment, refreshGlobalData } = useFyntra();

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [addMode, setAddMode] = useState("new");

  // Form State
  const [assetType, setAssetType] = useState("Saham Indonesia");
  const [assetName, setAssetName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("fyntra_assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (addMode !== "new" && !isEditing) {
      const selected = assets.find((a) => a.id === addMode);
      if (selected) {
        setAssetType(selected.asset_type);
        setAssetName(selected.asset_name);
        setCurrentPrice(selected.current_price.toString());
        setQuantity("");
        setAvgBuyPrice("");
      }
    } else if (addMode === "new" && !isEditing) {
      setAssetType("Saham Indonesia");
      setAssetName("");
      setQuantity("");
      setAvgBuyPrice("");
      setCurrentPrice("");
    }
  }, [addMode, isEditing, assets]);

  const handleSyncPrices = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing global market data...");
    try {
      const res = await fetch("/api/sync-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error, { id: toastId });
        setIsSyncing(false);
        return;
      }
      if (!data.updatedPrices || data.updatedPrices.length === 0) {
        toast.info("No updates found.", { id: toastId });
        setIsSyncing(false);
        return;
      }
      let successCount = 0;
      for (const item of data.updatedPrices) {
        const { error } = await supabase
          .from("fyntra_assets")
          .update({
            current_price: item.new_price,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);
        if (!error) successCount++;
      }
      toast.success("Market Synced!", {
        description: `${successCount} assets updated.`,
        id: toastId,
      });
      fetchAssets();
      refreshGlobalData();
    } catch (error) {
      toast.error("Failed to connect to API.", { id: toastId });
    }
    setIsSyncing(false);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId("");
    setAddMode("new");
    setAssetType("Saham Indonesia");
    setAssetName("");
    setQuantity("");
    setAvgBuyPrice("");
    setCurrentPrice("");
    setShowModal(true);
  };

  const openEditModal = (a: any) => {
    setIsEditing(true);
    setEditId(a.id);
    setAddMode("new");
    setAssetType(a.asset_type);
    setAssetName(a.asset_name);
    setQuantity(a.quantity.toString());
    setAvgBuyPrice(a.avg_buy_price.toString());
    setCurrentPrice(a.current_price.toString());
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isEditing) {
      const payload = {
        asset_type: assetType,
        asset_name: assetName,
        quantity: Number(quantity),
        avg_buy_price: Number(avgBuyPrice),
        current_price: Number(currentPrice),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("fyntra_assets")
        .update(payload)
        .eq("id", editId);
      if (error) toast.error("Update Failed", { description: error.message });
      else toast.success("Asset Updated!");
    } else {
      if (addMode === "new") {
        const payload = {
          user_id: user.id,
          asset_type: assetType,
          asset_name: assetName,
          quantity: Number(quantity),
          avg_buy_price: Number(avgBuyPrice),
          current_price: Number(currentPrice),
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("fyntra_assets").insert(payload);
        if (error) toast.error("Add Failed", { description: error.message });
        else toast.success("New Asset Added!");
      } else {
        const existing = assets.find((a) => a.id === addMode);
        if (existing) {
          const qLama = Number(existing.quantity);
          const pLama = Number(existing.avg_buy_price);
          const qBaru = Number(quantity);
          const pBaru = Number(avgBuyPrice);
          const totalUnitBaru = qLama + qBaru;
          const avgPriceBaru = (qLama * pLama + qBaru * pBaru) / totalUnitBaru;
          const payload = {
            quantity: totalUnitBaru,
            avg_buy_price: avgPriceBaru,
            current_price: Number(currentPrice),
            updated_at: new Date().toISOString(),
          };
          const { error } = await supabase
            .from("fyntra_assets")
            .update(payload)
            .eq("id", addMode);
          if (error)
            toast.error("Merge Failed", { description: error.message });
          else toast.success("Portfolio Successfully Merged!");
        }
      }
    }
    setShowModal(false);
    refreshGlobalData();
    fetchAssets();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} from your portfolio?`)) return;
    const { error } = await supabase
      .from("fyntra_assets")
      .delete()
      .eq("id", id);
    if (error) toast.error("Delete Failed");
    else {
      toast.success("Asset Deleted!");
      refreshGlobalData();
      fetchAssets();
    }
  };

  const portfolioStats = useMemo(() => {
    let totalCapital = 0;
    let totalValue = 0;
    assets.forEach((a) => {
      totalCapital += Number(a.quantity) * Number(a.avg_buy_price);
      totalValue += Number(a.quantity) * Number(a.current_price);
    });
    const pnl = totalValue - totalCapital;
    const pnlPercentage = totalCapital > 0 ? (pnl / totalCapital) * 100 : 0;
    return { totalCapital, totalValue, pnl, pnlPercentage };
  }, [assets]);

  return (
    <div
      className={`${inter.className} pb-20 bg-transparent transition-all px-4 md:px-0`}
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="w-full lg:w-auto">
          <h2
            className={`${spaceGrotesk.className} text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase`}
          >
            Portfolio & Assets
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">
            Faizax Wealth Center
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={handleSyncPrices}
            disabled={isSyncing}
            className="flex-1 sm:flex-none px-6 py-4 bg-emerald-500 dark:bg-emerald-500/10 text-white dark:text-emerald-400 dark:border dark:border-emerald-500/20 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
              className={isSyncing ? "animate-spin" : ""}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            {isSyncing ? "Syncing..." : "Sync Prices"}
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
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
            Add Asset
          </button>
        </div>
      </div>

      {/* PORTFOLIO SUMMARY CARD */}
      <div className="bg-slate-900 dark:bg-slate-900/40 dark:backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-8 border border-transparent dark:border-slate-800/50 transition-all">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-blue-300 mb-2">
              Total Market Value
            </p>
            <h2
              className={`${spaceGrotesk.className} text-3xl md:text-5xl font-bold tracking-tight break-words`}
            >
              <FormattedMoney amount={portfolioStats.totalValue} />
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Capital:{" "}
                <FormattedMoney
                  amount={portfolioStats.totalCapital}
                  className="text-slate-300"
                />
              </p>
            </div>
          </div>
          <div
            className={`w-full md:w-auto px-5 py-3 md:px-6 md:py-4 rounded-2xl border backdrop-blur-md ${portfolioStats.pnl >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1">
              Total Return
            </p>
            <p
              className={`${spaceGrotesk.className} text-lg md:text-xl font-bold`}
            >
              <FormattedMoney amount={portfolioStats.pnl} showSign={true} /> (
              {portfolioStats.pnl >= 0 ? "+" : ""}
              {portfolioStats.pnlPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* ASSET LIST GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
            Loading Portfolio...
          </div>
        ) : assets.length > 0 ? (
          assets.map((a) => {
            const assetIcon =
              ASSET_TYPES.find((t) => t.name === a.asset_type)?.icon ||
              ASSET_TYPES[5].icon;
            const capital = Number(a.quantity) * Number(a.avg_buy_price);
            const marketValue = Number(a.quantity) * Number(a.current_price);
            const pnl = marketValue - capital;
            const pnlPercent = capital > 0 ? (pnl / capital) * 100 : 0;
            const isProfit = pnl >= 0;

            return (
              <div
                key={a.id}
                className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm relative overflow-hidden group transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-800"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                      {assetIcon}
                    </div>
                    <div>
                      <h3
                        className={`${spaceGrotesk.className} font-bold text-base md:text-lg text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none`}
                      >
                        {a.asset_name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {a.asset_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(a)}
                      className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 transition-colors"
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
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.asset_name)}
                      className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-lg hover:bg-rose-100 transition-colors"
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
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Live Price
                    </span>
                    <span className="text-[11px] font-bold dark:text-white">
                      <FormattedMoney amount={Number(a.current_price)} />
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Avg Price
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <FormattedMoney amount={Number(a.avg_buy_price)} />
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Balance
                    </span>
                    <span className="text-[11px] font-bold dark:text-white">
                      {a.quantity} Units
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1">
                      Value
                    </span>
                    <div className="text-right">
                      <span
                        className={`${spaceGrotesk.className} block text-lg md:text-xl font-bold dark:text-white leading-tight`}
                      >
                        <FormattedMoney amount={marketValue} />
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest mt-1 inline-block ${isProfit ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        <FormattedMoney amount={pnl} showSign={true} /> (
                        {pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 md:p-20 text-center bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm text-slate-400 font-bold uppercase tracking-widest text-xs">
            No investment assets found.
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/50 w-full max-w-md p-6 md:p-8 rounded-[2.5rem] shadow-2xl max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
            <h3
              className={`${spaceGrotesk.className} text-xl font-bold mb-6 dark:text-white text-slate-900 uppercase`}
            >
              {isEditing ? "Edit Asset" : "Add Asset"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEditing && (
                <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 ml-1">
                    Asset Operation
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl font-bold dark:text-white outline-none text-xs cursor-pointer"
                    value={addMode}
                    onChange={(e) => setAddMode(e.target.value)}
                  >
                    <option value="new">✨ Create New Asset</option>
                    {assets.length > 0 && (
                      <optgroup label="Add Balance to Existing:">
                        {assets.map((a) => (
                          <option key={a.id} value={a.id}>
                            🔄 {a.asset_name} ({a.asset_type})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                  Category
                </label>
                <select
                  required
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none disabled:opacity-50 text-sm"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  disabled={addMode !== "new" && !isEditing}
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                required
                type="text"
                placeholder="Asset Name (e.g., BTC)"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none disabled:opacity-50"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                disabled={addMode !== "new" && !isEditing}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                    {addMode !== "new" && !isEditing ? "+ Units" : "Qty"}
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="0"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                    {addMode !== "new" && !isEditing
                      ? "New Price"
                      : "Avg Price"}
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="0"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none"
                    value={avgBuyPrice}
                    onChange={(e) => setAvgBuyPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-2 ml-1">
                  Live Market Price (Rp)
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full px-5 py-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl font-bold text-sm text-emerald-600 dark:text-emerald-400 outline-none"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 order-2 sm:order-1 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 py-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 order-1 sm:order-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : addMode !== "new" && !isEditing
                      ? "Merge Asset"
                      : "Save Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
