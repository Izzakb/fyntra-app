"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Palette Warna Sultan untuk Cashflow
const EXPENSE_COLORS = [
  "#ef4444", // Rose
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#64748b", // Slate
  "#3b82f6", // Blue
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// 💡 KOMPONEN FORMAT UANG ELITE (Desimal Dinamis)
const FormattedMoney = ({
  amount,
  prefix = "Rp ",
  showSign = false,
  className = "",
}: {
  amount: number;
  prefix?: string;
  showSign?: boolean;
  className?: string;
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
    <span className={className}>
      {sign} {prefix}
      {integerPart}
      {decimalPart && (
        <span className="text-[0.6em] opacity-60 ml-[1px]">,{decimalPart}</span>
      )}
    </span>
  );
};

// 💡 CUSTOM TOOLTIP SULTAN UNTUK CHART
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/90 dark:bg-[#060b1a]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-5 rounded-3xl shadow-2xl shadow-blue-900/10 transition-all">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-inner"
            style={{ backgroundColor: data.payload.color || data.fill }}
          ></span>
          {data.name}
        </p>
        <p
          className={`font-space-grotesk text-xl font-bold text-slate-900 dark:text-white tracking-tight`}
        >
          <FormattedMoney amount={data.value} />
        </p>
      </div>
    );
  }
  return null;
};

// FUNGSI BANTUAN UNTUK MEMECAH ANGKA DI DALAM SVG TENGAH CHART
const formatNumberForSvg = (num: number) => {
  const parts = Math.abs(num || 0)
    .toLocaleString("id-ID", { maximumFractionDigits: 3 })
    .split(",");
  return { int: parts[0], dec: parts[1] };
};

