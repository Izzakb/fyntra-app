"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// 1. Buat tipe data untuk Dompet
export interface Wallet {
  id: string;
  wallet_name: string;
  balance: number;
  icon: string;
  is_default: boolean;
}

interface FyntraContextType {
  fullName: string;
  balance: number; // Ini sekarang adalah TOTAL dari semua dompet (Master Balance)
  wallets: Wallet[]; // Ini adalah daftar dompetnya
  avatarUrl: string | null;
  loadingGlobal: boolean;
  refreshGlobalData: () => Promise<void>;
}

const FyntraContext = createContext<FyntraContextType | undefined>(undefined);

export function FyntraProvider({ children }: { children: ReactNode }) {
  const [fullName, setFullName] = useState("");
  const [balance, setBalance] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]); // State untuk menyimpan banyak dompet
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  const refreshGlobalData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoadingGlobal(false);
      return;
    }

    // Ambil Profil & Avatar
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    // Ambil SEMUA DOMPET milik user ini
    const { data: userWallets, error: walletError } = await supabase
      .from("fyntra_wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (profile) {
      setFullName(profile.full_name);
      if (profile.avatar_url) {
        const { data: imgData } = await supabase.storage
          .from("avatars")
          .download(profile.avatar_url);
        if (imgData) setAvatarUrl(URL.createObjectURL(imgData));
      }
    }

    if (userWallets) {
      setWallets(userWallets);
      // Kalkulasi Master Balance (Total semua saldo dompet)
      const totalBalance = userWallets.reduce(
        (total, wallet) => total + Number(wallet.balance),
        0,
      );
      setBalance(totalBalance);
    }

    setLoadingGlobal(false);
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  return (
    <FyntraContext.Provider
      value={{
        fullName,
        balance,
        wallets,
        avatarUrl,
        loadingGlobal,
        refreshGlobalData,
      }}
    >
      {children}
    </FyntraContext.Provider>
  );
}

export function useFyntra() {
  const context = useContext(FyntraContext);
  if (context === undefined)
    throw new Error("useFyntra harus digunakan di dalam FyntraProvider");
  return context;
}
