import { NextResponse } from "next/server";

// Kamus Pintar untuk mapping nama inputan Bos ke ID CoinGecko
const ASSET_DICTIONARY: Record<string, string> = {
  // Crypto
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
  // Emas (Pakai PAX Gold sebagai patokan harga emas dunia)
  emas: "pax-gold",
  antam: "pax-gold",
  gold: "pax-gold",
};

export async function POST(req: Request) {
  try {
    const { assets } = await req.json();

    if (!assets || assets.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada aset untuk disinkronisasi." },
        { status: 400 },
      );
    }

    // 1. Filter cuma Crypto & Emas
    const syncableAssets = assets.filter(
      (a: any) => a.asset_type === "Crypto" || a.asset_type === "Emas",
    );

    if (syncableAssets.length === 0) {
      return NextResponse.json({
        message: "Tidak ada Crypto atau Emas yang perlu disinkronisasi.",
      });
    }

    // 2. Kumpulkan ID untuk CoinGecko
    const coinIds = new Set<string>();
    syncableAssets.forEach((a: any) => {
      const nameKey = a.asset_name.toLowerCase();
      if (ASSET_DICTIONARY[nameKey]) {
        coinIds.add(ASSET_DICTIONARY[nameKey]);
      }
    });

    if (coinIds.size === 0) {
      return NextResponse.json({
        message:
          "Nama koin/emas tidak dikenali sistem. Pakai singkatan umum (BTC, ETH, Emas).",
      });
    }

    // 3. Tembak API CoinGecko (Gratis, No API Key)
    const idsString = Array.from(coinIds).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=idr`,
    );
    const priceData = await res.json();

    // 4. Siapkan data update
    const updatedPrices: any[] = [];

    syncableAssets.forEach((a: any) => {
      const nameKey = a.asset_name.toLowerCase();
      const coinId = ASSET_DICTIONARY[nameKey];

      if (coinId && priceData[coinId] && priceData[coinId].idr) {
        let newPrice = priceData[coinId].idr;

        // KALKULASI KHUSUS EMAS: 1 Troy Ounce = 31.103 Gram
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
