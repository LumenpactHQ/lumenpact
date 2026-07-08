"use client";

import { useWallet } from "@/lib/wallet-context";

export default function WalletConnect() {
  const { address, status, connect, disconnect } = useWallet();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {address ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div
            className="wallet-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(20,160,96,0.12)",
              color: "#14a060",
              fontSize: 13,
              fontFamily: "monospace",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#14a060",
              }}
            />
            {address.slice(0, 6)}…{address.slice(-4)}
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: "8px 12px", fontSize: "12px" }}
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => connect("freighter")}>
          Connect wallet
        </button>
      )}
      <div style={{ color: "var(--gray)", fontSize: 13 }}>{status}</div>
    </div>
  );
}
