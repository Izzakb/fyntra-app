"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "Makanan", icon: "🍔" },
  { name: "Transportasi", icon: "🚗" },
  { name: "Hiburan", icon: "🎮" },
  { name: "Belanja", icon: "🛍️" },
  { name: "Kesehatan", icon: "💊" },
  { name: "Income", icon: "💰" },
  { name: "Lainnya", icon: "✨" },
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
  const [recDate, setRecDate] = useState("1"); // Default tanggal 1

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
      return toast.error("Validasi Gagal", {
        description: "Pilih dompet dulu Bos!",
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
      toast.error("Gagal Menyimpan", { description: error.message });
    } else {
      toast.success("Automasi Aktif!", {
        description: `Sistem akan mencatat otomatis setiap tanggal ${recDate}.`,
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
      toast.success(currentStatus ? "Automasi Dijeda" : "Automasi Diaktifkan");
      fetchSubs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jadwal automasi ini?")) return;
    const { error } = await supabase
      .from("fyntra_recurring")
      .delete()
      .eq("id", id);
    if (!error) {
      toast.success("Jadwal Dihapus");
      fetchSubs();
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Automations
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Tagihan & Pemasukan Otomatis
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          + Add Automation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center text-slate-300 font-black italic uppercase animate-pulse">
            Memuat Data...
          </div>
        ) : subs.length > 0 ? (
          subs.map((s) => (
            <div
              key={s.id}
              className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden transition-all ${s.is_active ? "bg-white border-slate-100 hover:border-blue-200" : "bg-slate-50 border-slate-200 opacity-60"}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${s.type === "expense" ? "bg-rose-50" : "bg-emerald-50"}`}
                >
                  {s.type === "income"
                    ? "💰"
                    : CATEGORIES.find((c) => c.name === s.category)?.icon ||
                      "💸"}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(s.id, s.is_active)}
                    className="text-[20px] hover:scale-110 transition-transform"
                  >
                    {s.is_active ? "⏸️" : "▶️"}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-[20px] hover:scale-110 transition-transform"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Tiap Tanggal {s.recurring_date}
                </p>
                <h3 className="text-xl font-black italic tracking-tight text-slate-900 truncate">
                  {s.description}
                </h3>
                <p
                  className={`text-2xl font-black italic tracking-tighter mt-2 ${s.type === "expense" ? "text-rose-500" : "text-emerald-500"}`}
                >
                  {s.type === "expense" ? "-" : "+"} Rp{" "}
                  {s.amount.toLocaleString("id-ID")}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                    {s.fyntra_wallets?.icon} {s.fyntra_wallets?.wallet_name}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm text-slate-300 font-black italic uppercase">
            Belum ada jadwal automasi.
          </div>
        )}
      </div>

      {/* MODAL ADD AUTOMATION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-6">Set Automation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${type === "expense" ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}
                >
                  Tagihan
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${type === "income" ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400"}`}
                >
                  Pemasukan
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Tanggal Eksekusi
                  </label>
                  <select
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Tgl {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Sumber Dana
                  </label>
                  <select
                    required
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none truncate"
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
                placeholder="Nama Tagihan (Misal: Netflix)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Nominal (Rp)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              {type === "expense" && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CATEGORIES.filter((c) => c.name !== "Income").map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCategory(c.name)}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${category === c.name ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
