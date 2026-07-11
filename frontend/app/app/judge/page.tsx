 "use client";

import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { getJudgeCommitments, resolveCommitment } from "@/lib/contract";
import { stroopsToXlm, type Commitment } from "@/lib/types";

type Verdict = "pass" | "fail" | null;

function formatDeadline(unix: number): string {
  return new Date(unix * 1000).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function deadlinePassed(c: Commitment): boolean {
  return Math.floor(Date.now() / 1000) >= c.deadline;
}

export default function JudgeInboxPage() {
  const { address, sign } = useWallet();
  const [items, setItems] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: number; verdict: Verdict } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getJudgeCommitments(address);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const pending = items.filter((c) => c.status === "Active");
  const resolved = items.filter((c) => c.status !== "Active");

  async function confirmVerdict() {
    if (!confirming) return;
    setBusyId(confirming.id);
    setError(null);
    try {
      await resolveCommitment(confirming.id, confirming.verdict === "pass", address!, sign);
      setConfirming(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit verdict");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppLayout>
      <div className="judge-page">
        {error && <div className="app-error-banner" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="judge-summary-bar">
          <div className="judge-summary-item">
            <span className="judge-summary-num judge-summary-orange">{pending.length}</span>
            <span>Awaiting verdict</span>
          </div>
          <div className="judge-summary-item">
            <span className="judge-summary-num judge-summary-green">
              {resolved.filter((r) => r.outcome === true).length}
            </span>
            <span>Passed</span>
          </div>
          <div className="judge-summary-item">
            <span className="judge-summary-num judge-summary-red">
              {resolved.filter((r) => r.outcome === false).length}
            </span>
            <span>Failed</span>
          </div>
        </div>

        {loading && <div style={{ color: "var(--gray)" }}>Loading commitments…</div>}

        {!address && (
          <div className="judge-empty">
            <div className="judge-empty-icon">🔐</div>
            <strong>Connect your wallet</strong>
            <p>Your judge inbox loads from the contract using your connected address.</p>
          </div>
        )}

        {address && !loading && pending.length === 0 && resolved.length === 0 && (
          <div className="judge-empty">
            <div className="judge-empty-icon">✅</div>
            <strong>No commitments assigned</strong>
            <p>No one has nominated you as a judge yet.</p>
          </div>
        )}

        {pending.length > 0 && (
          <div className="judge-group">
            <div className="judge-group-title">
              <span className="judge-group-dot orange" />
              Awaiting your verdict
            </div>
            <div className="judge-list">
              {pending.map((item) => {
                const due = deadlinePassed(item);
                return (
                  <div className="judge-item-card" key={item.id}>
                    <div className="judge-item-top">
                      <div className="judge-item-avatar">{(item.creator.slice(0, 2)).toUpperCase()}</div>
                      <div className="judge-item-meta">
                        <strong className="judge-item-goal">{item.description}</strong>
                        <span className="judge-item-sub">
                          From: {item.creator.slice(0, 6)}…{item.creator.slice(-4)} ·{" "}
                          {stroopsToXlm(item.amount).toFixed(0)} XLM staked · Deadline: {formatDeadline(item.deadline)}
                        </span>
                      </div>
                      <span className="mock-badge active">
                        {due ? "Awaiting" : "Not due"}
                      </span>
                    </div>
                    {item.evidenceUrl && (
                      <div style={{ margin: "8px 0", fontSize: 13 }}>
                        📎 Evidence:{" "}
                        <a href={item.evidenceUrl} target="_blank" rel="noreferrer">
                          {item.evidenceUrl}
                        </a>
                      </div>
                    )}
                    <div className="judge-item-actions">
                      <button
                        className="btn btn-secondary verdict-btn verdict-pass"
                        disabled={!due || busyId === item.id}
                        onClick={() => setConfirming({ id: item.id, verdict: "pass" })}
                      >
                        ✓ Pass — return {stroopsToXlm(item.amount).toFixed(0)} XLM
                      </button>
                      <button
                        className="btn verdict-btn verdict-fail"
                        disabled={!due || busyId === item.id}
                        onClick={() => setConfirming({ id: item.id, verdict: "fail" })}
                      >
                        ✗ Fail — send to penalty
                      </button>
                    </div>
                    {!due && (
                      <div className="form-hint" style={{ marginTop: 8 }}>
                        Verdict unlocks after the deadline passes.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {resolved.length > 0 && (
          <div className="judge-group">
            <div className="judge-group-title">
              <span className="judge-group-dot gray" />
              Resolved
            </div>
            <div className="judge-list">
              {resolved.map((item) => (
                <div className="judge-item-card resolved" key={item.id}>
                  <div className="judge-item-top">
                    <div className="judge-item-avatar" style={{ opacity: 0.6 }}>
                      {(item.creator.slice(0, 2)).toUpperCase()}
                    </div>
                    <div className="judge-item-meta">
                      <strong className="judge-item-goal" style={{ opacity: 0.7 }}>{item.description}</strong>
                      <span className="judge-item-sub">
                        From: {item.creator.slice(0, 6)}…{item.creator.slice(-4)} ·{" "}
                        {stroopsToXlm(item.amount).toFixed(0)} XLM · {formatDeadline(item.deadline)}
                      </span>
                    </div>
                    <span className={`mock-badge ${item.outcome ? "pass" : "fail-badge"}`}>
                      {item.outcome ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirming && (
        <div className="modal-overlay" onClick={() => !busyId && setConfirming(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-verdict-icon ${confirming.verdict}`}>
              {confirming.verdict === "pass" ? "✓" : "✗"}
            </div>
            <h3>
              {confirming.verdict === "pass"
                ? "Confirm: Pass this commitment"
                : "Confirm: Fail this commitment"}
            </h3>
            <p>
              {confirming.verdict === "pass"
                ? "The staked XLM will be returned to the committer immediately. This action is irreversible."
                : "The staked XLM will be sent to the penalty address immediately. This action is irreversible."}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirming(null)} disabled={busyId !== null}>
                Cancel
              </button>
              <button
                className={`btn ${confirming.verdict === "pass" ? "btn-secondary" : "btn-fail"}`}
                onClick={confirmVerdict}
                disabled={busyId !== null}
              >
                {busyId === confirming.id
                  ? "Submitting…"
                  : confirming.verdict === "pass"
                  ? "Yes, Pass →"
                  : "Yes, Fail →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}