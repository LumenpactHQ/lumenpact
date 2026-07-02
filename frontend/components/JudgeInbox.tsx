import ScrollReveal from "./ScrollReveal";

const CheckIcon = () => (
  <svg viewBox="0 0 12 12">
    <polyline
      points="1,6 4,9 11,2"
      stroke="#fff"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const features = [
  "Filtered view — only your assigned commitments",
  "One-click Pass or Fail — contract executes immediately",
  "No funds pass through you — all transfers are contract-to-wallet",
  "Evidence review in v1.5 — see proof before you decide",
];

export default function JudgeInbox() {
  return (
    <section className="section">
      <div className="container">
        <div className="split-grid">

          {/* ── Visual ── */}
          <ScrollReveal>
            <div className="shot-wrap brown-shadow" style={{ display: "block" }}>
              <div
                className="shot"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(43,26,19,0.1)",
                  padding: "28px",
                }}
              >
                <div className="eyebrow" style={{ marginBottom: "20px" }}>
                  <span className="eyebrow-dot navy"></span>
                  Judge inbox
                </div>

                {/* Active item */}
                <div
                  style={{
                    border: "1px solid rgba(43,26,19,0.1)",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--ink)",
                          marginBottom: "3px",
                        }}
                      >
                        Run 10km before Sunday
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--gray)" }}>
                        From: Ade · Stakes: 30 XLM · Deadline passed
                      </div>
                    </div>
                    <span className="mock-badge active">Awaiting</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        boxShadow: "3px 3px 0 var(--orange)",
                      }}
                    >
                      ✓ Pass
                    </button>
                    <button
                      className="btn"
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        background: "var(--cream)",
                        color: "var(--ink)",
                        border: "1px solid rgba(43,26,19,0.2)",
                      }}
                    >
                      ✗ Fail
                    </button>
                  </div>
                </div>

                {/* Resolved item */}
                <div
                  style={{
                    border: "1px solid rgba(43,26,19,0.06)",
                    borderRadius: "10px",
                    padding: "16px",
                    opacity: 0.6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--ink)",
                          marginBottom: "3px",
                        }}
                      >
                        Publish blog post by Friday
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--gray)" }}>
                        From: Bola · Stakes: 20 XLM
                      </div>
                    </div>
                    <span className="mock-badge pass">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Copy ── */}
          <ScrollReveal delay={120}>
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot brown"></span>
                For Judges
              </div>
              <h2>A one-click verdict. No grey area.</h2>
              <p style={{ marginTop: "16px", color: "var(--gray)" }}>
                Your Judge Inbox shows every commitment assigned to you — the goal,
                the deadline, the stake, and (in v1.5) the proof they submitted.
                You click Pass or Fail. The contract does the rest.
              </p>

              <ul className="feature-list">
                {features.map((text) => (
                  <li key={text}>
                    <div className="feature-check">
                      <CheckIcon />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
