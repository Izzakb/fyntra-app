import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Script: izinkan Midtrans sandbox & production
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com",
              // Frame: izinkan popup Snap Midtrans
              "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.midtrans.com",
              // Connect: izinkan API calls ke Midtrans & Supabase
              "connect-src 'self' https://*.midtrans.com https://api.midtrans.com https://*.supabase.co wss://*.supabase.co https://api.coingecko.com",
              // Style & font
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Image
              "img-src 'self' data: blob: https://*.midtrans.com https://*.supabase.co",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
