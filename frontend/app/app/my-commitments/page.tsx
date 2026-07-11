 "use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { getUserCommitments, cancelCommitment } from "@/lib/contract";
import { stroopsToXlm, type Commitment } from "@/lib/types";

function formatDeadline(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-GB", {
    dateStyle: "medium",
  });
}

function daysLeft(unix: number): number | null {
  const diff = unix - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400);
}

function statusView(c: Commitment): { label: string; cls: string; emoji: string } {
  if (c.status === "Active") return { label: "Active", cls: "active", emoji: "🔒" };
  if (c.status === "Cancelled") return { label: "Expired", cls: "expired", emoji: "⌛" };
  return c.outcome
    ? { label: "Passed", cls: "pass", emoji: "✅" }
    : { label: "Failed", cls: "fail-badge", emoji: "❌" };
}

function canCancel(c: Commitment): boolean {
  return (
    c.status === "Active" &&
    Math.floor(Date.now() / 1000) >= c.deadline + c.gracePeriod
  );
}

export default function MyCommitmentsPage() {
  const { address, sign } = useWallet();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      setCommitments(await getUserCommitments(address));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load commitments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function handleCancel(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await cancelCommitment(id, address!, sign);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setBusyId(null);
    }
  }

  const active = commitments.filter((c) => c.status === "Active");
  const history = commitments.filter((c) => c.status !== "Active");

  return (
    <AppLayout>
      <div className="commitments-page">
        {error && <div className="app-error-banner" style={{ marginBottom: 16 }}>{error}</div>}
        {loading && <div style={{ color: "var(--gray)", marginBottom: 16 }}>Loading…</div>}

        {!address && (
          <div className="commitments-empty">
            <div className="commitments-empty-icon">🔐</div>
            <strong>Connect your wallet</strong>
            <p>Your commitments load from the contract using your connected address.</p>
          </div>
        )}

        {address && !loading && commitments.length === 0 && (
          <div className="commitments-empty">
            <div className="commitments-empty-icon">🔒</div>
            <strong>No commitments yet</strong>
            <p>Create your first commitment to lock XLM on a goal.</p>
            <Link href="/app/create" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Create a commitment →
            </Link>
          </div>
        )}

        {address && commitments.length > 0 && (
          <>
            <div className="commitments-header">
              <div>
                <div className="commitments-count">
                  {active.length} active commitment{active.length !== 1 ? "s" : ""}
                </div>
                <p style={{ color: "var(--gray)", fontSize: "14px", marginTop: "4px" }}>
                  Showing all goals you&apos;ve locked XLM on
                </p>
              </div>
              <Link href="/app/create" className="btn btn-primary">
                + New commitment
              </Link>
            </div>

            {active.length > 0 && (
              <div className="commitments-group">
                <div className="commitments-group-title">Active</div>
                <div className="commitments-list">
                  {active.map((c) => {
                    const sv = statusView(c);
                    const dl = daysLeft(c.deadline);
                    return (
                      <div className="commitment-card" key={c.id}>
                        <div className="commitment-card-top">
                          <div className="commitment-card-main">
                            <div className="commitment-goal">{c.description}</div>
                            <div className="commitment-meta">
                              <span>📅 {formatDeadline(c.deadline)}</span>
                              {dl !== null && (
                                <span className={`commitment-days${dl === 0 ? " urgent" : ""}`}>
                                  {dl === 0 ? "⚠️ Due today" : `⏱️ ${dl} days left`}
                                </span>
                              )}
                              <span>⚖️ Judge: {c.judge.slice(0, 6)}…{c.judge.slice(-4)}</span>
                            </div>
                          </div>
                          <div className="commitment-card-right">
                            <span className={`mock-badge ${sv.cls}`}>{sv.label}</span>
                            <div className="commitment-stake">{stroopsToXlm(c.amount).toFixed(0)} XLM</div>
                            <div className="commitment-stake-label">staked</div>
                          </div>
                        </div>

                        {canCancel(c) && (
                          <div className="commitment-cancel-row">
                            <span className="form-hint">Grace period elapsed — judge went silent.</span>
                            <button
                              className="btn btn-ghost"
                              disabled={busyId === c.id}
                              onClick={() => handleCancel(c.id)}
                            >
                              {busyId === c.id ? "Refunding…" : "Cancel & Refund"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="commitments-group">
                <div className="commitments-group-title">History</div>
                <div className="commitments-list">
                  {history.map((c) => {
                    const sv = statusView(c);
                    return (
                      <div className="commitment-card resolved" key={c.id}>
                        <div className="commitment-card-top">
                          <div className="commitment-card-main">
                            <div className="commitment-goal" style={{ opacity: 0.7 }}>{c.description}</div>
                            <div className="commitment-meta">
                              <span>📅 {formatDeadline(c.deadline)}</span>
                              <span>⚖️ {c.judge.slice(0, 6)}…{c.judge.slice(-4)}</span>
                            </div>
                          </div>
                          <div className="commitment-card-right">
                            <span className={`mock-badge ${sv.cls}`}>
                              {sv.emoji} {sv.label}
                            </span>
                            <div className="commitment-stake" style={{ opacity: 0.6 }}>
                              {stroopsToXlm(c.amount).toFixed(0)} XLM
                            </div>
                            <div className="commitment-stake-label">
                              {c.status === "Cancelled"
                                ? "returned"
                                : c.outcome
                                ? "returned"
                                : "forfeited"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}