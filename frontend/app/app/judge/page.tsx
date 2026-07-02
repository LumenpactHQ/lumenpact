"use client";

import AppLayout from "@/components/AppLayout";
import { useState } from "react";

type Verdict = "pass" | "fail" | null;

interface JudgeItem {
  id: string;
  goal: string;
  from: string;
  fromInitials: string;
  stake: number;
  deadline: string;
  status: "awaiting" | "resolved";
  verdict?: "pass" | "fail";
}

const MOCK_ITEMS: JudgeItem[] = [
  {
    id: "1",
    goal: "Run 10km before Sunday morning",
    from: "Ade Okafor",
    fromInitials: "AO",
    stake: 30,
    deadline: "Jun 29, 2026 · 09:00",
    status: "awaiting",
  },
  {
    id: "2",
    goal: "Ship the v1 Lumenpact frontend by Wednesday",
    from: "Joel Don",
    fromInitials: "JD",
    stake: 100,
    deadline: "Jul 2, 2026 · 23:59",
    status: "awaiting",
  },
  {
    id: "3",
    goal: "Publish blog post by Friday",
    from: "Bola Taiwo",
    fromInitials: "BT",
    stake: 20,
    deadline: "Jun 27, 2026 · 17:00",
    status: "resolved",
    verdict: "pass",
  },
  {
    id: "4",
    goal: "Read 50 pages of Atomic Habits",
    from: "Kemi Ade",
    fromInitials: "KA",
    stake: 15,
    deadline: "Jun 25, 2026 · 20:00",
    status: "resolved",
    verdict: "fail",
  },
];

export default function JudgeInboxPage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [confirming, setConfirming] = useState<{ id: string; verdict: Verdict } | null>(null);

  const pending = items.filter((i) => i.status === "awaiting");
  const resolved = items.filter((i) => i.status === "resolved");

  const handleVerdict = (id: string, verdict: "pass" | "fail") => {
    setConfirming({ id, verdict });
  };

  const confirmVerdict = () => {
    if (!confirming) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === confirming.id
          ? { ...item, status: "resolved", verdict: confirming.verdict! }
          : item
      )
    );
    setConfirming(null);
  };

  return (
    <AppLayout>
      <div className="judge-page">

        {/* Summary bar */}
        <div className="judge-summary-bar">
          <div className="judge-summary-item">
            <span className="judge-summary-num judge-summary-orange">{pending.length}</span>
            <span>Awaiting verdict</span>
          </div>
          <div className="judge-summary-item">
            <span className="judge-summary-num judge-summary-green">{resolved.filter((r) => r.verdict === "pass").length}</span>
            <span>Passed</span>
          </div>
          <div className="judge-summary-item">
            <span className="judge-summary-num judge-summary-red">{resolved.filter((r) => r.verdict === "fail").length}</span>
            <span>Failed</span>
          </div>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div className="judge-group">
            <div className="judge-group-title">
              <span className="judge-group-dot orange" />
              Awaiting your verdict
            </div>
            <div className="judge-list">
              {pending.map((item) => (
                <div className="judge-item-card" key={item.id}>
                  <div className="judge-item-top">
                    <div className="judge-item-avatar">{item.fromInitials}</div>
                    <div className="judge-item-meta">
                      <strong className="judge-item-goal">{item.goal}</strong>
                      <span className="judge-item-sub">
                        From: {item.from} · {item.stake} XLM staked · Deadline: {item.deadline}
                      </span>
                    </div>
                    <span className="mock-badge active">Awaiting</span>
                  </div>
                  <div className="judge-item-actions">
                    <button
                      className="btn btn-secondary verdict-btn verdict-pass"
                      onClick={() => handleVerdict(item.id, "pass")}
                    >
                      ✓ Pass — return {item.stake} XLM
                    </button>
                    <button
                      className="btn verdict-btn verdict-fail"
                      onClick={() => handleVerdict(item.id, "fail")}
                    >
                      ✗ Fail — send to penalty
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty pending state */}
        {pending.length === 0 && (
          <div className="judge-empty">
            <div className="judge-empty-icon">✅</div>
            <strong>All caught up!</strong>
            <p>No commitments awaiting your verdict right now.</p>
          </div>
        )}

        {/* Resolved */}
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
                    <div className="judge-item-avatar" style={{ opacity: 0.6 }}>{item.fromInitials}</div>
                    <div className="judge-item-meta">
                      <strong className="judge-item-goal" style={{ opacity: 0.7 }}>{item.goal}</strong>
                      <span className="judge-item-sub">
                        From: {item.from} · {item.stake} XLM · {item.deadline}
                      </span>
                    </div>
                    <span className={`mock-badge ${item.verdict === "pass" ? "pass" : "fail-badge"}`}>
                      {item.verdict === "pass" ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="modal-overlay" onClick={() => setConfirming(null)}>
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
              <button className="btn btn-ghost" onClick={() => setConfirming(null)}>Cancel</button>
              <button
                className={`btn ${confirming.verdict === "pass" ? "btn-secondary" : "btn-fail"}`}
                onClick={confirmVerdict}
              >
                {confirming.verdict === "pass" ? "Yes, Pass →" : "Yes, Fail →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
