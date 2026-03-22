"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload"; // IMPORT INI

export default function DashboardSettings() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // TAMBAH INI
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 1. Ambil data profil
  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url") // TAMBAH avatar_url
          .eq("id", user.id)
          .single();

        if (data) {
          setFullName(data.full_name || "");
          setUsername(data.username || "");
          setAvatarUrl(data.avatar_url || null); // TAMBAH INI
        }
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  // 2. Fungsi Update ke Database
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
        avatar_url: avatarUrl, // SIMPAN URL AVATAR BARU
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);

    if (error) {
      alert("Gagal Update: " + error.message);
    } else {
      alert("Profil Ekosistem Faizax Berhasil Diperbarui! 🦾");
      window.location.reload();
    }
    setUpdating(false);
  };

  if (loading)
    return (
      <div className="p-10 font-black animate-pulse text-blue-600 italic">
        MENGAMBIL IDENTITAS...
      </div>
    );

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
          Pengaturan Profil
        </h1>
        <p className="text-slate-500 font-medium mt-3 text-sm tracking-widest uppercase opacity-60">
          Identitas Tunggal Faizax Ecosystem
        </p>
      </header>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8"
      >
        {/* PANGGIL KOMPONEN UPLOAD DI SINI */}
        <AvatarUpload
          url={avatarUrl}
          onUpload={(url) => setAvatarUrl(url)} // Kalau upload sukses, state di parent berubah
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">
              Nama Lengkap
            </label>
            <input
              required
              type="text"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all font-bold text-slate-800"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">
              Username Unik
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black italic">
                @
              </span>
              <input
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all font-bold text-slate-800"
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
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-600 active:scale-[0.98] transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
        >
          {updating ? "MENYINKRONKAN..." : "SIMPAN PERUBAHAN"}
        </button>
      </form>
    </div>
  );
}
