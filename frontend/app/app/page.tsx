"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { useWallet } from "@/lib/wallet-context";
import {
  getUserCommitments,
  getJudgeCommitments,
} from "@/lib/contract";
import { stroopsToXlm, type Commitment } from "@/lib/types";

const walletOptions: { id: "freighter" | "xbull" | "albedo"; label: string; description: string; icon: string }[] = [
  { id: "freighter", label: "Freighter", description: "Recommended", icon: "🪐" },
  { id: "xbull", label: "xBull", description: "Mobile & Desktop", icon: "🐂" },
  { id: "albedo", label: "Albedo", description: "Web-based", icon: "🔑" },
];

export default function AppDashboard() {
  const { address, status, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Commitment[]>([]);
  const [judging, setJudging] = useState<Commitment[]>([]);

  useEffect(() => {
    if (!address) return;
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getUserCommitments(address), getJudgeCommitments(address)])
      .then(([mine, assigned]) => {
        if (!active) return;
        setCreated(mine);
        setJudging(assigned);
      })
      .catch((e) => active && setError(e?.message ?? "Failed to load commitments"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [address]);

  const activeCreated = created.filter((c) => c.status === "Active");
  const resolvedCreated = created.filter((c) => c.status !== "Active");
  const xlmStaked = created
    .filter((c) => c.status === "Active")
    .reduce((sum, c) => sum + stroopsToXlm(c.amount), 0);
  const awaitingVerdict = judging.filter((c) => c.status === "Active");

  const stats = [
    { label: "Active Commitments", value: String(activeCreated.length), icon: "🔒", color: "var(--orange)" },
    { label: "XLM Staked", value: xlmStaked.toFixed(0), icon: "💎", color: "var(--navy)" },
    { label: "Judging For", value: String(awaitingVerdict.length), icon: "⚖️", color: "var(--brown)" },
    { label: "Completed", value: String(resolvedCreated.length), icon: "✅", color: "#14a060" },
  ];

  return (
    <AppLayout>
      {!address ? (
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
                  onClick={() => connect(wallet.id)}
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
          </div>

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
        </div>
      ) : (
        <>
          {error && (
            <div className="app-error-banner" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

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

          {loading && <div style={{ color: "var(--gray)" }}>Loading…</div>}
        </>
      )}
    </AppLayout>
  );
}
