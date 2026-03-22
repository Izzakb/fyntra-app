"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// IMPORT KOMPONEN MODULAR
import DashboardHome from "@/components/DashboardHome";
import DashboardSettings from "@/components/DashboardSettings";
import DashboardGoals from "@/components/DashboardGoals";
import DashboardTransactions from "@/components/DashboardTransactions"; // Nama baru sesuai instruksi

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("beranda");
  const [fullName, setFullName] = useState("Founder");
  const [balance, setBalance] = useState(0);
  const [avatarBlob, setAvatarBlob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        if (profile.avatar_url) downloadImage(profile.avatar_url);
      }
      if (wallet) setBalance(wallet.balance);
    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const savedTab = localStorage.getItem("fyntra_last_tab");
    if (savedTab) setActiveTab(savedTab);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    localStorage.setItem("fyntra_last_tab", activeTab);
  }, [activeTab]);

  // LOGIKA NAVIGASI CONTENT
  const renderContent = () => {
    switch (activeTab) {
      case "beranda":
        return (
          <DashboardHome
            fullName={fullName}
            balance={balance}
            onUpdate={fetchData}
          />
        );
      case "tabungan":
        return <DashboardGoals balance={balance} />;
      case "transaksi":
        return <DashboardTransactions />; // Komponen Transaksi
      case "settings":
        return <DashboardSettings />;
      default:
        return (
          <DashboardHome
            fullName={fullName}
            balance={balance}
            onUpdate={fetchData}
          />
        );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-blue-600 italic animate-pulse tracking-[0.3em]">
        SYNCING FAIZAX...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100">
            F
          </div>
          <span className="font-black tracking-tighter uppercase text-slate-900 italic">
            Fyntra
          </span>
        </div>

        {/* PROFILE PREVIEW */}
        <div className="mb-10 p-5 bg-slate-50 rounded-[2rem] flex items-center gap-3 border border-slate-100">
          {avatarBlob ? (
            <img
              src={avatarBlob}
              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
              alt="Profile"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-xs">
              👤
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              FOUNDER
            </p>
            <p className="font-bold text-xs text-slate-900 truncate tracking-tight">
              {fullName}
            </p>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <nav className="space-y-2 flex-1">
          <SidebarLink
            active={activeTab === "beranda"}
            onClick={() => setActiveTab("beranda")}
            icon="🏠"
            label="Beranda"
          />
          <SidebarLink
            active={activeTab === "tabungan"}
            onClick={() => setActiveTab("tabungan")}
            icon="🎯"
            label="Tabungan"
          />
          <SidebarLink
            active={activeTab === "transaksi"}
            onClick={() => setActiveTab("transaksi")}
            icon="💳"
            label="Transaksi"
          />
          <SidebarLink
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon="⚙️"
            label="Pengaturan"
          />
        </nav>

        {/* EXIT BUTTON */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            router.push("/login");
          }}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
        >
          <span>🚪</span> Keluar
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* HEADER MINI */}
        <div className="flex justify-end mb-10">
          <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-full border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
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

        {/* DYNAMIC CONTENT AREA */}
        <div className="max-w-5xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

// COMPONENT: SIDEBAR LINK
function SidebarLink({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 ${
        active
          ? "bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      }`}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}
