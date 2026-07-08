"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { connectWallet, signTransaction, type WalletProvider } from "./wallet";

interface WalletContextValue {
  address: string | null;
  provider: WalletProvider | null;
  status: string;
  connect: (provider?: WalletProvider) => Promise<void>;
  disconnect: () => void;
  sign: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [status, setStatus] = useState("Not connected");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("lumenpact.wallet");
    if (!saved) return;
    const parsed = JSON.parse(saved) as { address: string; provider: WalletProvider };
    setAddress(parsed.address);
    setProvider(parsed.provider);
    setStatus(`Connected with ${parsed.provider}`);
  }, []);

  const connect = useCallback(async (chosen?: WalletProvider) => {
    setStatus("Connecting...");
    const pk = await connectWallet(chosen);
    if (!pk) {
      setStatus("Could not connect. Install the wallet extension and authorize it.");
      return;
    }
    const used = chosen ?? "freighter";
    setAddress(pk);
    setProvider(used);
    setStatus(`Connected with ${used}`);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "lumenpact.wallet",
        JSON.stringify({ address: pk, provider: used })
      );
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setStatus("Not connected");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("lumenpact.wallet");
    }
  }, []);

  const sign = useCallback(
    async (xdr: string) => {
      if (!provider) throw new Error("Wallet is not connected.");
      return signTransaction(provider, xdr);
    },
    [provider]
  );

  return (
    <WalletContext.Provider
      value={{ address, provider, status, connect, disconnect, sign }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
