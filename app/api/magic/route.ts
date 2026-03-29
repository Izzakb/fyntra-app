import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

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
    // Pakai env variable, BUKAN hardcoded key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const body = await req.json();
    const { text, imageBase64 } = body;

    let promptParts: any[] = [];

    if (imageBase64) {
      const mimeType = imageBase64.split(";")[0].split(":")[1];
      const base64Data = imageBase64.split(",")[1];
      promptParts.push({
        inlineData: { data: base64Data, mimeType: mimeType },
      });
      promptParts.push(
        "Ini gambar struk. Tolong baca total belanja, nama toko, dan kategorinya.",
      );
    } else if (text) {
      promptParts.push(`Ekstrak transaksi dari kalimat ini: "${text}"`);
    }

    const systemInstruction = `
    HANYA kembalikan JSON (tanpa markdown).
    Format wajib:
    {
      "amount": number,
      "description": string,
      "type": "expense" | "income",
      "category": "Makanan" | "Transportasi" | "Hiburan" | "Belanja" | "Kesehatan" | "Income" | "Lainnya",
      "wallet_hint": "BCA" | "Cash" | "Tunai" | "Gopay"
    }
    `;
    promptParts.push(systemInstruction);

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const rawText = response.text();

    const cleanJson = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Magic Error Detail:", error);
    return NextResponse.json(
      { error: "Gagal memproses input AI.", message: error.message },
      { status: 500 },
    );
  }
}
