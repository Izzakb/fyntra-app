"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// 1. Tipe data untuk Dompet (Cash)
export interface Wallet {
  id: string;
  wallet_name: string;
  balance: number;
  icon: string;
  is_default: boolean;
}

// 2. Tipe data untuk Aset (Investment)
export interface Asset {
  id: string;
  asset_type: string;
  asset_subcategory: string;
  asset_name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
}

interface FyntraContextType {
  fullName: string;
  avatarUrl: string | null;
  isPro: boolean; // 💡 NEW: Status Langganan
  loadingGlobal: boolean;

  // -- CASH SECTION --
  balance: number;
  wallets: Wallet[];

  // -- INVESTMENT SECTION --
  totalInvestment: number;
  assets: Asset[];

  // -- MASTER WEALTH --
  netWorth: number;

  refreshGlobalData: () => Promise<void>;
}

const FyntraContext = createContext<FyntraContextType | undefined>(undefined);

export function FyntraProvider({ children }: { children: ReactNode }) {
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false); // 💡 NEW: Default False
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  // States untuk Keuangan
  const [balance, setBalance] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [netWorth, setNetWorth] = useState(0);

  const refreshGlobalData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingGlobal(false);
      return;
    }

    // 1. Ambil Profil, Avatar, & Status Pro
    // 💡 Pastikan kolom 'is_pro' sudah ada di tabel 'profiles' kamu
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, is_pro")
      .eq("id", user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || "");
      setIsPro(profile.is_pro || false); // 💡 Update Status Pro di sini

      if (profile.avatar_url) {
        const { data: imgData } = await supabase.storage
          .from("avatars")
          .download(profile.avatar_url);
        if (imgData) setAvatarUrl(URL.createObjectURL(imgData));
      }
    }

    // 2. Ambil DATA CASH (fyntra_wallets)
    const { data: userWallets } = await supabase
      .from("fyntra_wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    let currentCash = 0;
    if (userWallets) {
      setWallets(userWallets);
      currentCash = userWallets.reduce(
        (total, w) => total + Number(w.balance),
        0,
      );
      setBalance(currentCash);
    }

    // 3. Ambil DATA ASSETS (fyntra_assets)
    const { data: userAssets } = await supabase
      .from("fyntra_assets")
      .select("*")
      .eq("user_id", user.id)
      .order("asset_type", { ascending: true });

    let currentInvestment = 0;
    if (userAssets) {
      setAssets(userAssets);
      currentInvestment = userAssets.reduce(
        (total, a) => total + Number(a.quantity) * Number(a.current_price),
        0,
      );
      setTotalInvestment(currentInvestment);
    }

    // 4. Update MASTER NET WORTH
    setNetWorth(currentCash + currentInvestment);

    setLoadingGlobal(false);
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  return (
    <FyntraContext.Provider
      value={{
        fullName,
        isPro, // 💡 Bagikan status Pro ke seluruh App
        balance,
        wallets,
        totalInvestment,
        assets,
        netWorth,
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
