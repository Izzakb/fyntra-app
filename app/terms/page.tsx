"use client";
import Link from "next/link";

const LAST_UPDATED = "29 Maret 2026";

const SECTIONS = [
  {
    title: "1. Penerimaan Syarat",
    content: `Dengan mengakses atau menggunakan platform Fyntra ("Layanan"), Anda menyatakan telah membaca, memahami, dan setuju untuk terikat oleh Syarat Layanan ini. Jika Anda tidak menyetujui syarat-syarat ini, harap tidak menggunakan Layanan kami. Syarat ini berlaku untuk semua pengguna, termasuk pengunjung, pengguna terdaftar, dan pelanggan berbayar.`,
  },
  {
    title: "2. Deskripsi Layanan",
    content: `Fyntra adalah platform manajemen keuangan pribadi berbasis teknologi (fintech) yang menyediakan fitur pelacakan aset, pencatatan transaksi otomatis, analitik keuangan, dan rekomendasi berbasis kecerdasan buatan (AI). Fyntra bukan merupakan bank, lembaga keuangan berlisensi, penasihat investasi, atau broker efek. Kami tidak menerima simpanan, tidak memberikan kredit, dan tidak menjamin hasil investasi apapun.`,
  },
  {
    title: "3. Akun Pengguna",
    content: `Anda bertanggung jawab penuh atas keamanan akun Anda, termasuk menjaga kerahasiaan kata sandi. Anda wajib memberikan informasi yang akurat dan lengkap saat mendaftar. Anda dilarang membagikan akun kepada pihak lain. Fyntra berhak menangguhkan atau menghapus akun yang melanggar syarat ini tanpa pemberitahuan sebelumnya. Anda harus segera memberitahu kami jika mendeteksi akses tidak sah ke akun Anda.`,
  },
  {
    title: "4. Penggunaan yang Diizinkan",
    content: `Anda setuju untuk menggunakan Layanan hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku. Dilarang keras: (a) menggunakan Layanan untuk aktivitas ilegal atau penipuan; (b) mencoba mengakses sistem kami secara tidak sah; (c) menyebarkan malware atau kode berbahaya; (d) melakukan reverse engineering terhadap platform kami; (e) mengumpulkan data pengguna lain tanpa izin.`,
  },
  {
    title: "5. Data Keuangan & Koneksi Akun",
    content: `Fyntra dapat terhubung ke akun bank dan dompet digital Anda melalui API pihak ketiga yang aman. Koneksi ini bersifat read-only — kami tidak dapat melakukan transaksi atas nama Anda. Data keuangan Anda dienkripsi menggunakan standar AES-256 dan disimpan secara aman di infrastruktur Supabase. Anda dapat mencabut akses kapan saja melalui pengaturan akun.`,
  },
  {
    title: "6. Fitur AI & Saran Keuangan",
    content: `Rekomendasi dan insight yang dihasilkan oleh fitur AI Fyntra bersifat informatif dan edukatif semata. Konten tersebut BUKAN merupakan saran keuangan, investasi, hukum, atau pajak profesional. Selalu konsultasikan keputusan keuangan penting Anda dengan profesional berlisensi. Fyntra tidak bertanggung jawab atas kerugian finansial yang timbul dari tindakan berdasarkan output AI kami.`,
  },
  {
    title: "7. Biaya & Pembayaran",
    content: `Paket Basic tersedia gratis. Paket Wealth Pro dan Family Office dikenakan biaya berlangganan bulanan sesuai harga yang tercantum. Pembayaran diproses melalui penyedia pembayaran pihak ketiga yang aman. Biaya berlangganan tidak dapat dikembalikan kecuali diwajibkan oleh hukum yang berlaku. Kami berhak mengubah harga dengan pemberitahuan 30 hari sebelumnya.`,
  },
  {
    title: "8. Kekayaan Intelektual",
    content: `Seluruh konten, desain, logo, merek dagang, dan kode sumber Fyntra adalah milik eksklusif Faizax Ecosystem. Anda diberikan lisensi terbatas dan tidak eksklusif untuk menggunakan Layanan sesuai syarat ini. Dilarang menyalin, mendistribusikan, atau membuat karya turunan dari platform kami tanpa izin tertulis.`,
  },
  {
    title: "9. Penghentian Layanan",
    content: `Kami berhak menghentikan atau menangguhkan akses Anda ke Layanan kapan saja, dengan atau tanpa sebab, dengan atau tanpa pemberitahuan. Anda dapat menghapus akun Anda kapan saja melalui halaman Pengaturan. Setelah penghapusan akun, data Anda akan dihapus permanen dari sistem kami dalam 30 hari.`,
  },
  {
    title: "10. Batasan Tanggung Jawab",
    content: `Sejauh diizinkan hukum yang berlaku, Fyntra dan Faizax Ecosystem tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan. Total tanggung jawab kami kepada Anda tidak akan melebihi jumlah yang Anda bayarkan kepada kami dalam 12 bulan terakhir.`,
  },
  {
    title: "11. Perubahan Syarat",
    content: `Kami dapat memperbarui Syarat Layanan ini sewaktu-waktu. Perubahan material akan diberitahukan melalui email atau notifikasi dalam aplikasi minimal 14 hari sebelum berlaku. Penggunaan Layanan yang berkelanjutan setelah perubahan berlaku dianggap sebagai penerimaan syarat yang diperbarui.`,
  },
  {
    title: "12. Hukum yang Berlaku",
    content: `Syarat ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui musyawarah mufakat. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri Jakarta Selatan.`,
  },
];

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm">
            Terakhir diperbarui: <span className="text-slate-400 font-medium">{LAST_UPDATED}</span>
          </p>
          <div className="mt-6 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <p className="text-blue-300 text-sm leading-relaxed">
              Harap baca syarat ini dengan seksama sebelum menggunakan Fyntra. Dengan menggunakan layanan kami, Anda menyetujui syarat-syarat di bawah ini.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border-b border-slate-800/50 pb-8">
              <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-14 p-8 bg-slate-900/40 border border-slate-800/50 rounded-3xl">
          <h3 className="font-space-grotesk font-bold text-white mb-2">Ada pertanyaan?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Hubungi tim legal kami jika ada pertanyaan terkait Syarat Layanan ini.
          </p>
          <p className="text-blue-400 text-sm font-bold">legal@faizax.com</p>
        </div>

        {/* Footer Links */}
        <div className="mt-10 flex gap-6 text-[11px] text-slate-600">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-slate-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
