"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/wallet";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState("Not connected");

  async function handleConnect() {
    setStatus("Connecting...");
    const publicKey = await connectWallet();

    if (!publicKey) {
      setStatus("Freighter not available or not authorized");
      return;
    }

    setAddress(publicKey);
    setStatus("Connected");
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button className="btn btn-primary" onClick={handleConnect}>
        Connect wallet
      </button>
      <div style={{ color: "var(--gray)" }}>{status}</div>
      {address && <div style={{ fontFamily: "monospace" }}>{address}</div>}
    </div>
  );
}
