import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  // Inisialisasi Supabase Admin (Bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Gunakan Service Role Key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  try {
    const body = await req.json();
    console.log("🔔 Midtrans Webhook Received for Order:", body.order_id);

    // 1. Verifikasi Signature Midtrans (Keamanan Berlapis)
    const signature = crypto
      .createHash("sha512")
      .update(
        body.order_id +
          body.status_code +
          body.gross_amount +
          process.env.MIDTRANS_SERVER_KEY,
      )
      .digest("hex");

    if (signature !== body.signature_key) {
      console.error("❌ Invalid Signature Key!");
      return NextResponse.json(
        { message: "Invalid Signature" },
        { status: 401 },
      );
    }

    // 2. Filter Status Transaksi yang Berhasil
    const isSuccess =
      body.transaction_status === "settlement" ||
      body.transaction_status === "capture";

    if (isSuccess) {
      // Cari data di tabel langganan berdasarkan order_id
      const { data: subscription, error: fetchError } = await supabaseAdmin
        .from("fyntra_subscriptions") // Pastikan nama tabel ini benar
        .select("user_id")
        .eq("order_id", body.order_id)
        .single();

      if (fetchError || !subscription) {
        console.error(
          "❌ Order ID tidak ditemukan di Database:",
          body.order_id,
        );
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // 3. Update status PRO di tabel profiles
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_pro: true })
        .eq("id", subscription.user_id);

      if (updateError) {
        console.error("❌ Gagal update status PRO:", updateError.message);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      console.log(`✅ Success! User ${subscription.user_id} is now PRO.`);
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("💥 Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
