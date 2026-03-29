"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useFyntra } from "@/context/FyntraContext";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AiAdvisor from "@/components/AiAdvisor";

// FONT PREMIUM
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

// 💡 MAP LOGO SVG (DIAMBIL DARI WALLET PAGE)
const ICONS_MAP: Record<string, React.ReactNode> = {
  Card: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  Bank: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <path d="M12 16v-6" />
      <path d="M8 16v-6" />
      <path d="M16 16v-6" />
      <path d="M8 10h8" />
    </svg>
  ),
  Cash: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  "E-Wallet": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  ),
  Piggy: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.5L20 12V6c0-.6-.4-1-1-1Z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <path d="M16 11h.01" />
    </svg>
  ),
  Coin: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 12a4 4 0 0 0-8 0" />
    </svg>
  ),
  Briefcase: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Rocket: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
};

// 💡 HELPER RENDER LOGO (BIAR MUNCUL GAMBAR BUKAN TULISAN)
const renderWalletIcon = (iconVal: string) => {
  return ICONS_MAP[iconVal] || <span className="text-xl">{iconVal}</span>;
};

// SVG PREMIUM KATEGORI
const CATEGORIES = [
  {
    name: "Makanan",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    name: "Transportasi",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    name: "Hiburan",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <path d="M6 12h4" />
        <path d="M8 10v4" />
        <path d="M15 13h.01" />
        <path d="M18 11h.01" />
      </svg>
    ),
  },
  {
    name: "Belanja",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    name: "Kesehatan",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    ),
  },
  {
    name: "Income",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    name: "Lainnya",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
];

