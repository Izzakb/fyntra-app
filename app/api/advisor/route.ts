import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  // AUTH CHECK: Validasi user via Supabase session token
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
    const body = await req.json();
    const { income, expense, balance, topCategory } = body;

    const prompt = `
      Anda adalah "Fyntra AI", penasihat keuangan pribadi yang pintar, asyik, dan to the point.
      Gaya bahasa: Santai tapi profesional, gunakan sapaan "Bos". Jangan terlalu kaku.
      
      Berikut adalah data keuangan bulan ini:
      - Pemasukan: Rp ${income.toLocaleString("id-ID")}
      - Pengeluaran: Rp ${expense.toLocaleString("id-ID")}
      - Sisa Saldo Master: Rp ${balance.toLocaleString("id-ID")}
      - Pengeluaran Terbesar di kategori: ${topCategory || "Belum ada"}
      
      Tugas:
      Berikan 1 paragraf singkat (maksimal 3-4 kalimat) berisi insight atau peringatan terkait kondisi keuangan di atas. 
      Jika pengeluaran lebih besar dari pemasukan, tegur dengan halus. Jika bagus, puji.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ advice: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { advice: "Waduh Bos, sistem AI lagi istirahat bentar. Coba lagi nanti ya!" },
      { status: 500 },
    );
  }
}
