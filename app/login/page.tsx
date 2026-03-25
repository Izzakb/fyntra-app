"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Mencegah Hydration Error (Menunggu Client Ready)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Gagal Masuk", { description: error.message });
      setLoading(false);
    } else {
      toast.success("Selamat Datang Kembali, Bos!");
      router.push("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error("Google Login Gagal", { description: error.message });
    }
  };

  // Jika belum mounted, tampilkan background kosong biar gak flashing
  if (!mounted) return <div className="min-h-screen bg-[#020617]"></div>;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* GLOW ORNAMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* LOGIN CARD */}
      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[3.5rem] shadow-2xl border border-slate-800/50 relative z-10 transition-all duration-500 hover:border-slate-700/50">
        {/* LOGO SEKSI */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 shadow-[0_0_40px_rgba(37,99,235,0.3)] italic transform hover:rotate-6 transition-transform">
            F
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Fyntra <span className="text-blue-500">Auth</span>
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em] italic">
            Secure Wealth Gateway
          </p>
        </div>

        {/* FORM MANUAL */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
              Identity (Email)
            </label>
            <input
              required
              type="email"
              className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-slate-700 text-sm font-bold"
              placeholder="ceo@fyntra.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
              Security Key
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-slate-700 text-sm font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors text-lg"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              "Access Dashboard"
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-8">
            <div className="w-full h-px bg-slate-800"></div>
            <span className="absolute px-4 bg-[#0a0f1d] text-[9px] font-black text-slate-600 uppercase tracking-widest">
              Or Social Access
            </span>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <img
              src="https://www.google.com/favicon.ico"
              className="w-4 h-4"
              alt="Google"
            />
            Continue with Google
          </button>
        </div>

        {/* REGISTER LINK */}
        <div className="mt-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            New to the ecosystem?{" "}
            <Link
              href="/register"
              className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
            >
              Create Identity
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
