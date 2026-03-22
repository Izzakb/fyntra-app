"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardGoals({ balance }: { balance: number }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const fetchGoals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("fyntra_goals")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (data) setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("fyntra_goals")
      .insert({
        user_id: user?.id,
        goal_name: name,
        target_amount: parseInt(target),
      });
    setName("");
    setTarget("");
    setShowModal(false);
    fetchGoals();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black italic">Target Impian 🎯</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          + Buat Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const progress = Math.min(
            (balance / g.target_amount) * 100,
            100,
          ).toFixed(0);
          return (
            <div
              key={g.id}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <p className="font-black text-lg text-slate-800 uppercase italic mb-1">
                {g.goal_name}
              </p>
              <p className="text-xs font-bold text-slate-400 mb-6">
                Target: Rp {g.target_amount.toLocaleString()}
              </p>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-blue-600 uppercase">
                  Progress
                </span>
                <span className="text-[10px] font-black text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      {/* ... (Modal logic sama dengan sebelumnya) */}
    </div>
  );
}
