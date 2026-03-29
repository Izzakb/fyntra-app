// @ts-ignore
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const supabase = createRouteHandlerClient({ cookies });

  // Ambil status dari Midtrans
  const orderId = data.order_id;
  const transactionStatus = data.transaction_status;

  if (transactionStatus === "settlement") {
    // 1. Update tabel fyntra_subscriptions
    const { data: subData } = await supabase
      .from("fyntra_subscriptions")
      .update({
        status: "active",
        plan_type: "pro",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 Hari
      })
      .eq("midtrans_order_id", orderId)
      .select("user_id")
      .single();

    // 2. Update is_pro di tabel profiles agar UI berubah
    if (subData) {
      await supabase
        .from("profiles")
        .update({ is_pro: true })
        .eq("id", subData.user_id);
    }
  }

  return NextResponse.json({ status: "ok" });
}
