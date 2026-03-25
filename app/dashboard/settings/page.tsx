"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "@/components/AvatarUpload";
import { toast } from "sonner";
import { useFyntra } from "@/context/FyntraContext";

export default function SettingsPage() {
  const { refreshGlobalData } = useFyntra();

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
      toast.error("Gagal Update", { description: error.message });
    } else {
      toast.success("Profil Diperbarui! 🦾", {
        description: "Identitas Ekosistem Faizax tersimpan.",
      });
      refreshGlobalData();
    }
    setUpdating(false);
  };

  if (loading)
    return (
      <div className="p-10 font-black animate-pulse text-slate-300 dark:text-slate-800 italic uppercase tracking-widest text-sm bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center transition-colors duration-300">
        MENGAMBIL IDENTITAS...
      </div>
    );

  return (
    <div className="max-w-2xl animate-in fade-in duration-700 pb-20 bg-transparent transition-all">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none transition-colors duration-300">
          Pengaturan Profil
        </h1>
        <p className="text-slate-500 dark:text-slate-500 font-medium mt-3 text-sm tracking-widest uppercase opacity-60 transition-colors duration-300">
          Identitas Tunggal Faizax Ecosystem
        </p>
      </header>

      <form
        onSubmit={handleUpdate}
        className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 transition-all duration-300"
      >
        {/* Komponen AvatarUpload tetap aman di sini */}
        <AvatarUpload url={avatarUrl} onUpload={(url) => setAvatarUrl(url)} />

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3 ml-1 transition-colors">
              Nama Lengkap
            </label>
            <input
              required
              type="text"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all font-bold text-slate-800 dark:text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3 ml-1 transition-colors">
              Username Unik
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-black italic transition-colors">
                @
              </span>
              <input
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all font-bold text-slate-800 dark:text-white"
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
          className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {updating ? "MENYINKRONKAN..." : "SIMPAN PERUBAHAN"}
        </button>
      </form>
    </div>
  );
}
