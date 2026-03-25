"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

// Pilihan ikon estetik
const ICONS = ["💳", "🏦", "💰", "📱", "🐷", "🪙", "💼", "🚀"];

export default function ManageWalletsPage() {
  const { wallets, refreshGlobalData, balance } = useFyntra();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");

  const [walletName, setWalletName] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [walletIcon, setWalletIcon] = useState("💳");
  const [loading, setLoading] = useState(false);

  const openAddModal = () => {
    setIsEditing(false);
    setWalletName("");
    setWalletBalance("");
    setWalletIcon("💳");
    setShowModal(true);
  };

  const openEditModal = (w: any) => {
    setIsEditing(true);
    setEditId(w.id);
    setWalletName(w.wallet_name);
    setWalletBalance(w.balance.toString());
    setWalletIcon(w.icon);
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

      if (error) toast.error("Gagal Update", { description: error.message });
      else toast.success("Dompet Diperbarui!");
    } else {
      const { error } = await supabase.from("fyntra_wallets").insert({
        user_id: user.id,
        wallet_name: walletName,
        balance: parseInt(walletBalance),
        icon: walletIcon,
        is_default: wallets.length === 0,
      });

      if (error) toast.error("Gagal Menambah", { description: error.message });
      else toast.success("Dompet Baru Berhasil Dibuat!");
    }

    setShowModal(false);
    refreshGlobalData();
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Hapus dompet ${name}? (PERINGATAN: Pastikan Anda sudah memindahkan semua transaksi di dompet ini)`,
      )
    )
      return;

    const { error } = await supabase
      .from("fyntra_wallets")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Gagal Menghapus", {
        description: "Masih ada transaksi yang nyangkut di dompet ini.",
      });
    } else {
      toast.success("Dompet Dihapus!");
      refreshGlobalData();
    }
  };

  const setAsDefault = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("fyntra_wallets")
      .update({ is_default: false })
      .eq("user_id", user.id);
    await supabase
      .from("fyntra_wallets")
      .update({ is_default: true })
      .eq("id", id);

    toast.success("Dompet Utama Diubah!");
    refreshGlobalData();
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20 bg-transparent transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase transition-colors duration-300">
            Manage Wallets
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 italic transition-colors duration-300">
            Pusat Kontrol Sumber Dana
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          + Add Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((w) => (
          <div
            key={w.id}
            className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all duration-300 ${w.is_default ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-800 dark:border-blue-500 shadow-xl" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900"}`}
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors duration-300 ${w.is_default ? "bg-slate-800 dark:bg-blue-700 border border-slate-700 dark:border-blue-400" : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"}`}
              >
                {w.icon}
              </div>
              <div className="flex gap-2">
                {!w.is_default && (
                  <button
                    onClick={() => setAsDefault(w.id)}
                    className="text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg"
                  >
                    Set Default
                  </button>
                )}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(w)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-colors ${w.is_default ? "text-blue-400 hover:text-blue-300 bg-slate-800 dark:bg-blue-800" : "text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id, w.wallet_name)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-colors ${w.is_default ? "text-rose-400 hover:text-rose-300 bg-slate-800 dark:bg-blue-800" : "text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400"}`}
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <p
                className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${w.is_default ? "text-slate-400 dark:text-blue-100" : "text-slate-500 dark:text-slate-400"}`}
              >
                {w.wallet_name}
              </p>
              <h3 className="text-3xl font-black italic tracking-tighter transition-colors">
                Rp {w.balance.toLocaleString("id-ID")}
              </h3>
            </div>

            {w.is_default && (
              <>
                <div className="absolute top-6 right-6 px-3 py-1 bg-blue-600 dark:bg-blue-400 text-white dark:text-blue-950 text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Utama
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 dark:bg-white/10 rounded-full blur-3xl z-0 pointer-events-none transition-colors"></div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* MODAL (DARK MODE READY) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 border border-transparent dark:border-slate-800 transition-colors">
            <h3 className="text-2xl font-black italic mb-6 text-slate-900 dark:text-white transition-colors">
              {isEditing ? "Edit Wallet" : "Add New Wallet"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 ml-1 transition-colors">
                  Pilih Ikon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setWalletIcon(icon)}
                      className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center transition-all ${walletIcon === icon ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-800 dark:text-white"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <input
                required
                type="text"
                placeholder="Nama Dompet (Misal: BCA / Tunai)"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white outline-none transition-all"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
              />

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Saldo Awal
                </label>
                <input
                  required
                  type="number"
                  placeholder="Rp 0"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white outline-none transition-all"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Save Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
