import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Env Vars");
      return NextResponse.json(
        { error: "Server Configuration Error" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { userId, userEmail, userName } = body;

    const orderId = `FYNTRA-${Date.now()}`;

    // 1. Simpan ke Supabase
    const { error: dbError } = await supabaseAdmin
      .from("fyntra_subscriptions")
      .insert([
        {
          user_id: userId,
          midtrans_order_id: orderId,
          status: "pending",
          plan_type: "pro",
        },
      ]);

    if (dbError) {
      console.error("Database Error:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Inisialisasi Midtrans
    const snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: 19000 },
      customer_details: { first_name: userName, email: userEmail },
    };

    const transaction = await snap.createTransaction(parameter);

    // 3. RETURN WAJIB
    return NextResponse.json({ token: transaction.token, orderId });
  } catch (error: any) {
    console.error("Catch Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
