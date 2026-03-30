import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Fyntra | Manajemen Keuangan Cerdas by Faizax",
  description:
    "Platform manajemen keuangan berbasis AI untuk investor modern Indonesia.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico?v=fyntra1",
    apple: "/favicon.ico?v=fyntra1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simpan key di dalam variabel agar lebih aman saat pengecekan rendering
  const midtransKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-inter antialiased transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          {children}

          {/* 🔥 Script diletakkan di dalam ThemeProvider dan dicek ketersediaan key-nya */}
          {midtransKey && (
            <Script
              src="https://app.sandbox.midtrans.com/snap/snap.js"
              data-client-key={midtransKey}
              strategy="afterInteractive"
            />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
