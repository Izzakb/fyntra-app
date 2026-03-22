"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; // <--- TAMBAHKAN INI
import { useRouter } from "next/navigation"; // <--- TAMBAHKAN INI

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // <--- TAMBAHKAN INI
  const [loading, setLoading] = useState(false); // <--- BUAT LOADING STATE
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // MESIN LOGIN SUPABASE
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Gagal Masuk: " + error.message);
      setLoading(false);
    } else {
      // Jika berhasil, baru pindah ke dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black mx-auto mb-6 shadow-lg shadow-blue-200">
            F
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Selamat Datang
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Kelola keuanganmu dengan cerdas.
          </p>
        </div>

        {/* GANTI FORM BIAR ADA ONSUBMIT */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Alamat Email
            </label>
            <input
              required
              type="email"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Kata Sandi
            </label>
            <input
              required
              type="password"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? "Sedang Masuk..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Daftar Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
