"use client";
import { useState } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabase"; // Import dari lib ok buat auth

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return alert("Login dulu bro!");

      const response = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: "User Fyntra",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      (window as any).snap.pay(data.token, {
        onSuccess: () => {
          alert("Pembayaran Berhasil!");
          window.location.reload();
        },
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-20 text-center">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <h1 className="text-4xl font-bold mb-10">UPGRADE KE PRO</h1>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-blue-600 px-10 py-4 rounded-full font-bold"
      >
        {loading ? "PROSES..." : "BELI SEKARANG - RP 19.000"}
      </button>
    </div>
  );
}
