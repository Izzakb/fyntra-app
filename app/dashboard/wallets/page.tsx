"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

// Pilihan ikon estetik untuk dompet
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
      else
        toast.success("Dompet Diperbarui!", {
          description: "Perubahan telah disimpan.",
        });
    } else {
      const { error } = await supabase.from("fyntra_wallets").insert({
        user_id: user.id,
        wallet_name: walletName,
        balance: parseInt(walletBalance),
        icon: walletIcon,
        is_default: wallets.length === 0, // Kalau ini dompet pertama, otomatis jadi default
      });

      if (error) toast.error("Gagal Menambah", { description: error.message });
      else toast.success("Dompet Baru Berhasil Dibuat!");
    }

    setShowModal(false);
    refreshGlobalData();
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    // PROTEKSI: Mengingat instruksi Anda agar data lama jangan hilang!
    if (
      !confirm(
        `Hapus dompet ${name}? (PERINGATAN: Pastikan Anda sudah menghapus/memindahkan semua transaksi di dompet ini terlebih dahulu)`,
      )
    )
      return;

    const { error } = await supabase
      .from("fyntra_wallets")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Gagal Menghapus", {
        description: "Mungkin masih ada transaksi yang nyangkut di dompet ini.",
      });
    } else {
      toast.success("Dompet Dihapus!", {
        description: `${name} telah dihapus dari sistem.`,
      });
      refreshGlobalData();
    }
  };

  const setAsDefault = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Turunkan pangkat semua dompet jadi false, lalu naikkan yang dipilih jadi true
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
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Manage Wallets
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Pusat Kontrol Sumber Dana
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          + Add Wallet
        </button>
      </div>

      {/* TAMPILAN DOMPET */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((w) => (
          <div
            key={w.id}
            className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all ${w.is_default ? "bg-slate-900 text-white border-slate-800 shadow-xl" : "bg-white border-slate-100 hover:border-blue-100"}`}
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${w.is_default ? "bg-slate-800 border border-slate-700" : "bg-slate-50 border border-slate-100"}`}
              >
                {w.icon}
              </div>
              <div className="flex gap-2">
                {!w.is_default && (
                  <button
                    onClick={() => setAsDefault(w.id)}
                    className="text-[9px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 px-3 py-2 rounded-lg"
                  >
                    Set Default
                  </button>
                )}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(w)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${w.is_default ? "text-blue-400 hover:text-blue-300 bg-slate-800" : "text-blue-500 hover:text-blue-600 bg-blue-50"}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id, w.wallet_name)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${w.is_default ? "text-rose-400 hover:text-rose-300 bg-slate-800" : "text-rose-500 hover:text-rose-600 bg-rose-50"}`}
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <p
                className={`text-[10px] font-black uppercase tracking-widest mb-1 ${w.is_default ? "text-slate-400" : "text-slate-500"}`}
              >
                {w.wallet_name}
              </p>
              <h3 className="text-3xl font-black italic tracking-tighter">
                Rp {w.balance.toLocaleString("id-ID")}
              </h3>
            </div>

            {w.is_default && (
              <>
                <div className="absolute top-6 right-6 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                  Utama
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* MODAL ADD / EDIT WALLET */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-6 text-slate-900">
              {isEditing ? "Edit Wallet" : "Add New Wallet"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
                  Pilih Ikon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setWalletIcon(icon)}
                      className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center transition-all ${walletIcon === icon ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 hover:bg-slate-100 border border-slate-100"}`}
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
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
              />

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Saldo Awal
                </label>
                <input
                  required
                  type="number"
                  placeholder="Rp 0"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50"
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
