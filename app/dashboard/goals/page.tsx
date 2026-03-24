"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner"; // <-- IMPORT SONNER

export default function GoalsPage() {
  const { balance } = useFyntra();

  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

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

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("fyntra_goals").insert({
      user_id: user.id,
      goal_name: goalName,
      target_amount: parseInt(targetAmount),
    });

    if (error) {
      toast.error("Gagal menambah target", { description: error.message });
    } else {
      toast.success("Target Baru Dibuat!", {
        description: `Semoga cepat tercapai ya!`,
      });
      setGoalName("");
      setTargetAmount("");
      setShowGoalModal(false);
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Hapus target ini?")) return;
    const { error } = await supabase.from("fyntra_goals").delete().eq("id", id);
    if (!error) {
      toast.success("Target Dihapus", {
        description: "Data target keuangan telah dihapus.",
      });
      fetchGoals();
    } else {
      toast.error("Gagal menghapus", { description: error.message });
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Future Goals
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Target Keuangan Faizax
          </p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          + New Target
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black text-slate-200 animate-pulse italic uppercase tracking-widest text-sm bg-white rounded-[3rem] border border-slate-100">
          Loading Targets...
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => {
            const rawProgress = (balance / g.target_amount) * 100;
            const progress = Math.min(rawProgress, 100).toFixed(0);
            const isAchieved = balance >= g.target_amount;

            return (
              <div
                key={g.id}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">
                      {g.goal_name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Target: Rp {g.target_amount.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {isAchieved ? (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      Achieved 🎯
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase text-rose-400 hover:text-rose-600"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Progress
                    </p>
                    <p
                      className={`font-black text-lg italic ${isAchieved ? "text-emerald-500" : "text-blue-600"}`}
                    >
                      {progress}%
                    </p>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${isAchieved ? "bg-emerald-500" : "bg-blue-600"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {isAchieved && (
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
          <p className="text-slate-300 font-black italic uppercase tracking-widest">
            Belum ada target keuangan.
          </p>
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic mb-6">Set New Target</h3>
            <form onSubmit={handleAddGoal} className="space-y-6">
              <input
                required
                type="text"
                placeholder="Nama Target (Misal: Modal Bisnis)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Nominal Target (Rp)"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 font-black text-[10px] uppercase text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
