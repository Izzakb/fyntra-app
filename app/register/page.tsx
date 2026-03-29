"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, Variants, AnimatePresence } from "framer-motion";

// FONT PREMIUM: Inter & Space Grotesk
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

// --- SMOOTH & SIMPLE CONFIG ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // PASSWORD STATES
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Validasi panjang password
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    // Validasi Confirm Password
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please check again.");
      setLoading(false);
      return;
    }

    // 1. Mendaftarkan User ke Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      toast.error("Registration Failed", { description: error.message });
      setLoading(false);
    } else {
      toast.success("Identity Created!", {
        description:
          "Please check your email for verification or log in directly.",
      });
      router.push("/login");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error("Google Auth Failed");
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]"></div>;

  return (
    <div
      className={`${inter.className} min-h-screen bg-[#020617] flex items-center justify-center px-6 relative overflow-hidden py-12`}
    >
      {/* BACKGROUND GLOW */}
      <motion.div
        animate={{ opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"
      />

      {/* CARD REGISTER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl border border-slate-800/50 relative z-10 my-8"
      >
        <div className="text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`${spaceGrotesk.className} w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg`}
          >
            F
          </motion.div>
          <h1
            className={`${spaceGrotesk.className} text-3xl font-bold tracking-tight text-white uppercase`}
          >
            Create <span className="text-blue-500">Identity</span>
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
            Faizax Ecosystem Gateway
          </p>
        </div>

        {/* VISUAL ERROR BOX */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-[11px] font-bold flex items-center gap-3 shadow-lg shadow-red-500/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM SECTION */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleRegister}
          className="flex flex-col gap-5"
        >
          {/* FULL NAME */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Full Name
            </label>
            <input
              required
              type="text"
              className={`w-full px-6 py-4 bg-slate-800/40 border rounded-2xl focus:ring-2 text-white outline-none transition-all placeholder:text-slate-600 font-medium text-sm ${
                errorMsg
                  ? "border-red-500/50 focus:ring-red-500 bg-red-500/5"
                  : "border-slate-700/50 focus:ring-blue-500"
              }`}
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
            />
          </motion.div>

          {/* EMAIL */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Email Address
            </label>
            <input
              required
              type="email"
              className={`w-full px-6 py-4 bg-slate-800/40 border rounded-2xl focus:ring-2 text-white outline-none transition-all placeholder:text-slate-600 font-medium text-sm ${
                errorMsg
                  ? "border-red-500/50 focus:ring-red-500 bg-red-500/5"
                  : "border-slate-700/50 focus:ring-blue-500"
              }`}
              placeholder="admin@faizax.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
            />
          </motion.div>

          {/* PASSWORD */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Security Key
            </label>

            {/* KUNCI SMOOTH-NYA DI SINI: Bungkus input & hint tanpa gap */}
            <div className="flex flex-col">
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-6 py-4 bg-slate-800/40 border rounded-2xl focus:ring-2 text-white outline-none transition-all placeholder:text-slate-600 font-medium text-sm pr-12 ${
                    errorMsg
                      ? "border-red-500/50 focus:ring-red-500 bg-red-500/5"
                      : "border-slate-700/50 focus:ring-blue-500"
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${
                    errorMsg
                      ? "text-red-400 hover:text-red-300"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>

              {/* HINT PASSWORD DINAMIS */}
              <AnimatePresence>
                {isPasswordFocused && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden px-2"
                  >
                    {/* Padding top (pt-2) menggantikan efek gap yang bikin patah */}
                    <div className="pt-2 pb-1">
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        Minimum 6 characters or numbers.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CONFIRM PASSWORD */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Confirm Security Key
            </label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full px-6 py-4 bg-slate-800/40 border rounded-2xl focus:ring-2 text-white outline-none transition-all placeholder:text-slate-600 font-medium text-sm pr-12 ${
                  errorMsg
                    ? "border-red-500/50 focus:ring-red-500 bg-red-500/5"
                    : "border-slate-700/50 focus:ring-blue-500"
                }`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${
                  errorMsg
                    ? "text-red-400 hover:text-red-300"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>

          {/* SUBMIT BUTTON */}
          <motion.div variants={itemVariants} className="mt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? "Creating Identity..." : "Create Identity"}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* SOCIAL ACCESS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-col gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="relative flex items-center justify-center"
          >
            <div className="w-full h-px bg-slate-800"></div>
            <span className="absolute px-4 bg-[#060b1a] text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Or Social Access
            </span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-3 transition-all hover:bg-slate-100"
            >
              <img
                src="https://www.google.com/favicon.ico"
                className="w-4 h-4"
                alt="Google"
              />
              Continue with Google
            </motion.button>
          </motion.div>
        </motion.div>

        {/* BACK TO LOGIN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 text-center text-[10px] font-bold uppercase text-slate-500 tracking-widest"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Sign in here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
