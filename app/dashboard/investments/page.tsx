"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

// Daftar Tipe Aset Universal
const ASSET_TYPES = [
  { name: "Saham Indonesia", icon: "📈" },
  { name: "Saham US", icon: "🗽" },
  { name: "Crypto", icon: "₿" },
  { name: "Reksadana", icon: "📊" },
  { name: "Emas", icon: "🥇" },
  { name: "Lainnya", icon: "💎" },
];

export default function InvestmentsPage() {
  const { totalInvestment, refreshGlobalData } = useFyntra();

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Fitur Sync API
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");

  // State untuk Smart Form (Pilih Aset Existing / Baru)
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

  // --- EFEK SMART FORM ---
  // Kalau dropdown addMode berubah (Pilih aset existing), auto-fill datanya!
  useEffect(() => {
    if (addMode !== "new" && !isEditing) {
      const selected = assets.find((a) => a.id === addMode);
      if (selected) {
        setAssetType(selected.asset_type);
        setAssetName(selected.asset_name);
        setCurrentPrice(selected.current_price.toString()); // Auto suggest harga pasar terakhir
        setQuantity(""); // Kosongin buat batch baru
        setAvgBuyPrice(""); // Kosongin buat batch baru
      }
    } else if (addMode === "new" && !isEditing) {
      setAssetType("Saham Indonesia");
      setAssetName("");
      setQuantity("");
      setAvgBuyPrice("");
      setCurrentPrice("");
    }
  }, [addMode, isEditing, assets]);

  // --- FUNGSI TARIK HARGA LIVE DARI API LOKAL ---
  const handleSyncPrices = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Menarik data pasar global...");

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
        toast.info("Tidak ada update.", {
          description: data.message,
          id: toastId,
        });
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

      toast.success("Market Synced! 🌍", {
        description: `${successCount} aset diupdate ke harga terbaru.`,
        id: toastId,
      });
      fetchAssets();
      refreshGlobalData();
    } catch (error) {
      toast.error("Gagal konek ke server API.", { id: toastId });
    }
    setIsSyncing(false);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId("");
    setAddMode("new"); // Default ke tambah baru
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
    setAddMode("new"); // Biar dropdown hilang saat mode edit murni
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
      // 1. MODE EDIT MURNI (Update 1 Baris)
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
      if (error) toast.error("Gagal Update", { description: error.message });
      else toast.success("Aset Diperbarui!");
    } else {
      if (addMode === "new") {
        // 2. MODE BIKIN ASET BARU (Insert)
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
        if (error)
          toast.error("Gagal Menambah", { description: error.message });
        else toast.success("Aset Baru Berhasil Ditambahkan!");
      } else {
        // 3. MODE MERGE SULTAN (Hitung Rata-rata)
        const existing = assets.find((a) => a.id === addMode);
        if (existing) {
          const qLama = Number(existing.quantity);
          const pLama = Number(existing.avg_buy_price);
          const qBaru = Number(quantity);
          const pBaru = Number(avgBuyPrice);

          // Rumus Sakti Modal Rata-rata (Weighted Average)
          const totalUnitBaru = qLama + qBaru;
          const avgPriceBaru = (qLama * pLama + qBaru * pBaru) / totalUnitBaru;

          const payload = {
            quantity: totalUnitBaru,
            avg_buy_price: avgPriceBaru,
            current_price: Number(currentPrice), // Update harga market terbarunya juga
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from("fyntra_assets")
            .update(payload)
            .eq("id", addMode);
          if (error)
            toast.error("Gagal Menggabungkan Aset", {
              description: error.message,
            });
          else
            toast.success("Portofolio Berhasil Digabungkan & Dihitung Ulang!");
        }
      }
    }

    setShowModal(false);
    refreshGlobalData();
    fetchAssets();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus aset ${name} dari portofolio?`)) return;
    const { error } = await supabase
      .from("fyntra_assets")
      .delete()
      .eq("id", id);
    if (error) toast.error("Gagal Menghapus");
    else {
      toast.success("Aset Dihapus!");
      refreshGlobalData();
      fetchAssets();
    }
  };

  // Kalkulasi Total Portofolio
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
    <div className="animate-in fade-in duration-700 pb-20 bg-transparent transition-all">
      {/* HEADER DENGAN TOMBOL SYNC */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase transition-colors duration-300">
            Portfolio & Assets
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 italic transition-colors duration-300">
            Pusat Investasi Faizax
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleSyncPrices}
            disabled={isSyncing}
            className="flex-1 md:flex-none px-6 py-4 bg-emerald-500 dark:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSyncing ? "Syncing..." : "🔄 Sync Prices"}
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 md:flex-none px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
          >
            + Add Asset
          </button>
        </div>
      </div>

      {/* PORTFOLIO SUMMARY CARD */}
      <div className="bg-slate-900 dark:bg-slate-900/50 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-10 border border-transparent dark:border-slate-800 transition-all duration-300">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-2 italic">
              Total Market Value
            </p>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">
              Rp {portfolioStats.totalValue.toLocaleString("id-ID")}
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
              Modal: Rp {portfolioStats.totalCapital.toLocaleString("id-ID")}
            </p>
          </div>
          <div
            className={`px-6 py-4 rounded-2xl border ${portfolioStats.pnl >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}
          >
            <p className="text-[9px] font-black uppercase tracking-widest mb-1">
              Total Return
            </p>
            <p className="text-xl font-black italic">
              {portfolioStats.pnl >= 0 ? "+" : ""}Rp{" "}
              {portfolioStats.pnl.toLocaleString("id-ID")} (
              {portfolioStats.pnl >= 0 ? "+" : ""}
              {portfolioStats.pnlPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
      </div>

      {/* ASSET LIST (PROFESSIONAL VIEW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center font-black text-slate-300 dark:text-slate-700 animate-pulse italic uppercase tracking-widest text-sm bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-colors">
            Memuat Portofolio...
          </div>
        ) : assets.length > 0 ? (
          assets.map((a) => {
            const assetIcon =
              ASSET_TYPES.find((t) => t.name === a.asset_type)?.icon || "💎";
            const capital = Number(a.quantity) * Number(a.avg_buy_price);
            const marketValue = Number(a.quantity) * Number(a.current_price);
            const pnl = marketValue - capital;
            const pnlPercent = capital > 0 ? (pnl / capital) * 100 : 0;
            const isProfit = pnl >= 0;

            return (
              <div
                key={a.id}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl shadow-sm transition-colors">
                      {assetIcon}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors">
                        {a.asset_name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-colors">
                        {a.asset_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(a)}
                      className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.asset_name)}
                      className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-md"
                    >
                      Del
                    </button>
                  </div>
                </div>

                {/* THE PROFESSIONAL VIEW LAYOUT */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Live Price
                    </span>
                    <span className="text-sm font-black italic dark:text-white transition-colors">
                      Rp {Number(a.current_price).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Avg Price
                    </span>
                    <span className="text-sm font-black italic text-slate-500 dark:text-slate-400 transition-colors">
                      Rp {Number(a.avg_buy_price).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Balance
                    </span>
                    <span className="text-sm font-black italic dark:text-white transition-colors">
                      {a.quantity} Unit
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">
                      Now Value
                    </span>
                    <div className="text-right">
                      <span className="block text-xl font-black italic dark:text-white transition-colors">
                        Rp {marketValue.toLocaleString("id-ID")}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${isProfit ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {isProfit ? "+" : ""}Rp {pnl.toLocaleString("id-ID")} (
                        {isProfit ? "+" : ""}
                        {pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm text-slate-300 dark:text-slate-700 font-black italic uppercase transition-colors">
            Belum ada aset investasi.
          </div>
        )}
      </div>

      {/* MODAL SMART FORM (DARK MODE READY) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 border border-transparent dark:border-slate-800 transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black italic mb-6 text-slate-900 dark:text-white transition-colors">
              {isEditing ? "Edit Asset" : "Add Asset"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DROPDOWN SMART FORM (Hanya Muncul Saat Tambah Baru) */}
              {!isEditing && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 ml-1">
                    Operasi Aset
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white outline-none text-sm transition-colors cursor-pointer"
                    value={addMode}
                    onChange={(e) => setAddMode(e.target.value)}
                  >
                    <option value="new">✨ Buat Aset Baru</option>
                    {assets.length > 0 && (
                      <optgroup label="Tambah Saldo Aset Lama:">
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

              {/* INPUT KATEGORI & NAMA (Dikunci kalau pilih aset existing) */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Kategori Aset
                </label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors disabled:opacity-50"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  disabled={addMode !== "new" && !isEditing}
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                required
                type="text"
                placeholder="Nama Aset (Misal: BBRI / Bitcoin)"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors disabled:opacity-50"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                disabled={addMode !== "new" && !isEditing}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                    {addMode !== "new" && !isEditing
                      ? "+ Tambah Unit"
                      : "Jumlah (Unit)"}
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="0"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                    {addMode !== "new" && !isEditing
                      ? "Harga Beli Baru"
                      : "Avg Buy Price"}
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="0"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                    value={avgBuyPrice}
                    onChange={(e) => setAvgBuyPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2 ml-1">
                  Current Market Price (Rp)
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="Harga pasar sekarang"
                  className="w-full px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl font-bold text-emerald-700 dark:text-emerald-400 outline-none transition-colors"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Processing..."
                    : addMode !== "new" && !isEditing
                      ? "Merge Aset"
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
