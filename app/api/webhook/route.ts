import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verifikasi Signature
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

    const status = body.transaction_status;
    if (status === "settlement" || status === "capture") {
      // Cari user_id dari order_id
      const { data: sub } = await supabaseAdmin
        .from("fyntra_subscriptions")
        .select("user_id")
        .eq("midtrans_order_id", body.order_id)
        .single();

      if (sub) {
        // Update tabel langganan
        await supabaseAdmin
          .from("fyntra_subscriptions")
          .update({ status: "active" })
          .eq("midtrans_order_id", body.order_id);
        // Update tabel profil jadi PRO
        await supabaseAdmin
          .from("profiles")
          .update({ is_pro: true })
          .eq("id", sub.user_id);
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
