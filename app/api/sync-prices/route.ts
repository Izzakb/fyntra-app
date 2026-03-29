import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ASSET_DICTIONARY: Record<string, string> = {
  btc: "bitcoin",
  bitcoin: "bitcoin",
  eth: "ethereum",
  ethereum: "ethereum",
  usdt: "tether",
  tether: "tether",
  bnb: "binancecoin",
  sol: "solana",
  solana: "solana",
  doge: "dogecoin",
  dogecoin: "dogecoin",
  emas: "pax-gold",
  antam: "pax-gold",
  gold: "pax-gold",
};

export async function POST(req: NextRequest) {
  // AUTH CHECK
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assets } = await req.json();

    if (!assets || assets.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada aset untuk disinkronisasi." },
        { status: 400 },
      );
    }

    const syncableAssets = assets.filter(
      (a: any) => a.asset_type === "Crypto" || a.asset_type === "Emas",
    );

    if (syncableAssets.length === 0) {
      return NextResponse.json({
        message: "Tidak ada Crypto atau Emas yang perlu disinkronisasi.",
      });
    }

    const coinIds = new Set<string>();
    syncableAssets.forEach((a: any) => {
      const nameKey = a.asset_name.toLowerCase();
      if (ASSET_DICTIONARY[nameKey]) {
        coinIds.add(ASSET_DICTIONARY[nameKey]);
      }
    });

    if (coinIds.size === 0) {
      return NextResponse.json({
        message: "Nama koin/emas tidak dikenali sistem. Pakai singkatan umum (BTC, ETH, Emas).",
      });
    }

    const idsString = Array.from(coinIds).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=idr`,
    );
    const priceData = await res.json();

    const updatedPrices: any[] = [];

    syncableAssets.forEach((a: any) => {
      const nameKey = a.asset_name.toLowerCase();
      const coinId = ASSET_DICTIONARY[nameKey];

      if (coinId && priceData[coinId] && priceData[coinId].idr) {
        let newPrice = priceData[coinId].idr;

        if (a.asset_type === "Emas") {
          newPrice = Math.round(newPrice / 31.103);
        }

        updatedPrices.push({
          id: a.id,
          asset_name: a.asset_name,
          old_price: a.current_price,
          new_price: newPrice,
        });
      }
    });

    return NextResponse.json({ success: true, updatedPrices });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menyinkronkan harga pasar." },
      { status: 500 },
    );
  }
}