const FormattedMoney = ({
  amount,
  prefix = "Rp ",
  showSign = false,
}: {
  amount: number;
  prefix?: string;
  showSign?: boolean;
}) => {
  const safeAmount = amount || 0;
  const isNegative = safeAmount < 0;
  const absAmount = Math.abs(safeAmount);
  const formattedRaw = absAmount.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  const parts = formattedRaw.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1];
  let sign = "";
  if (showSign) {
    sign = isNegative ? "-" : "+";
  } else if (isNegative) {
    sign = "-";
  }
  return (
    <span>
      {" "}
      {sign} {prefix} {integerPart}{" "}
      {decimalPart && (
        <span className="text-[0.6em] opacity-60 ml-[1px]">,{decimalPart}</span>
      )}{" "}
    </span>
  );
};

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isIncome = data.name === "In";
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl shadow-black/50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
          {isIncome ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
          {isIncome ? "Total Income" : "Total Expense"}
        </p>
        <p
          className={`${spaceGrotesk.className} font-bold text-xl ${isIncome ? "text-emerald-400" : "text-rose-400"}`}
        >
          <FormattedMoney amount={data.t} />
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardHomePage() {
  const {
    balance,
    totalInvestment,
    netWorth,
    wallets,
    refreshGlobalData,
    loadingGlobal,
  } = useFyntra();

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense",
  );
  const [transactionName, setTransactionName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Makanan");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [magicText, setMagicText] = useState("");
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  const handleMagicProcess = async (textToProcess: string = magicText) => {
    if (!textToProcess) return toast.error("Ketik sesuatu dulu Bos!");
    setIsMagicLoading(true);
    try {
      const res = await fetch("/api/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess }),
      });
      const data = await res.json();
      applyMagicData(data);
    } catch (e) {
      toast.error("Gagal konek ke otak AI.");
    }
    setIsMagicLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsMagicLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: reader.result }),
        });
        const data = await res.json();
        applyMagicData(data);
      } catch (e) {
        toast.error("Gagal baca struk.");
      }
      setIsMagicLoading(false);
    };
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Browser ga support mic.");
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMagicText(transcript);
      handleMagicProcess(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const applyMagicData = (data: any) => {
    if (data.error) return toast.error(data.error);
    if (data.amount) setTransactionAmount(data.amount.toString());
    if (data.description) setTransactionName(data.description);
    if (data.type) setTransactionType(data.type);
    if (data.type === "expense" && data.category) {
      setSelectedCategory(data.category);
    } else if (data.type === "income") {
      setSelectedCategory("Income");
    }
    if (data.wallet_hint && wallets.length > 0) {
      const matched = wallets.find((w) =>
        w.wallet_name.toLowerCase().includes(data.wallet_hint.toLowerCase()),
      );
      if (matched) setSelectedWalletId(matched.id);
    }
    toast.success("✨ AI Berhasil Mengisi Form!");
    setMagicText("");
  };

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: trans } = await supabase
      .from("fyntra_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const { data: targetGoals } = await supabase
      .from("fyntra_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (trans) setTransactions(trans);
    if (targetGoals) setGoals(targetGoals);
  };

  useEffect(() => {
    fetchData();
  }, [balance]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      const tDate = new Date(t.created_at);
      if (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      ) {
        t.type === "income"
          ? (income += Number(t.amount))
          : (expense += Number(t.amount));
      }
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  const topExpenseCategory = useMemo(() => {
    const now = new Date();
    const expenses = transactions.filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.created_at).getMonth() === now.getMonth(),
    );
    if (expenses.length === 0) return "Belum ada";
    const grouped = expenses.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});
    return Object.keys(grouped).reduce((a, b) =>
      grouped[a] > grouped[b] ? a : b,
    );
  }, [transactions]);

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletId) {
      toast.error("Validasi Gagal", {
        description: "Pilih Source Wallet terlebih dahulu, Bos!",
      });
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.rpc("process_fyntra_transaction", {
      p_user_id: user?.id,
      p_wallet_id: selectedWalletId,
      p_amount: parseInt(transactionAmount),
      p_type: transactionType,
      p_category: transactionType === "income" ? "Income" : selectedCategory,
      p_description: transactionName,
    });
    if (error) {
      toast.error("Gagal Simpan", { description: error.message });
    } else {
      toast.success("Transaction Saved!");
      setShowTransactionModal(false);
      refreshGlobalData();
      fetchData();
      setTransactionName("");
      setTransactionAmount("");
      setMagicText("");
    }
    setLoading(false);
  };

  if (loadingGlobal)
    return (
      <div
        className={`${inter.className} p-10 font-bold italic text-slate-300 dark:text-slate-700`}
      >
        {" "}
        Syncing Ledger...{" "}
      </div>
    );

  return (
    <div
      className={`${inter.className} bg-transparent min-h-screen transition-colors duration-300 space-y-10 pb-20`}
    >
      {/* 2. HEADER WEALTH DASHBOARD */}
      <div className="bg-slate-900 dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] border border-transparent dark:border-slate-800/50 text-white shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              {" "}
              <p className="text-slate-400 dark:text-blue-300 text-[10px] font-bold uppercase tracking-[0.5em] mb-3">
                {" "}
                Liquid Cash (Siap Pakai){" "}
              </p>
              <h2
                className={`${spaceGrotesk.className} text-5xl md:text-6xl font-bold tracking-tight`}
              >
                {" "}
                <FormattedMoney amount={balance} />{" "}
              </h2>{" "}
            </div>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/30 whitespace-nowrap hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all"
            >
              {" "}
              + Add Transaction{" "}
            </button>{" "}
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 dark:border-slate-700/50 pt-6 mt-2">
            <div>
              {" "}
              <p className="text-slate-400 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">
                {" "}
                Total Investment{" "}
              </p>
              <p
                className={`${spaceGrotesk.className} text-xl md:text-2xl font-bold`}
              >
                {" "}
                <FormattedMoney amount={totalInvestment} />{" "}
              </p>{" "}
            </div>
            <div>
              {" "}
              <p className="text-emerald-400 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest mb-1">
                {" "}
                Net Worth (Master Asset){" "}
              </p>
              <p
                className={`${spaceGrotesk.className} text-xl md:text-2xl font-bold text-emerald-400 dark:text-emerald-300`}
              >
                {" "}
                <FormattedMoney amount={netWorth} />{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0 pointer-events-none"></div>{" "}
      </div>

      {/* DOMPET LIST */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="min-w-[220px] bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors duration-300"
          >
            {/* 💡 FIX: RENDER LOGO SVG DISINI (renderWalletIcon) */}
            <p className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 shadow-sm">
                {renderWalletIcon(w.icon)}
              </span>
              {w.wallet_name}
            </p>
            <p
              className={`${spaceGrotesk.className} font-bold text-xl text-slate-900 dark:text-white tracking-tight`}
            >
              {" "}
              <FormattedMoney amount={w.balance} />{" "}
            </p>{" "}
          </div>
        ))}{" "}
      </div>

      <AiAdvisor
        income={monthlyStats.income}
        expense={monthlyStats.expense}
        balance={balance}
        topCategory={topExpenseCategory}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors duration-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {" "}
            Income (Month){" "}
          </p>
          <p
            className={`${spaceGrotesk.className} text-2xl font-bold text-emerald-500`}
          >
            {" "}
            <FormattedMoney amount={monthlyStats.income} showSign={true} />{" "}
          </p>{" "}
        </div>
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors duration-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {" "}
            Expense (Month){" "}
          </p>
          <p
            className={`${spaceGrotesk.className} text-2xl font-bold text-rose-500`}
          >
            {" "}
            <FormattedMoney
              amount={monthlyStats.expense * -1}
              showSign={true}
            />{" "}
          </p>{" "}
        </div>
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors duration-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {" "}
            Cashflow{" "}
          </p>
          <p
            className={`${spaceGrotesk.className} text-2xl font-bold ${monthlyStats.net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500"}`}
          >
            {" "}
            <FormattedMoney amount={monthlyStats.net} />{" "}
          </p>{" "}
        </div>{" "}
      </div>

      {/* GOALS & CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm h-80 flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            {" "}
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
              {" "}
              Future Goals{" "}
            </h3>
            <Link
              href="/dashboard/goals"
              className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              {" "}
              Detail →{" "}
            </Link>{" "}
          </div>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {goals.length > 0 ? (
              goals.map((g) => {
                const progress = Math.min(
                  (balance / g.target_amount) * 100,
                  100,
                ).toFixed(0);
                return (
                  <div key={g.id} className="space-y-3">
                    {" "}
                    <div className="flex justify-between items-end">
                      {" "}
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase truncate max-w-[150px]">
                        {" "}
                        {g.goal_name}{" "}
                      </p>{" "}
                      <p
                        className={`${spaceGrotesk.className} font-bold text-blue-600 dark:text-blue-400 text-sm`}
                      >
                        {" "}
                        {progress}%{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                      {" "}
                      <div
                        className="h-full bg-blue-600 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>{" "}
                    </div>{" "}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-500 font-bold text-[10px] uppercase mt-10">
                {" "}
                No goals yet.{" "}
              </p>
            )}{" "}
          </div>{" "}
        </div>
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm h-80 flex flex-col transition-colors duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6 text-center w-full">
            {" "}
            Cashflow Chart{" "}
          </h3>
          <div className="h-full w-full">
            {" "}
            <ResponsiveContainer width="100%" height="100%">
              {" "}
              <BarChart
                data={[
                  { name: "In", t: monthlyStats.income, c: "#10b981" },
                  { name: "Out", t: monthlyStats.expense, c: "#f43f5e" },
                ]}
              >
                {" "}
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#64748b" }}
                />{" "}
                <Tooltip
                  content={<CustomChartTooltip />}
                  cursor={{ fill: "transparent" }}
                />{" "}
                <Bar dataKey="t" radius={[6, 6, 6, 6]} barSize={45}>
                  {" "}
                  {[{ c: "#10b981" }, { c: "#f43f5e" }].map((e, i) => (
                    <Cell key={i} fill={e.c} />
                  ))}{" "}
                </Bar>{" "}
              </BarChart>{" "}
            </ResponsiveContainer>{" "}
          </div>{" "}
        </div>{" "}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors duration-300">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-8">
          {" "}
          Recent Activity{" "}
        </h3>
        <div className="space-y-4">
          {" "}
          {transactions.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-50 dark:border-slate-800/50 transition-colors"
            >
              {" "}
              <div className="flex items-center gap-5">
                {" "}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:border dark:border-rose-500/20"}`}
                >
                  {" "}
                  {t.type === "income" ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  ) : (
                    CATEGORIES.find((c) => c.name === t.category)?.icon || (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19V5" />
                        <path d="m5 12 7-7 7 7" />
                      </svg>
                    )
                  )}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {" "}
                    {t.description}{" "}
                  </p>{" "}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                    {" "}
                    {t.category}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <p
                className={`${spaceGrotesk.className} font-bold text-sm ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
              >
                {" "}
                <FormattedMoney
                  amount={t.type === "income" ? t.amount : t.amount * -1}
                  showSign={true}
                />{" "}
              </p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>

      {/* MODAL TRANSAKSI */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/50 w-full max-w-md p-8 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors relative">
            <h3
              className={`${spaceGrotesk.className} text-xl font-bold mb-4 dark:text-white text-slate-900 uppercase`}
            >
              {" "}
              Add Transaction{" "}
            </h3>
            {/* MAGIC BOX */}
            <div className="mb-5 p-[1px] rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-blue-900/20">
              <div className="bg-white dark:bg-[#060b1a] rounded-[1.4rem] p-4 flex flex-col gap-4 transition-colors">
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    {" "}
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
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.29 1.29L3 12l5.8 1.9a2 2 0 0 1 1.29 1.29L12 21l1.9-5.8a2 2 0 0 1 1.29-1.29L21 12l-5.8-1.9a2 2 0 0 1-1.29-1.29L12 3Z" />
                    </svg>{" "}
                    AI Magic Input{" "}
                  </span>{" "}
                  <div className="flex gap-2">
                    {" "}
                    <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 transition-colors">
                      {" "}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>{" "}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />{" "}
                    </label>{" "}
                    <button
                      type="button"
                      onClick={startListening}
                      className={`p-2.5 rounded-xl transition-all ${isListening ? "bg-rose-500/10 text-rose-500 animate-pulse border border-rose-500/20" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                    >
                      {" "}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
                <div className="flex gap-2">
                  {" "}
                  <input
                    type="text"
                    placeholder="E.g: Kopi Starbucks 45rb"
                    className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 px-4 py-3 rounded-2xl text-xs font-bold dark:text-white outline-none transition-colors"
                    value={magicText}
                    onChange={(e) => setMagicText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleMagicProcess())
                    }
                  />{" "}
                  <button
                    type="button"
                    onClick={() => handleMagicProcess()}
                    disabled={isMagicLoading}
                    className="bg-slate-900 dark:bg-blue-600 text-white px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
                  >
                    {" "}
                    {isMagicLoading ? "..." : "Gas"}{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl transition-colors">
                {" "}
                <button
                  type="button"
                  onClick={() => setTransactionType("expense")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${transactionType === "expense" ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-500"}`}
                >
                  {" "}
                  Expense{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={() => setTransactionType("income")}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${transactionType === "income" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-500"}`}
                >
                  {" "}
                  Income{" "}
                </button>{" "}
              </div>
              <div>
                {" "}
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors">
                  {" "}
                  Source Wallet{" "}
                </label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {" "}
                      {w.icon} {w.wallet_name} (Rp{" "}
                      {w.balance.toLocaleString("id-ID")}){" "}
                    </option>
                  ))}
                </select>{" "}
              </div>
              <input
                required
                type="text"
                placeholder="Description"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={transactionName}
                onChange={(e) => setTransactionName(e.target.value)}
              />
              <input
                required
                type="number"
                placeholder="Amount (Rp)"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold dark:text-white outline-none transition-colors"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
              {transactionType === "expense" && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {" "}
                  {CATEGORIES.filter((c) => c.name !== "Income").map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedCategory(c.name)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${selectedCategory === c.name ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20" : "bg-white dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      {" "}
                      <span
                        className={
                          selectedCategory === c.name
                            ? "text-white"
                            : "text-slate-400"
                        }
                      >
                        {" "}
                        {c.icon}{" "}
                      </span>{" "}
                      {c.name}{" "}
                    </button>
                  ))}{" "}
                </div>
              )}
              <div className="flex gap-4 pt-4">
                {" "}
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                  {" "}
                  {loading ? "Saving..." : "Save Record"}{" "}
                </button>{" "}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
