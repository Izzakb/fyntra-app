import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FyntraProvider } from "@/context/FyntraContext"; // 💡 IMPORT PROVIDER KAMU
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Fyntra | Smart Finance by Faizax",
  description: "Intelligence-driven wealth management by Faizax Ecosystem.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased transition-colors duration-300`}
      >
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          {/* 💡 BUNGKUS CHILDREN DENGAN PROVIDER DI SINI */}
          <FyntraProvider>{children}</FyntraProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
