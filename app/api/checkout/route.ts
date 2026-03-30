import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 🔍 Debug env
    console.log(
      "MIDTRANS_SERVER_KEY:",
      process.env.MIDTRANS_SERVER_KEY ? "ADA" : "KOSONG",
    );

    const { userEmail, userName } = await req.json();

    const orderId = `FYNTRA-${Date.now()}`;

    // 🔥 Init Midtrans (cukup serverKey)
    const snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 19000,
      },
      customer_details: {
        first_name: userName || "User",
        email: userEmail || "faizax.app@gmail.com",
      },
      // 🔥 sementara jangan terlalu banyak metode
      enabled_payments: ["qris", "bank_transfer", "gopay"],
    };

    console.log("PARAMETER:", parameter);

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      orderId,
    });
  } catch (error: any) {
    console.error("MIDTRANS ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Gagal membuat transaksi",
      },
      { status: 500 },
    );
  }
}
