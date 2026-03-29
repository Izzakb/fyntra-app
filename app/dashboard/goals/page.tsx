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
      toast.error("Failed to add target", { description: error.message });
    } else {
      toast.success("New Target Created!", {
        description: `Hope you achieve it soon!`,
      });
      setGoalName("");
      setTargetAmount("");
      setShowGoalModal(false);
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Delete this financial goal?")) return;
    const { error } = await supabase.from("fyntra_goals").delete().eq("id", id);
    if (!error) {
      toast.success("Target Deleted", {
        description: "Financial goal has been removed.",
      });
      fetchGoals();
    } else {
      toast.error("Failed to delete", { description: error.message });
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
            Future Goals
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 transition-colors duration-300">
            Financial Milestones
          </p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
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
          New Target
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[3rem] border border-slate-100 dark:border-slate-800/50 transition-all">
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
                className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all duration-300 ${
                  isAchieved
                    ? "bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl border-emerald-100 dark:border-emerald-500/30 dark:shadow-emerald-900/10"
                    : "bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800"
                }`}
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3
                      className={`font-space-grotesk text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors`}
                    >
                      {g.goal_name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 transition-colors">
                      Target: <FormattedMoney amount={g.target_amount} />
                    </p>
                  </div>

                  {isAchieved ? (
                    <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Achieved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                      title="Delete Goal"
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
                  )}
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">
                      Progress
                    </p>
                    <p
                      className={`font-space-grotesk font-bold text-xl transition-colors ${isAchieved ? "text-emerald-500" : "text-blue-600 dark:text-blue-400"}`}
                    >
                      {progress}%
                    </p>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden transition-colors">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isAchieved ? "bg-emerald-500" : "bg-blue-600 dark:bg-blue-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {isAchieved && (
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[80px] z-0 pointer-events-none transition-colors"></div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-20 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 text-center shadow-sm transition-all">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            No financial goals set yet.
          </p>
        </div>
      )}

      {/* MODAL (GLASSMORPHISM TANPA SCROLLBAR) */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/50 w-full max-w-md p-8 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors relative">
            <h3
              className={`font-space-grotesk text-xl font-bold mb-6 dark:text-white text-slate-900 uppercase`}
            >
              Set New Target
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Goal Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Dream House, Emergency Fund"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none transition-all"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  Target Amount (Rp)
                </label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none transition-all"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
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
