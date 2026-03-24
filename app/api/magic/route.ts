import { NextRequest, NextResponse } from "next/server";
// Alamat import sudah diperbaiki ke library resmi:
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    // 1. Kunci Rahasia
    const MY_SECRET_KEY = "AIzaSyB1jHafLaBgLRx4gUC7rDy2ryD93BltaKU";

    // 2. Inisialisasi dengan Class yang benar
    const genAI = new GoogleGenerativeAI(MY_SECRET_KEY);

    // Gunakan gemini-1.5-flash (paling stabil untuk ekstraksi data)
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

    // 3. Jalankan AI
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const rawText = response.text();

    // Parsing hasil
    const cleanJson = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Magic Error Detail:", error);
    return NextResponse.json(
      {
        error: "Gagal memproses input AI.",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
