import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Menggunakan font Inter yang bersih ala Notion/SaaS modern
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fyntra | Smart Finance by Faizax",
  description:
    "Intelligence-driven wealth management for the modern individual. Powered by Faizax Ecosystem.",
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
