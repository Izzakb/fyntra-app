"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
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

export default function UpdatePasswordPage() {
  const [mounted, setMounted] = useState(false);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
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

    // Update Password di Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      toast.error("Update Failed", { description: error.message });
      setLoading(false);
    } else {
      toast.success("Security Key Updated!", {
        description: "Your vault is secure. Please log in with your new key.",
      });
      // Arahkan kembali ke halaman login setelah berhasil
      router.push("/login");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]"></div>;

  return (
    <div
      className={`${inter.className} min-h-screen bg-[#020617] flex items-center justify-center px-6 relative overflow-hidden`}
    >
      {/* BACKGROUND GLOW */}
      <motion.div
        animate={{ opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* CARD UPDATE PASSWORD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl border border-slate-800/50 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`${spaceGrotesk.className} w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg`}
          >
            F
          </motion.div>
          <h1
            className={`${spaceGrotesk.className} text-2xl font-bold tracking-tight text-white uppercase`}
          >
            Update <span className="text-blue-500">Security Key</span>
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-widest">
            Set your new vault password
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
          onSubmit={handleUpdatePassword}
          className="flex flex-col gap-5"
        >
          {/* NEW PASSWORD */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              New Security Key
            </label>
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
                  className="overflow-hidden px-2"
                >
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 mt-1">
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* CONFIRM NEW PASSWORD */}
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
          <motion.div variants={itemVariants} className="mt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? "Updating Key..." : "Update Security Key"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
