"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// 1. Definisikan bentuk data yang akan disimpan di "Pusat Data Global"
interface FyntraContextType {
  fullName: string;
  balance: number;
  loadingGlobal: boolean;
  refreshGlobalData: () => Promise<void>; // Fungsi pengganti onUpdate
}

// 2. Buat Context-nya (Awalnya kosong)
const FyntraContext = createContext<FyntraContextType | undefined>(undefined);

// 3. Buat Provider (Pembungkus yang menyediakan data)
export function FyntraProvider({ children }: { children: ReactNode }) {
  const [fullName, setFullName] = useState("");
  const [balance, setBalance] = useState(0);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  // Fungsi sakti untuk menarik data terbaru dari Supabase
  const refreshGlobalData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoadingGlobal(false);
      return;
    }

    // Ambil Profil (Nama)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Ambil Wallet (Saldo Terupdate)
    const { data: wallet } = await supabase
      .from("fyntra_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (profile) setFullName(profile.full_name);
    if (wallet) setBalance(wallet.balance);
    setLoadingGlobal(false);
  };

  // Tarik data pertama kali saat aplikasi dibuka
  useEffect(() => {
    refreshGlobalData();
  }, []);

  return (
    <FyntraContext.Provider
      value={{ fullName, balance, loadingGlobal, refreshGlobalData }}
    >
      {children}
    </FyntraContext.Provider>
  );
}

// 4. Buat Custom Hook agar komponen lain gampang mengambil data
export function useFyntra() {
  const context = useContext(FyntraContext);
  if (context === undefined) {
    throw new Error("useFyntra harus digunakan di dalam FyntraProvider");
  }
  return context;
}
