"use client";
import Link from "next/link";

const LAST_UPDATED = "29 Maret 2026";

const SECTIONS = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    content: `Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan Layanan kami:

• Data Akun: Nama lengkap, alamat email, dan foto profil yang Anda berikan saat mendaftar.
• Data Keuangan: Informasi saldo, transaksi, dan aset yang Anda input secara manual atau melalui koneksi akun.
• Data Penggunaan: Informasi tentang bagaimana Anda menggunakan platform, termasuk fitur yang diakses dan preferensi tampilan.
• Data Teknis: Alamat IP, jenis browser, sistem operasi, dan data log akses untuk keperluan keamanan dan debugging.`,
  },
  {
    title: "2. Cara Kami Menggunakan Data Anda",
    content: `Data yang kami kumpulkan digunakan untuk:

• Menyediakan, mengoperasikan, dan meningkatkan Layanan Fyntra.
• Menghasilkan insight dan rekomendasi keuangan personal menggunakan AI.
• Mengirimkan notifikasi penting terkait akun dan keamanan Anda.
• Mendeteksi dan mencegah aktivitas fraudulent atau tidak sah.
• Memenuhi kewajiban hukum dan regulasi yang berlaku.
• Menganalisis tren penggunaan secara agregat dan anonim untuk pengembangan produk.

Kami TIDAK akan pernah menjual data pribadi Anda kepada pihak ketiga untuk keperluan pemasaran.`,
  },
  {
    title: "3. Keamanan Data",
    content: `Keamanan data Anda adalah prioritas utama kami. Langkah-langkah keamanan yang kami terapkan:

• Enkripsi AES-256 untuk data yang tersimpan (data at rest).
• Enkripsi TLS 1.3 untuk data dalam transmisi (data in transit).
• Infrastruktur database yang dikelola oleh Supabase dengan standar keamanan enterprise.
• Koneksi ke akun bank bersifat read-only — kami tidak dapat melakukan transaksi.
• Audit keamanan berkala dan pemantauan ancaman 24/7.
• Autentikasi dua faktor (2FA) tersedia untuk semua akun.`,
  },
  {
    title: "4. Berbagi Data dengan Pihak Ketiga",
    content: `Kami dapat berbagi data Anda hanya dalam kondisi berikut:

• Penyedia Layanan: Mitra teknologi seperti Supabase (database), Google (AI/Gemini), dan penyedia infrastruktur cloud yang membantu kami mengoperasikan Layanan. Semua mitra terikat perjanjian kerahasiaan data.
• Kewajiban Hukum: Jika diwajibkan oleh hukum, peraturan, atau perintah pengadilan yang sah.
• Perlindungan Hak: Untuk melindungi hak, properti, atau keselamatan Fyntra, pengguna kami, atau publik.
• Persetujuan Eksplisit: Dalam situasi lain hanya dengan persetujuan eksplisit Anda.`,
  },
  {
    title: "5. Penyimpanan & Retensi Data",
    content: `Data akun dan keuangan Anda disimpan selama akun Anda aktif. Setelah penghapusan akun, data akan dihapus permanen dari sistem kami dalam 30 hari, kecuali data yang wajib kami simpan berdasarkan hukum yang berlaku (maksimal 5 tahun untuk data transaksi sesuai regulasi keuangan Indonesia). Data log teknis disimpan selama maksimal 90 hari.`,
  },
  {
    title: "6. Hak-Hak Anda",
    content: `Sesuai regulasi perlindungan data yang berlaku, Anda memiliki hak:

• Akses: Meminta salinan data pribadi yang kami simpan tentang Anda.
• Koreksi: Memperbarui atau memperbaiki data yang tidak akurat.
• Penghapusan: Meminta penghapusan data pribadi Anda ("right to be forgotten").
• Portabilitas: Mengekspor data Anda dalam format yang dapat dibaca mesin.
• Keberatan: Menolak pemrosesan data untuk tujuan tertentu.
• Penarikan Persetujuan: Mencabut persetujuan yang sebelumnya diberikan kapan saja.

Untuk menggunakan hak-hak ini, hubungi kami di privacy@faizax.com.`,
  },
  {
    title: "7. Cookie & Teknologi Pelacakan",
    content: `Fyntra menggunakan cookie esensial untuk fungsi autentikasi dan keamanan sesi. Kami tidak menggunakan cookie iklan atau pelacakan lintas situs. Cookie analitik digunakan secara anonim untuk memahami penggunaan platform. Anda dapat mengatur preferensi cookie melalui pengaturan browser Anda, namun beberapa cookie esensial diperlukan agar Layanan berfungsi dengan baik.`,
  },
  {
    title: "8. Privasi Anak",
    content: `Layanan Fyntra tidak ditujukan untuk pengguna di bawah usia 17 tahun. Kami tidak secara sengaja mengumpulkan data pribadi dari anak-anak. Jika Anda mengetahui bahwa seorang anak telah memberikan data pribadi kepada kami tanpa persetujuan orang tua, harap hubungi kami segera dan kami akan mengambil tindakan untuk menghapus data tersebut.`,
  },
  {
    title: "9. Transfer Data Internasional",
    content: `Data Anda dapat diproses di server yang berlokasi di luar Indonesia, termasuk di Amerika Serikat dan Singapura, melalui layanan infrastruktur pihak ketiga yang kami gunakan. Transfer ini dilakukan dengan perlindungan yang memadai sesuai standar internasional, termasuk Standar Contractual Clauses (SCCs) yang relevan.`,
  },
  {
    title: "10. Perubahan Kebijakan Privasi",
    content: `Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi dalam aplikasi minimal 14 hari sebelum berlaku. Tanggal "Terakhir Diperbarui" di bagian atas halaman ini akan selalu mencerminkan versi terbaru.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/50 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="font-space-grotesk text-lg font-bold tracking-tight uppercase">
            FYNTRA<span className="text-blue-500">.</span>
          </Link>
          <Link href="/" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
            ← Back
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">Legal</p>
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm">
            Terakhir diperbarui: <span className="text-slate-400 font-medium">{LAST_UPDATED}</span>
          </p>
          <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <p className="text-emerald-300 text-sm leading-relaxed">
              Di Fyntra, privasi Anda adalah prioritas kami. Kami berkomitmen untuk melindungi data pribadi Anda dan transparan tentang cara kami menggunakannya.
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: "🔒", title: "Tidak Dijual", desc: "Data Anda tidak pernah dijual ke pihak ketiga" },
            { icon: "🛡️", title: "Enkripsi AES-256", desc: "Semua data dienkripsi standar bank" },
            { icon: "✋", title: "Kendali Penuh", desc: "Hapus akun & data kapan saja" },
          ].map((item) => (
            <div key={item.title} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-bold text-white text-sm mb-1">{item.title}</p>
              <p className="text-slate-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border-b border-slate-800/50 pb-8">
              <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-14 p-8 bg-slate-900/40 border border-slate-800/50 rounded-3xl">
          <h3 className="font-space-grotesk font-bold text-white mb-2">Hubungi Tim Privasi Kami</h3>
          <p className="text-slate-400 text-sm mb-4">
            Untuk pertanyaan, permintaan akses data, atau laporan pelanggaran privasi:
          </p>
          <p className="text-blue-400 text-sm font-bold">privacy@faizax.com</p>
        </div>

        {/* Footer Links */}
        <div className="mt-10 flex gap-6 text-[11px] text-slate-600">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-slate-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
