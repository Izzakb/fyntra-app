"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "@/components/AvatarUpload";
import { toast } from "sonner";
import { useFyntra } from "@/context/FyntraContext";
import { useRouter } from "next/navigation"; // 💡 TAMBAHKAN ROUTER

export default function SettingsPage() {
  const { refreshGlobalData } = useFyntra();
  const router = useRouter(); // 💡 INISIALISASI ROUTER

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", user.id)
          .single();
        if (data) {
          setFullName(data.full_name || "");
          setUsername(data.username || "");
          setAvatarUrl(data.avatar_url || null);
        }
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username: username?.toLowerCase(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);

    if (error) {
      toast.error("Update Failed", { description: error.message });
    } else {
      toast.success("Profile Updated! 🦾", {
        description: "Ecosystem identity saved successfully.",
      });
      refreshGlobalData();
    }
    setUpdating(false);
  };

  // 💡 FUNGSI LOGOUT SAKTI
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout Failed", { description: error.message });
    } else {
      toast.success("Signed Out Successfully");
      router.push("/login"); // Sesuaikan dengan route login kamu
    }
  };

  if (loading)
    return (
      <div
        className={`max-w-2xl p-10 font-bold text-slate-400 uppercase tracking-widest text-xs bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[3rem] border border-slate-100 dark:border-slate-800/50 text-center`}
      >
        FETCHING IDENTITY...
      </div>
    );

  return (
    <div className={`max-w-2xl pb-20 bg-transparent`}>
      <header className="mb-10">
        <h1
          className={`font-space-grotesk text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase`}
        >
          Profile Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-[10px] tracking-[0.3em] uppercase">
          Faizax Ecosystem Identity
        </p>
      </header>

      <div className="space-y-6">
        <form
          onSubmit={handleUpdate}
          className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm space-y-8 relative overflow-hidden"
        >
          {/* Glow Background Halus */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[80px] z-0 pointer-events-none"></div>

          <div className="relative z-10">
            <AvatarUpload
              url={avatarUrl}
              onUpload={(url) => setAvatarUrl(url)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                Full Name
              </label>
              <input
                required
                type="text"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 font-bold text-slate-900 dark:text-white"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                Unique Username
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">
                  @
                </span>
                <input
                  type="text"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 font-bold text-slate-900 dark:text-white placeholder:font-medium placeholder:text-slate-400"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            disabled={updating}
            type="submit"
            className="relative z-10 w-full py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {updating ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>{" "}
                SYNCING...
              </>
            ) : (
              "SAVE CHANGES"
            )}
          </button>
        </form>

        {/* 💡 TOMBOL LOGOUT SEKSI */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white shadow-sm active:scale-95 flex justify-center items-center gap-2"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out of Ecosystem
        </button>
      </div>
    </div>
  );
}
