"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import DashboardHome from "@/components/DashboardHome";
import DashboardTransactions from "@/components/DashboardTransactions";
import DashboardGoals from "@/components/DashboardGoals";
import DashboardSettings from "@/components/DashboardSettings";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [balance, setBalance] = useState(0);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  // FUNGSI FETCH DATA GLOBAL (Agar Balance Terupdate Otomatis)
  const fetchGlobalData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Ambil Profil (Nama)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // 2. Ambil Wallet (Saldo Terupdate)
    const { data: wallet } = await supabase
      .from("fyntra_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (profile) setFullName(profile.full_name);
    if (wallet) setBalance(wallet.balance);
    setLoading(false);
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white font-black italic text-slate-200 text-3xl animate-pulse">
        FYNTRA.OS
      </div>
    );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-12 max-w-7xl mx-auto">
        {/* TOP NAVBAR SEDERHANA */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs">
              {fullName.charAt(0)}
            </div>
            <p className="text-xs font-black italic text-slate-900 uppercase tracking-tighter">
              Welcome, {fullName.split(" ")[0]}
            </p>
          </div>
          <div className="px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* RENDER KOMPONEN BERDASARKAN STATE */}
        {activeTab === "home" && (
          <DashboardHome
            fullName={fullName}
            balance={balance}
            onUpdate={fetchGlobalData}
            onNavigate={(id) => setActiveTab(id)} // Kirim fungsi navigasi ke Home
          />
        )}
        {activeTab === "transactions" && (
          <DashboardTransactions onUpdate={fetchGlobalData} />
        )}
        {activeTab === "goals" && <DashboardGoals balance={balance} />}
        {activeTab === "settings" && <DashboardSettings />}
      </main>
    </div>
  );
}
