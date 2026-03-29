"use client";
import Link from "next/link";

const LAST_UPDATED = "29 Maret 2026";

export default function RefundPage() {
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
            Kebijakan Pengembalian Dana
          </h1>
          <p className="text-slate-500 text-sm">
            Terakhir diperbarui: <span className="text-slate-400 font-medium">{LAST_UPDATED}</span>
          </p>
          <div className="mt-6 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <p className="text-blue-300 text-sm leading-relaxed">
              Fyntra berkomitmen untuk memberikan layanan terbaik. Kebijakan ini menjelaskan ketentuan pengembalian dana (refund) untuk langganan Fyntra Pro.
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: "7️⃣", title: "7 Hari Garansi", desc: "Refund penuh dalam 7 hari pertama" },
            { icon: "⚡", title: "Proses Cepat", desc: "Dana kembali dalam 3-7 hari kerja" },
            { icon: "📞", title: "Mudah Dihubungi", desc: "Hubungi kami via WhatsApp atau email" },
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

          <div className="border-b border-slate-800/50 pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              1. Paket yang Dapat Direfund
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Kebijakan pengembalian dana ini berlaku untuk langganan <strong className="text-white">Fyntra Pro</strong> (Rp 19.000/bulan) yang dibeli melalui platform Fyntra menggunakan metode pembayaran yang didukung oleh Midtrans. Paket Starter (Gratis) tidak dikenakan biaya sehingga tidak memerlukan proses refund.
            </p>
          </div>

          <div className="border-b border-slate-800/50 pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              2. Syarat Pengembalian Dana
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Pengembalian dana dapat diajukan apabila memenuhi salah satu kondisi berikut:
            </p>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-3">
                <span className="text-blue-400 flex-shrink-0">✓</span>
                <span><strong className="text-white">Garansi 7 Hari:</strong> Permintaan refund diajukan dalam 7 hari kalender sejak tanggal pembayaran pertama berhasil diproses.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 flex-shrink-0">✓</span>
                <span><strong className="text-white">Gangguan Layanan:</strong> Terjadi gangguan teknis pada platform Fyntra yang berlangsung lebih dari 72 jam berturut-turut dan terdokumentasi oleh tim kami.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 flex-shrink-0">✓</span>
                <span><strong className="text-white">Pembayaran Ganda:</strong> Terjadi duplikasi pembayaran pada periode yang sama akibat kesalahan sistem.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 flex-shrink-0">✓</span>
                <span><strong className="text-white">Penipuan / Transaksi Tidak Sah:</strong> Terbukti adanya transaksi tidak sah yang dilakukan tanpa persetujuan pemilik akun.</span>
              </li>
            </ul>
          </div>

          <div className="border-b border-slate-800/50 pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              3. Kondisi yang Tidak Dapat Direfund
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Pengembalian dana tidak dapat diproses dalam kondisi berikut:
            </p>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-3">
                <span className="text-rose-400 flex-shrink-0">×</span>
                <span>Permintaan diajukan lebih dari 7 hari setelah tanggal pembayaran.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-400 flex-shrink-0">×</span>
                <span>Akun telah menggunakan fitur-fitur premium secara aktif selama periode berlangganan.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-400 flex-shrink-0">×</span>
                <span>Pelanggaran Syarat & Ketentuan yang mengakibatkan penangguhan akun oleh Fyntra.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-400 flex-shrink-0">×</span>
                <span>Perubahan keputusan pribadi setelah lebih dari 7 hari masa berlangganan berjalan.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-400 flex-shrink-0">×</span>
                <span>Biaya transaksi pihak ketiga (biaya admin bank, biaya payment gateway) yang tidak dapat dikembalikan oleh penyedia layanan.</span>
              </li>
            </ul>
          </div>

          <div className="border-b border-slate-800/50 pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              4. Cara Mengajukan Refund
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Untuk mengajukan pengembalian dana, ikuti langkah-langkah berikut:
            </p>
            <ol className="space-y-4 text-slate-400 text-sm">
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold flex-shrink-0">1.</span>
                <span>Hubungi tim support Fyntra melalui WhatsApp <a href="https://wa.me/6282117132290" className="text-blue-400 hover:text-blue-300">+62 821-1713-2290</a> atau email <a href="mailto:faizax.app@gmail.com" className="text-blue-400 hover:text-blue-300">faizax.app@gmail.com</a>.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold flex-shrink-0">2.</span>
                <span>Sertakan: alamat email akun, tanggal transaksi, nomor transaksi/order ID dari Midtrans, dan alasan pengajuan refund.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold flex-shrink-0">3.</span>
                <span>Tim kami akan memverifikasi permintaan dalam <strong className="text-white">1x24 jam kerja</strong> dan memberikan konfirmasi persetujuan atau penolakan.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold flex-shrink-0">4.</span>
                <span>Jika disetujui, dana akan dikembalikan ke metode pembayaran asal dalam <strong className="text-white">3–7 hari kerja</strong> (tergantung kebijakan bank/penyedia e-wallet).</span>
              </li>
            </ol>
          </div>

          <div className="border-b border-slate-800/50 pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              5. Metode Pengembalian Dana
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dana dikembalikan ke metode pembayaran yang sama dengan saat transaksi dilakukan. Untuk pembayaran via Virtual Account atau QRIS, dana akan dikembalikan ke rekening bank yang terdaftar. Untuk e-wallet (GoPay, ShopeePay), dana dikembalikan ke saldo e-wallet terkait. Fyntra tidak dapat mengalihkan pengembalian dana ke metode pembayaran yang berbeda dari transaksi asal.
            </p>
          </div>

          <div className="border-b border-slate-800/50 pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              6. Pembatalan Langganan
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Anda dapat membatalkan langganan Fyntra Pro kapan saja melalui halaman Pengaturan {'>'} Langganan. Pembatalan akan berlaku pada akhir periode billing yang sedang berjalan — Anda tetap dapat menikmati fitur Pro hingga tanggal akhir periode tersebut. Pembatalan tidak otomatis menghasilkan refund kecuali memenuhi syarat pada pasal 2 di atas.
            </p>
          </div>

          <div className="pb-8">
            <h2 className="font-space-grotesk text-lg font-bold text-white mb-3">
              7. Perubahan Kebijakan
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fyntra berhak memperbarui Kebijakan Pengembalian Dana ini sewaktu-waktu. Perubahan akan diberitahukan melalui email atau notifikasi dalam aplikasi minimal 7 hari sebelum berlaku. Pengajuan refund yang sudah dalam proses akan mengikuti kebijakan yang berlaku saat pengajuan dilakukan.
            </p>
          </div>

        </div>

        {/* Contact Box */}
        <div className="mt-14 p-8 bg-slate-900/40 border border-slate-800/50 rounded-3xl">
          <h3 className="font-space-grotesk font-bold text-white mb-2">Hubungi Tim Support Kami</h3>
          <p className="text-slate-400 text-sm mb-5">
            Untuk mengajukan refund atau pertanyaan terkait pembayaran:
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <a
              href="https://wa.me/6282117132290"
              className="flex-1 py-3 text-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all"
            >
              WhatsApp: +62 821-1713-2290
            </a>
            <a
              href="mailto:faizax.app@gmail.com"
              className="flex-1 py-3 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all"
            >
              faizax.app@gmail.com
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-10 flex gap-6 text-[11px] text-slate-600">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-slate-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