export default function AnalyticsPage() {
  const { balance, assets, netWorth } = useFyntra();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth());

  const fetchTransactions = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("fyntra_transactions")
      .select(`*, fyntra_wallets(wallet_name)`)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- DATA PROCESSING: WEALTH ALLOCATION ---
  const wealthData = useMemo(() => {
    const dataMap: Record<string, { value: number; color: string }> = {
      "Liquid Cash": { value: balance, color: "#3b82f6" },
    };

    assets.forEach((a) => {
      const type = a.asset_type;
      const value = Number(a.quantity) * Number(a.current_price);

      if (!dataMap[type]) {
        let color = "#64748b";
        if (
          type.toLowerCase().includes("saham") ||
          type.toLowerCase().includes("stock")
        )
          color = "#10b981";
        else if (type.toLowerCase().includes("crypto")) color = "#8b5cf6";
        else if (
          type.toLowerCase().includes("emas") ||
          type.toLowerCase().includes("gold")
        )
          color = "#f59e0b";
        else if (
          type.toLowerCase().includes("reksadana") ||
          type.toLowerCase().includes("mutual")
        )
          color = "#14b8a6";

        dataMap[type] = { value: 0, color };
      }
      dataMap[type].value += value;
    });

    return Object.keys(dataMap)
      .map((key) => ({
        name: key,
        value: dataMap[key].value,
        color: dataMap[key].color,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [balance, assets]);

  const netWorthParts = formatNumberForSvg(netWorth);

  // --- DATA PROCESSING: EXPENSE DISTRIBUTION ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) => new Date(t.created_at).getMonth() === monthFilter,
    );
  }, [transactions, monthFilter]);

  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === "expense");
    const grouped = expenses.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});
    return Object.keys(grouped)
      .map((key) => ({ name: key, value: grouped[key] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);
  const totalExpenseParts = formatNumberForSvg(totalExpense);

  // --- EXPORT FUNCTIONS ---
  const exportToExcel = () => {
    if (filteredTransactions.length === 0)
      return toast.error("No data available");
    const excelData = filteredTransactions.map((t) => ({
      Date: new Date(t.created_at).toLocaleDateString("en-GB"),
      Category: t.category,
      Description: t.description,
      Type: t.type === "income" ? "Income" : "Expense",
      Amount: t.amount,
      Wallet: t.fyntra_wallets?.wallet_name || "Main Wallet",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    XLSX.writeFile(workbook, `Fyntra_Report_Month_${monthFilter + 1}.xlsx`);
    toast.success("Excel Downloaded Successfully!");
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0)
      return toast.error("No data available");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FYNTRA ECOSYSTEM - FINANCIAL REPORT", 14, 22);
    const tableColumn = [
      "Date",
      "Category",
      "Description",
      "Type",
      "Amount (Rp)",
      "Wallet",
    ];
    const tableRows = filteredTransactions.map((t) => [
      new Date(t.created_at).toLocaleDateString("en-GB"),
      t.category,
      t.description,
      t.type === "income" ? "Income" : "Expense",
      t.amount.toLocaleString("id-ID"),
      t.fyntra_wallets?.wallet_name || "Main Wallet",
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: "grid",
      headStyles: { fillColor: [2, 6, 23] }, // Matches #020617
    });
    doc.save(`Fyntra_Report_Month_${monthFilter + 1}.pdf`);
    toast.success("PDF Downloaded Successfully!");
  };

  return (
    <div
      className={`animate-in fade-in duration-700 pb-20 bg-transparent transition-all space-y-12`}
    >
      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div>
          <h2
            className={`font-space-grotesk text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase transition-colors duration-300`}
          >
            Analytics & Reports
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 transition-colors duration-300">
            Net Worth & Cashflow Mapping
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            className="px-6 py-4 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-800 dark:text-white shadow-sm outline-none cursor-pointer transition-all duration-300"
            value={monthFilter}
            onChange={(e) => setMonthFilter(Number(e.target.value))}
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <button
            onClick={exportToExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
              <path d="M8 9h2" />
            </svg>
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* ============================================== */}
      {/* ZONA 1: WEALTH ALLOCATION (GLASSMORPHISM)      */}
      {/* ============================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* THE DONUT */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center items-center min-h-[420px] relative overflow-hidden transition-all duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2 w-full text-left relative z-10">
            Wealth Allocation
          </h3>
          <p className="text-xs text-slate-900 dark:text-white font-bold uppercase tracking-widest w-full text-left mb-8 relative z-10">
            Asset Distribution Overview
          </p>

          <div className="w-full h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {wealthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />

                {/* Teks Net Worth di tengah dengan desimal kecil pakai SVG tspan */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                >
                  <tspan
                    x="50%"
                    dy="-12"
                    fontSize="10"
                    fill="#64748b"
                    fontWeight="700"
                    letterSpacing="0.2em"
                  >
                    NET WORTH
                  </tspan>
                  <tspan
                    x="50%"
                    dy="26"
                    fontSize="24"
                    fill="currentColor"
                    className="dark:fill-white fill-slate-900"
                    fontWeight="900"
                    fontFamily="Space Grotesk"
                  >
                    Rp {netWorthParts.int}
                  </tspan>
                  {netWorthParts.dec && (
                    <tspan
                      fontSize="14"
                      fill="currentColor"
                      className="dark:fill-white fill-slate-900"
                      opacity="0.6"
                      fontWeight="900"
                      fontFamily="Space Grotesk"
                    >
                      ,{netWorthParts.dec}
                    </tspan>
                  )}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>
        </div>

        {/* THE CARDS */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800/50 transition-all duration-300 flex flex-col min-h-[420px] max-h-[420px]">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-8">
            Asset Breakdown
          </h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {wealthData.length > 0 ? (
              wealthData.map((item, idx) => {
                const percentage =
                  netWorth > 0
                    ? ((item.value / netWorth) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={item.name}
                    className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <p className="font-bold text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          {item.name}
                        </p>
                      </div>
                      <p className="font-bold text-[10px] text-slate-400">
                        {percentage}%
                      </p>
                    </div>
                    <p
                      className={`font-space-grotesk font-bold text-sm text-slate-900 dark:text-white pl-6`}
                    >
                      <FormattedMoney amount={item.value} />
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center mt-10">
                No Assets Found
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800/50 rounded-full"></div>

      {/* ============================================== */}
      {/* ZONA 2: EXPENSE ANALYTICS                      */}
      {/* ============================================== */}
      {loading ? (
        <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl rounded-[3rem] border border-slate-100 dark:border-slate-800/50 transition-all">
          Processing Ledgers...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* THE DONUT EXPENSE */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center items-center min-h-[420px] relative transition-all duration-300">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2 w-full text-left transition-colors">
              Cashflow Analytics
            </h3>
            <h2 className="text-xs text-slate-900 dark:text-white font-bold uppercase tracking-widest w-full text-left mb-8 transition-colors">
              Expenses for {MONTHS[monthFilter]}
            </h2>

            {categoryData.length > 0 ? (
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                          className="hover:opacity-80 transition-opacity outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />

                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none"
                    >
                      <tspan
                        x="50%"
                        dy="-12"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="700"
                        letterSpacing="0.2em"
                      >
                        TOTAL EXPENSE
                      </tspan>
                      <tspan
                        x="50%"
                        dy="26"
                        fontSize="24"
                        fill="currentColor"
                        className="dark:fill-white fill-slate-900"
                        fontWeight="900"
                        fontFamily="Space Grotesk"
                      >
                        Rp {totalExpenseParts.int}
                      </tspan>
                      {totalExpenseParts.dec && (
                        <tspan
                          fontSize="14"
                          fill="currentColor"
                          className="dark:fill-white fill-slate-900"
                          opacity="0.6"
                          fontWeight="900"
                          fontFamily="Space Grotesk"
                        >
                          ,{totalExpenseParts.dec}
                        </tspan>
                      )}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No expenses this month.
              </div>
            )}
          </div>

          {/* TOP SPENDING LIST */}
          <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-sm relative overflow-hidden transition-all duration-300 min-h-[420px] max-h-[420px] flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-8 relative z-10">
              Top Spending
            </h3>
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 relative z-10 flex-1">
              {categoryData.length > 0 ? (
                categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                          }}
                        ></span>
                        <p className="font-bold text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                          {cat.name}
                        </p>
                      </div>
                      <p
                        className={`font-space-grotesk font-bold text-sm text-slate-900 dark:text-white`}
                      >
                        <FormattedMoney amount={cat.value} />
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${(cat.value / totalExpense) * 100}%`,
                          backgroundColor:
                            EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center mt-10">
                  No Expense Data
                </p>
              )}
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-100/50 dark:bg-rose-900/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  );
}
