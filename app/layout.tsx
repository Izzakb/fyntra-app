import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Menggunakan font Inter yang bersih ala Notion/SaaS modern
const inter = Inter({ subsets: ["latin"] });

// PISAHKAN VIEWPORT (Standar Next.js 14+ untuk Mobile UI/PWA)
export const viewport: Viewport = {
  themeColor: "#0f172a", // Warna status bar di HP (mengikuti warna Dark Slate Fyntra)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Mencegah layar ke-zoom sendiri saat mencet tombol di HP
};

export const metadata: Metadata = {
  title: "Fyntra | Smart Finance by Faizax",
  description:
    "Intelligence-driven wealth management for the modern individual. Powered by Faizax Ecosystem.",
  manifest: "/manifest.json", // <-- INI KUNCI UTAMA PWA (Agar bisa di-install)
  icons: {
    // Memanggil favicon.ico yang ada di folder public fyntra-app
    icon: "/favicon.ico?v=fyntra1",
    apple: "/favicon.ico?v=fyntra1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-gray-50 selection:bg-blue-100`}
      >
        {/* bg-gray-50 supaya background aplikasi terasa lebih premium & clean */}
        {children}
      </body>
    </html>
  );
}
