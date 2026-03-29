import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Gunakan Service Role Key agar bisa update data tanpa terhalang RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verifikasi Signature Midtrans (Keamanan)
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
      return NextResponse.json(
        { message: "Invalid Signature" },
        { status: 401 },
      );
    }

    // Logika update status jika pembayaran berhasil
    if (
      body.transaction_status === "settlement" ||
      body.transaction_status === "capture"
    ) {
      // Ambil user_id berdasarkan order_id dari tabel transaksi kamu
      const { data: subscription } = await supabaseAdmin
        .from("fyntra_subscriptions")
        .select("user_id")
        .eq("order_id", body.order_id)
        .single();

      if (subscription) {
        await supabaseAdmin
          .from("profiles")
          .update({ is_pro: true })
          .eq("id", subscription.user_id);
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
