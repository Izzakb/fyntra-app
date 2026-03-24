import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // Bikin koneksi ke Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Pencet tombol "Otak Robot" yang barusan kita buat di SQL
  const { error } = await supabase.rpc("process_daily_automations");

  if (error) {
    console.error("Gagal menjalankan automasi harian:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Robot Fyntra berhasil mengecek dan mengeksekusi tagihan hari ini!",
  });
}
