"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useFyntra } from "@/context/FyntraContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Palette Warna Sultan untuk Cashflow
const EXPENSE_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#3b82f6",
];

export default function AnalyticsPage() {
  // 1. Tarik Data Kekayaan dari Context
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

  // --- DATA PROCESSING: WEALTH ALLOCATION (NEW) ---
  const wealthData = useMemo(() => {
    // Kategori Default: Cash
    const dataMap: Record<string, { value: number; color: string }> = {
      "Liquid Cash": { value: balance, color: "#3b82f6" }, // Biru BCA
    };

    // Mapping Asset & Warna
    assets.forEach((a) => {
      const type = a.asset_type;
      const value = Number(a.quantity) * Number(a.current_price);

      if (!dataMap[type]) {
        let color = "#64748b"; // Default Slate
        if (type.toLowerCase().includes("saham"))
          color = "#10b981"; // Emerald
        else if (type.toLowerCase().includes("crypto"))
          color = "#8b5cf6"; // Purple
        else if (type.toLowerCase().includes("emas"))
          color = "#f59e0b"; // Gold
        else if (type.toLowerCase().includes("reksadana")) color = "#14b8a6"; // Teal

        dataMap[type] = { value: 0, color };
      }
      dataMap[type].value += value;
    });

    // Convert ke Array & Sort dari yang terbesar (Kecuali yang nol)
    return Object.keys(dataMap)
      .map((key) => ({
        name: key,
        value: dataMap[key].value,
        color: dataMap[key].color,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [balance, assets]);

  // --- DATA PROCESSING: EXPENSE DISTRIBUTION (EXISTING) ---
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

  // --- EXPORT FUNCTIONS ---
  const exportToExcel = () => {
    if (filteredTransactions.length === 0) return toast.error("Data kosong");
    const excelData = filteredTransactions.map((t) => ({
      Tanggal: new Date(t.created_at).toLocaleDateString("id-ID"),
      Kategori: t.category,
      Deskripsi: t.description,
      Tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",
      Nominal: t.amount,
      Dompet: t.fyntra_wallets?.wallet_name || "Dompet Utama",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
    XLSX.writeFile(workbook, `Fyntra_Report_Bulan_${monthFilter + 1}.xlsx`);
    toast.success("Excel Berhasil Diunduh!");
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) return toast.error("Data kosong");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FYNTRA ECOSYSTEM - FINANCIAL REPORT", 14, 22);
    const tableColumn = [
      "Tanggal",
      "Kategori",
      "Deskripsi",
      "Tipe",
      "Nominal",
      "Dompet",
    ];
    const tableRows = filteredTransactions.map((t) => [
      new Date(t.created_at).toLocaleDateString("id-ID"),
      t.category,
      t.description,
      t.type === "income" ? "Pemasukan" : "Pengeluaran",
      `Rp ${t.amount.toLocaleString("id-ID")}`,
      t.fyntra_wallets?.wallet_name || "Dompet Utama",
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
    });
    doc.save(`Fyntra_Report_Bulan_${monthFilter + 1}.pdf`);
    toast.success("PDF Berhasil Diunduh!");
  };

  const MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Custom Tooltip buat Chart biar elegan
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            {payload[0].name}
          </p>
          <p className="text-lg font-black italic text-white dark:text-slate-900">
            Rp {payload[0].value.toLocaleString("id-ID")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20 bg-transparent transition-all space-y-16">
      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase transition-colors duration-300">
            Analytics & Reports
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 italic transition-colors duration-300">
            Kekayaan Bersih & Arus Kas
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-800 dark:text-white shadow-sm outline-none cursor-pointer transition-all duration-300"
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
            className="flex-1 md:flex-none px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
          >
            📊 Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 md:flex-none px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* ============================================== */}
      {/* ZONA 1: WEALTH ALLOCATION (FITUR BARU SULTAN) */}
      {/* ============================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* THE DONUT (Tugas: Visual Cepat) */}
        <div className="lg:col-span-2 bg-slate-900 dark:bg-slate-900/80 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col justify-center items-center min-h-[400px] relative overflow-hidden transition-all duration-300 group">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2 w-full text-left relative z-10">
            Wealth Allocation
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest w-full text-left mb-8 relative z-10">
            Distribusi Harta Kekayaan
          </p>

          <div className="w-full h-[350px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={3}
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
                {/* Teks Net Worth di tengah Donut (The Sultan Flex) */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                >
                  <tspan
                    x="50%"
                    dy="-10"
                    fontSize="10"
                    fill="#94a3b8"
                    fontWeight="bold"
                    letterSpacing="0.2em"
                  >
                    NET WORTH
                  </tspan>
                  <tspan
                    x="50%"
                    dy="24"
                    fontSize="22"
                    fill="#ffffff"
                    fontWeight="900"
                    fontStyle="italic"
                  >
                    Rp {netWorth.toLocaleString("id-ID")}
                  </tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        </div>

        {/* THE CARDS (Tugas: Angka Pasti) */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 flex flex-col h-full max-h-[500px]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-8 italic">
            Asset Breakdown
          </h3>
          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {wealthData.length > 0 ? (
              wealthData.map((item, idx) => {
                const percentage =
                  netWorth > 0
                    ? ((item.value / netWorth) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={item.name}
                    className="space-y-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full shadow-inner"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <div>
                          <p className="font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="font-black text-xs text-slate-400 dark:text-slate-500">
                            {percentage}%
                          </p>
                        </div>
                      </div>
                      <p className="font-black italic text-sm text-slate-900 dark:text-white">
                        Rp {item.value.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center mt-10">
                Belum ada aset.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 rounded-full my-8"></div>

      {/* ============================================== */}
      {/* ZONA 2: EXPENSE ANALYTICS (EXISTING UPGRADED)  */}
      {/* ============================================== */}
      {loading ? (
        <div className="p-20 text-center font-black text-slate-200 dark:text-slate-800 animate-pulse italic uppercase tracking-widest text-sm bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-all">
          Memproses Arus Kas...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center min-h-[400px] relative transition-all duration-300">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-2 italic w-full text-left transition-colors">
              Cashflow Analytics
            </h3>
            <h2 className="text-xs text-slate-800 dark:text-slate-300 font-bold uppercase tracking-widest w-full text-left mb-8 transition-colors">
              Pengeluaran Bulan {MONTHS[monthFilter]}
            </h2>

            {categoryData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                          className="hover:opacity-80 outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {/* Teks Total Expense di tengah */}
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none"
                    >
                      <tspan
                        x="50%"
                        dy="-10"
                        fontSize="9"
                        fill="#94a3b8"
                        fontWeight="bold"
                        letterSpacing="0.2em"
                      >
                        PENGELUARAN
                      </tspan>
                      <tspan
                        x="50%"
                        dy="20"
                        fontSize="18"
                        fill="currentColor"
                        fontWeight="900"
                        fontStyle="italic"
                        className="dark:fill-white fill-slate-900"
                      >
                        Rp {totalExpense.toLocaleString("id-ID")}
                      </tspan>
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 font-black italic uppercase tracking-widest text-[10px]">
                Tidak ada pengeluaran bulan ini.
              </div>
            )}
          </div>

          <div className="bg-slate-900 dark:bg-slate-900/50 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-transparent dark:border-slate-800 transition-all duration-300 max-h-[500px] flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 italic relative z-10">
              Top Spending
            </h3>
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 relative z-10 flex-1">
              {categoryData.length > 0 ? (
                categoryData.map((cat, idx) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                          }}
                        ></span>
                        <p className="font-black text-xs uppercase tracking-widest">
                          {cat.name}
                        </p>
                      </div>
                      <p className="font-black italic">
                        Rp {cat.value.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Belum ada data pengeluaran.
                </p>
              )}
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-800/50 dark:bg-rose-900/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  );
}
