"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AvatarUpload({
  url,
  onUpload,
}: {
  url: string | null;
  onUpload: (url: string) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 1. Tarik gambar kalau URL-nya sudah ada di database
  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log("Error downloading image: ", error);
    }
  };

  // 2. Fungsi Utama Upload
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Kamu harus memilih gambar buat diupload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`; // Nama file unik

      // A. Upload file ke Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // B. Kasih tau parent (DashboardSettings) kalau upload sukses
      onUpload(filePath);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 pb-6 border-b border-slate-100/50">
      <div className="relative group">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-3xl object-cover shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-slate-100">
            👤
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center text-white font-bold text-xs animate-pulse">
            Sabar...
          </div>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Foto Profil @Faizax
        </label>
        <button
          disabled={uploading}
          className="relative px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition disabled:opacity-50 overflow-hidden"
        >
          {uploading ? "MENYINKRONKAN..." : "Ganti Avatar"}
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </button>
      </div>
    </div>
  );
}
