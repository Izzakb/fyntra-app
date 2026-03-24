"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardGoals({ balance }: { balance: number }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const fetchGoals = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("fyntra_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setGoals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("fyntra_goals").insert({
      user_id: user.id,
      goal_name: name,
      target_amount: parseInt(target),
    });

    setName("");
    setTarget("");
    setShowModal(false);
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin mau hapus target impian ini, Bos?")) {
      await supabase.from("fyntra_goals").delete().eq("id", id);
      fetchGoals();
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Target Impian
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Visi Masa Depan Faizax
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all"
        >
          + Buat Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <p className="col-span-2 text-center py-20 font-black text-slate-200 italic uppercase tracking-widest">
            Visioning...
          </p>
        ) : goals.length > 0 ? (
          goals.map((g) => {
            const progress = Math.min(
              (balance / g.target_amount) * 100,
              100,
            ).toFixed(0);
            const isAchieved = balance >= g.target_amount;

            return (
              <div
                key={g.id}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden"
              >
                {isAchieved && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-3xl font-black text-[9px] uppercase tracking-widest shadow-lg">
                    ACHIEVED 🏆
                  </div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter mb-1">
                      {g.goal_name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                      Goal: Rp {g.target_amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500 text-xs font-black uppercase tracking-widest"
                  >
                    Hapus
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Kekurangan
                    </span>
                    <span className="text-sm font-black italic text-blue-600">
                      {isAchieved
                        ? "Siap Dibeli!"
                        : `Rp ${(g.target_amount - balance).toLocaleString("id-ID")}`}
                    </span>
                  </div>

                  <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isAchieved ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-blue-600 shadow-lg shadow-blue-100"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                      Progress
                    </span>
                    <span className="text-[10px] font-black text-slate-900">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white/50 border-2 border-dashed border-slate-200 p-20 rounded-[3rem] text-center">
            <p className="text-slate-300 font-black italic uppercase tracking-widest">
              Mulai petualangan finansialmu dengan membuat target pertama.
            </p>
          </div>
        )}
      </div>

      {/* MODAL BUAT TARGET */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">
              Target Baru
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10 italic">
              Tuliskan impianmu, Faizax akan mengawalnya.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">
                  Nama Impian
                </label>
                <input
                  required
                  type="text"
                  placeholder="Misal: iPhone 17 Pro Max"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">
                  Nominal Target (Rp)
                </label>
                <input
                  required
                  type="number"
                  placeholder="Contoh: 25000000"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400 tracking-widest"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
