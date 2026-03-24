"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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

// Warna estetik untuk Pie Chart
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth()); // Default: Bulan Ini

  const fetchTransactions = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("fyntra_transactions")
      .select(`*, fyntra_wallets(wallet_name)`) // Join untuk ambil nama dompet
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transaksi berdasarkan bulan yang dipilih
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) => new Date(t.created_at).getMonth() === monthFilter,
    );
  }, [transactions, monthFilter]);

  // Kelompokkan data khusus PENGELUARAN (Expense) untuk Pie Chart
  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === "expense");
    const grouped = expenses.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

    return Object.keys(grouped)
      .map((key) => ({
        name: key,
        value: grouped[key],
      }))
      .sort((a, b) => b.value - a.value); // Urutkan dari yang terbesar
  }, [filteredTransactions]);

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

  // ================= EXPORT KE EXCEL =================
  const exportToExcel = () => {
    if (filteredTransactions.length === 0)
      return toast.error("Data kosong", {
        description: "Tidak ada transaksi di bulan ini.",
      });

    // Format data agar rapi di Excel
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

  // ================= EXPORT KE PDF =================
  const exportToPDF = () => {
    if (filteredTransactions.length === 0)
      return toast.error("Data kosong", {
        description: "Tidak ada transaksi di bulan ini.",
      });

    const doc = new jsPDF();

    // Header PDF
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FYNTRA ECOSYSTEM - FINANCIAL REPORT", 14, 22);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Periode: Bulan ke-${monthFilter + 1} Tahun ${new Date().getFullYear()}`,
      14,
      30,
    );
    doc.text(
      `Total Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")}`,
      14,
      36,
    );

    // Format Table
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
      headStyles: { fillColor: [15, 23, 42] }, // Slate-900 (Faizax style)
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

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {/* HEADER & EXPORT BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            Analytics & Reports
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
            Analisis Pengeluaran & Ekspor Data
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-800 shadow-sm outline-none cursor-pointer"
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
            className="flex-1 md:flex-none px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            📊 Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 md:flex-none px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black text-slate-200 animate-pulse italic uppercase tracking-widest text-sm bg-white rounded-[3rem] border border-slate-100">
          Memproses Data Laporan...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BAGIAN PIE CHART */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center min-h-[400px] relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2 italic w-full text-left">
              Distribusi Pengeluaran
            </h3>
            <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter w-full text-left mb-8">
              Rp {totalExpense.toLocaleString("id-ID")}
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
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) =>
                        `Rp ${Number(value).toLocaleString("id-ID")}`
                      }
                      contentStyle={{
                        borderRadius: "1rem",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-300 font-black italic uppercase tracking-widest text-[10px]">
                Tidak ada pengeluaran di bulan ini.
              </div>
            )}
          </div>

          {/* BAGIAN DETAIL KATEGORI (TOP SPENDING) */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 italic">
                Top Spending
              </h3>
              <div className="space-y-6">
                {categoryData.length > 0 ? (
                  categoryData.map((cat, idx) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
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
                      {/* Progress bar per kategori */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(cat.value / totalExpense) * 100}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    Belum ada data.
                  </p>
                )}
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-800/50 rounded-full blur-3xl z-0 pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  );
}
