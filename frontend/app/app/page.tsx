"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { connectWallet, WalletProvider } from "@/lib/wallet";

const stats = [
  { label: "Active Commitments", value: "0", icon: "🔒", color: "var(--orange)" },
  { label: "XLM Staked", value: "0", icon: "💎", color: "var(--navy)" },
  { label: "Judging For", value: "0", icon: "⚖️", color: "var(--brown)" },
  { label: "Completed", value: "0", icon: "✅", color: "#14a060" },
];

const walletOptions: { id: WalletProvider; label: string; description: string; icon: string }[] = [
  { id: "freighter", label: "Freighter", description: "Recommended", icon: "🪐" },
  { id: "xbull", label: "xBull", description: "Mobile & Desktop", icon: "🐂" },
  { id: "albedo", label: "Albedo", description: "Web-based", icon: "🔑" },
];

export default function AppDashboard() {
  const [status, setStatus] = useState("Not connected");
  const [address, setAddress] = useState<string | null>(null);

  async function handleWalletConnect(provider: WalletProvider) {
    setStatus(`Connecting ${provider}...`);
    const publicKey = await connectWallet(provider);

    if (!publicKey) {
      setStatus(`Could not connect with ${provider}. Check that the wallet is installed and authorized.`);
      return;
    }

    setAddress(publicKey);
    setStatus(`Connected with ${provider}`);
  }

  return (
    <AppLayout>
      {/* Connect wallet gate */}
      <div className="app-connect-gate">
        <div className="app-connect-card">
          <div className="app-connect-icon">🔐</div>
          <h2>Connect your wallet</h2>
          <p>
            Link your Stellar wallet to view your commitments, create new ones,
            and act as a judge. Freighter, xBull, and Albedo are supported.
          </p>
          <div className="wallet-options">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                className="wallet-option-btn"
                onClick={() => handleWalletConnect(wallet.id)}
              >
                <span className="wallet-option-icon">{wallet.icon}</span>
                <div>
                  <strong>{wallet.label}</strong>
                  <span>{wallet.description}</span>
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20, color: "var(--gray)", fontSize: 14 }}>
            {status}
          </div>
          {address && (
            <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 13 }}>
              {address}
            </div>
          )}
        </div>

        {/* Stats preview (empty state) */}
        <div className="app-stats-grid">
          {stats.map((s) => (
            <div className="app-stat-card" key={s.label}>
              <div className="app-stat-icon" style={{ background: `${s.color}18` }}>
                {s.icon}
              </div>
              <div className="app-stat-value">{s.value}</div>
              <div className="app-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="app-quick-actions">
          <div className="app-section-title">Quick actions</div>
          <div className="app-action-row">
            <Link href="/app/create" className="app-action-card">
              <div className="app-action-icon" style={{ background: "rgba(232,86,43,0.1)" }}>✦</div>
              <div>
                <strong>New Commitment</strong>
                <span>Lock XLM on a goal</span>
              </div>
              <span className="app-action-arrow">→</span>
            </Link>
            <Link href="/app/judge" className="app-action-card">
              <div className="app-action-icon" style={{ background: "rgba(22,35,58,0.08)" }}>⚖</div>
              <div>
                <strong>Judge Inbox</strong>
                <span>Review pending verdicts</span>
              </div>
              <span className="app-action-arrow">→</span>
            </Link>
            <Link href="/app/my-commitments" className="app-action-card">
              <div className="app-action-icon" style={{ background: "rgba(123,69,48,0.08)" }}>◈</div>
              <div>
                <strong>My Commitments</strong>
                <span>Track your active goals</span>
              </div>
              <span className="app-action-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
