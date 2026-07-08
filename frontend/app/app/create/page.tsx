"use client";

import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { createCommitment } from "@/lib/contract";
import type { CreateCommitmentInput } from "@/lib/types";

type Step = 1 | 2 | 3;

const PENALTY_OPTIONS = [
  { id: "burn", label: "Burn address", desc: "Funds are destroyed — max accountability", icon: "🔥" },
  { id: "friend", label: "Friend's wallet", desc: "Send to an address you specify", icon: "👤" },
];

export default function CreateCommitmentPage() {
  const { address, sign, status } = useWallet();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    goal: "",
    deadline: "",
    stake: "",
    judgeAddress: "",
    penaltyType: "burn" as "burn" | "friend",
    penaltyAddress: "",
  });

  const update = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canNext1 = form.goal.trim() && form.deadline && parseFloat(form.stake) > 0;
  const canNext2 =
    form.judgeAddress.trim().startsWith("G") && form.judgeAddress.length > 10;

  async function handleSubmit() {
    if (!address) {
      setError("Connect your wallet first.");
      return;
    }
    if (form.penaltyType === "friend" && !form.penaltyAddress.trim()) {
      setError("Enter the friend's wallet address.");
      return;
    }

    const deadlineUnix = Math.floor(new Date(form.deadline).getTime() / 1000);
    if (!deadlineUnix || Number.isNaN(deadlineUnix)) {
      setError("Invalid deadline.");
      return;
    }

    const input: CreateCommitmentInput = {
      goal: form.goal.trim(),
      deadlineUnix,
      stake: form.stake,
      judge: form.judgeAddress.trim(),
      penaltyType: form.penaltyType,
      penaltyAddress: form.penaltyAddress.trim(),
    };

    setSubmitting(true);
    setError(null);
    try {
      await createCommitment(input, address, sign);
      // The id is assigned sequentially; we don't get it back from submit.
      // Reload the user's commitments to surface the new one.
      setCreatedId(-1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId === -1) {
    return (
      <AppLayout>
        <div className="create-card">
          <div className="review-warning" style={{ borderColor: "#14a060", color: "#14a060" }}>
            ✅ Commitment submitted! Your XLM is now locked in the contract.
          </div>
          <div className="create-actions">
            <a href="/app/my-commitments" className="btn btn-primary">
              View my commitments →
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="create-page">
        <div className="create-steps">
          {[
            { n: 1, label: "Goal & Stake" },
            { n: 2, label: "Judge" },
            { n: 3, label: "Review" },
          ].map(({ n, label }) => (
            <div key={n} className={`create-step${step === n ? " active" : step > n ? " done" : ""}`}>
              <div className="create-step-num">{step > n ? "✓" : n}</div>
              <span>{label}</span>
            </div>
          ))}
          <div className="create-step-track">
            <div className="create-step-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>

        <div className="create-card">
          {step === 1 && (
            <div className="create-form-step">
              <div className="create-step-header">
                <div className="create-step-badge">Step 1 of 3</div>
                <h2>What&apos;s your commitment?</h2>
                <p>Be specific. The blockchain doesn&apos;t accept vague goals.</p>
              </div>

              <div className="form-group">
                <label htmlFor="goal-input">Your goal</label>
                <textarea
                  id="goal-input"
                  className="form-textarea"
                  placeholder="e.g. Publish my first blog post by Sunday at midnight"
                  rows={3}
                  value={form.goal}
                  onChange={(e) => update("goal", e.target.value)}
                />
                <div className="form-hint">Write it as if you&apos;re telling your judge exactly what you&apos;ll do.</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deadline-input">Deadline</label>
                  <input
                    id="deadline-input"
                    type="datetime-local"
                    className="form-input"
                    value={form.deadline}
                    onChange={(e) => update("deadline", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="stake-input">Stake amount (XLM)</label>
                  <div className="form-input-with-suffix">
                    <input
                      id="stake-input"
                      type="number"
                      className="form-input"
                      placeholder="50"
                      min="1"
                      value={form.stake}
                      onChange={(e) => update("stake", e.target.value)}
                    />
                    <span className="form-suffix">XLM</span>
                  </div>
                  <div className="form-hint">Minimum 1 XLM. No platform fee.</div>
                </div>
              </div>

              <div className="form-group">
                <label>If you fail, funds go to…</label>
                <div className="penalty-options">
                  {PENALTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`penalty-option${form.penaltyType === opt.id ? " selected" : ""}`}
                      onClick={() => update("penaltyType", opt.id)}
                    >
                      <span className="penalty-icon">{opt.icon}</span>
                      <div>
                        <strong>{opt.label}</strong>
                        <span>{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {form.penaltyType === "friend" && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="G... (Stellar address)"
                    style={{ marginTop: "12px" }}
                    value={form.penaltyAddress}
                    onChange={(e) => update("penaltyAddress", e.target.value)}
                  />
                )}
              </div>

              <div className="create-actions">
                <button
                  className="btn btn-primary"
                  disabled={!canNext1}
                  onClick={() => setStep(2)}
                >
                  Next: Choose a Judge →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="create-form-step">
              <div className="create-step-header">
                <div className="create-step-badge">Step 2 of 3</div>
                <h2>Nominate your judge.</h2>
                <p>They&apos;ll review your commitment and issue the final verdict.</p>
              </div>

              <div className="judge-explainer">
                <div className="judge-explainer-icon">⚖️</div>
                <div>
                  <strong>What does a judge do?</strong>
                  <p>
                    Your judge will receive a notification in their Lumenpact Judge Inbox.
                    When your deadline passes, they click Pass or Fail. The contract executes
                    immediately — no funds ever pass through their wallet.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="judge-address">Judge&apos;s Stellar address</label>
                <input
                  id="judge-address"
                  type="text"
                  className="form-input"
                  placeholder="G... (public key)"
                  value={form.judgeAddress}
                  onChange={(e) => update("judgeAddress", e.target.value)}
                />
                <div className="form-hint">Ask your judge for their Stellar public key, or have them connect on Lumenpact.</div>
              </div>

              <div className="judge-trust-note">
                <span>🔐</span>
                <span>
                  Choose someone you trust to make an honest call. This person
                  cannot alter the stake — only call Pass or Fail after the
                  deadline.
                </span>
              </div>

              <div className="create-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn btn-primary"
                  disabled={!canNext2}
                  onClick={() => setStep(3)}
                >
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="create-form-step">
              <div className="create-step-header">
                <div className="create-step-badge">Step 3 of 3</div>
                <h2>Review & lock in.</h2>
                <p>Once submitted, this commitment is on-chain and cannot be cancelled before the grace period.</p>
              </div>

              <div className="review-card">
                <div className="review-row">
                  <span className="review-label">Goal</span>
                  <span className="review-value">{form.goal}</span>
                </div>
                <div className="review-divider" />
                <div className="review-row">
                  <span className="review-label">Deadline</span>
                  <span className="review-value">
                    {form.deadline
                      ? new Date(form.deadline).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="review-divider" />
                <div className="review-row">
                  <span className="review-label">Stake</span>
                  <span className="review-value review-value-big">{form.stake} XLM</span>
                </div>
                <div className="review-divider" />
                <div className="review-row">
                  <span className="review-label">Penalty</span>
                  <span className="review-value">
                    {form.penaltyType === "burn" && "🔥 Burn address"}
                    {form.penaltyType === "friend" && `👤 ${form.penaltyAddress || "Not set"}`}
                  </span>
                </div>
                <div className="review-divider" />
                <div className="review-row">
                  <span className="review-label">Judge</span>
                  <span className="review-value review-mono">
                    {form.judgeAddress.slice(0, 8)}...{form.judgeAddress.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="review-warning">
                ⚠️ This transaction is irreversible. Your {form.stake} XLM will be locked in the
                Soroban smart contract until the deadline passes and your judge issues a verdict.
              </div>

              {error && <div className="app-error-banner">{error}</div>}
              {!address && (
                <div className="form-hint">⚠️ {status} — connect your wallet to submit.</div>
              )}

              <div className="create-actions">
                <button className="btn btn-ghost" onClick={() => setStep(2)} disabled={submitting}>← Back</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting || !address}
                >
                  {submitting
                    ? "Submitting…"
                    : `🔒 Lock ${form.stake} XLM — Submit Commitment`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
