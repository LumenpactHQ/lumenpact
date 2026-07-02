import AppLayout from "@/components/AppLayout";
import Link from "next/link";

interface Commitment {
  id: string;
  goal: string;
  stake: number;
  deadline: string;
  daysLeft: number | null;
  judge: string;
  judgeInitials: string;
  status: "active" | "passed" | "failed" | "expired";
}

const MOCK_COMMITMENTS: Commitment[] = [
  {
    id: "1",
    goal: "Ship the v1 Lumenpact frontend by Wednesday",
    stake: 100,
    deadline: "Jul 2, 2026",
    daysLeft: 0,
    judge: "Kola Adeyemi",
    judgeInitials: "KA",
    status: "active",
  },
  {
    id: "2",
    goal: "Read 2 chapters of Designing Data-Intensive Applications",
    stake: 25,
    deadline: "Jul 6, 2026",
    daysLeft: 4,
    judge: "Joel Don",
    judgeInitials: "JD",
    status: "active",
  },
  {
    id: "3",
    goal: "Complete 30-day no-sugar challenge",
    stake: 50,
    deadline: "Jun 30, 2026",
    daysLeft: null,
    judge: "Bola Taiwo",
    judgeInitials: "BT",
    status: "passed",
  },
  {
    id: "4",
    goal: "Finish online piano course module 3",
    stake: 20,
    deadline: "Jun 15, 2026",
    daysLeft: null,
    judge: "Ade Okafor",
    judgeInitials: "AO",
    status: "failed",
  },
];

const STATUS_CONFIG = {
  active: { label: "Active", cls: "active", emoji: "🔒" },
  passed: { label: "Passed", cls: "pass", emoji: "✅" },
  failed: { label: "Failed", cls: "fail-badge", emoji: "❌" },
  expired: { label: "Expired", cls: "expired", emoji: "⌛" },
};

export default function MyCommitmentsPage() {
  const active = MOCK_COMMITMENTS.filter((c) => c.status === "active");
  const history = MOCK_COMMITMENTS.filter((c) => c.status !== "active");

  return (
    <AppLayout>
      <div className="commitments-page">

        {/* Header action */}
        <div className="commitments-header">
          <div>
            <div className="commitments-count">{active.length} active commitment{active.length !== 1 ? "s" : ""}</div>
            <p style={{ color: "var(--gray)", fontSize: "14px", marginTop: "4px" }}>
              Showing all goals you&apos;ve locked XLM on
            </p>
          </div>
          <Link href="/app/create" className="btn btn-primary">
            + New commitment
          </Link>
        </div>

        {/* Active commitments */}
        {active.length > 0 && (
          <div className="commitments-group">
            <div className="commitments-group-title">Active</div>
            <div className="commitments-list">
              {active.map((c) => (
                <div className="commitment-card" key={c.id}>
                  <div className="commitment-card-top">
                    <div className="commitment-card-main">
                      <div className="commitment-goal">{c.goal}</div>
                      <div className="commitment-meta">
                        <span>📅 {c.deadline}</span>
                        {c.daysLeft !== null && (
                          <span className={`commitment-days${c.daysLeft === 0 ? " urgent" : ""}`}>
                            {c.daysLeft === 0 ? "⚠️ Due today" : `⏱️ ${c.daysLeft} days left`}
                          </span>
                        )}
                        <span>⚖️ Judge: {c.judge}</span>
                      </div>
                    </div>
                    <div className="commitment-card-right">
                      <span className={`mock-badge ${STATUS_CONFIG[c.status].cls}`}>
                        {STATUS_CONFIG[c.status].label}
                      </span>
                      <div className="commitment-stake">{c.stake} XLM</div>
                      <div className="commitment-stake-label">staked</div>
                    </div>
                  </div>

                  {/* Progress bar placeholder */}
                  <div className="commitment-progress-wrap">
                    <div
                      className="commitment-progress-bar"
                      style={{ width: c.daysLeft === 0 ? "95%" : "60%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {active.length === 0 && (
          <div className="commitments-empty">
            <div className="commitments-empty-icon">🔒</div>
            <strong>No active commitments</strong>
            <p>Create your first commitment to lock XLM on a goal.</p>
            <Link href="/app/create" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Create a commitment →
            </Link>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="commitments-group">
            <div className="commitments-group-title">History</div>
            <div className="commitments-list">
              {history.map((c) => (
                <div className="commitment-card resolved" key={c.id}>
                  <div className="commitment-card-top">
                    <div className="commitment-card-main">
                      <div className="commitment-goal" style={{ opacity: 0.7 }}>{c.goal}</div>
                      <div className="commitment-meta">
                        <span>📅 {c.deadline}</span>
                        <span>⚖️ {c.judge}</span>
                      </div>
                    </div>
                    <div className="commitment-card-right">
                      <span className={`mock-badge ${STATUS_CONFIG[c.status].cls}`}>
                        {STATUS_CONFIG[c.status].emoji} {STATUS_CONFIG[c.status].label}
                      </span>
                      <div className="commitment-stake" style={{ opacity: 0.6 }}>{c.stake} XLM</div>
                      <div className="commitment-stake-label">{c.status === "passed" ? "returned" : "forfeited"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
