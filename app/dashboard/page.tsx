"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// IMPORT KOMPONEN
import DashboardHome from "@/components/DashboardHome";
import DashboardSettings from "@/components/DashboardSettings";

export default function DashboardPage() {
  // 1. Ambil tab terakhir dari localStorage, kalau ga ada default ke 'beranda'
  const [activeTab, setActiveTab] = useState("beranda");
  const [fullName, setFullName] = useState("Founder");
  const [balance, setBalance] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fungsi ambil foto dari Storage
  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setAvatarBlob(url);
    } catch (error) {
      console.log("Error loading avatar:", error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
      const { data: wallet } = await supabase
        .from("fyntra_wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
        setAvatarUrl(profile.avatar_url);
        if (profile.avatar_url) downloadImage(profile.avatar_url);
      }
      if (wallet) setBalance(wallet.balance);
    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // EFFECT: Cek tab terakhir saat pertama kali buka
  useEffect(() => {
    const savedTab = localStorage.getItem("fyntra_last_tab");
    if (savedTab) setActiveTab(savedTab);
    fetchData();
  }, [fetchData]);

  // EFFECT: Simpan ke localStorage tiap kali tab berubah
  useEffect(() => {
    localStorage.setItem("fyntra_last_tab", activeTab);
  }, [activeTab]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-blue-600 italic animate-pulse tracking-[0.3em]">
        SYNCING FAIZAX...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            F
          </div>
          <span className="font-black tracking-tighter uppercase text-slate-900 italic">
            Fyntra
          </span>
        </div>

        {/* PROFIL SINGKAT DI SIDEBAR */}
        <div className="mb-10 p-4 bg-slate-50 rounded-3xl flex items-center gap-3 border border-slate-100">
          {avatarBlob ? (
            <img
              src={avatarBlob}
              className="w-10 h-10 rounded-xl object-cover"
              alt="Profile"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-xs">
              👤
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              CEO
            </p>
            <p className="font-bold text-xs text-slate-900 truncate">
              {fullName}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("beranda")}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === "beranda" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
          >
            🏠 Beranda
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === "settings" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
          >
            ⚙️ Pengaturan
          </button>
        </nav>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            router.push("/login");
          }}
          className="mt-auto text-left px-5 py-3 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-2xl transition"
        >
          🚪 Keluar
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* TOP HEADER */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {fullName}
            </span>
            {avatarBlob ? (
              <img
                src={avatarBlob}
                className="w-8 h-8 rounded-lg object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                👤
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === "beranda" ? (
            <DashboardHome
              fullName={fullName}
              balance={balance}
              onUpdate={fetchData}
            />
          ) : (
            <DashboardSettings />
          )}
        </div>
      </main>
    </div>
  );
}
