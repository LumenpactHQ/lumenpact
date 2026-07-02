import ScrollReveal from "./ScrollReveal";

const tiers = [
  {
    className: "tier-card v1",
    label: "Version 1",
    tag: "Live now",
    title: "Trusted Judge",
    description:
      "You nominate someone you know. They review the commitment and click Pass or Fail. No proof required — social trust is the mechanism.",
    bestFor: "Personal goals, habits, writing deadlines, fitness targets",
    borderStyle: { borderTop: "1px solid rgba(232,86,43,0.15)" },
  },
  {
    className: "tier-card v15",
    label: "Version 1.5",
    tag: "Coming next",
    title: "Evidence + Review",
    description:
      "You submit proof before the judge resolves — a photo, a link, a Strava activity. The URL is stored on-chain. Your judge decides with full context.",
    bestFor: "Public commitments, larger stakes, auditable outcomes",
    borderStyle: { borderTop: "1px solid rgba(22,35,58,0.1)" },
  },
  {
    className: "tier-card v2",
    label: "Version 2",
    tag: "Roadmap",
    title: "Oracle Verification",
    description:
      "For goals with a verifiable external signal — Strava, GitHub, Readwise — an oracle reads the API, posts the result on-chain, and the contract resolves automatically.",
    bestFor: "Training goals, coding streaks, reading targets, measurable output",
    borderStyle: { borderTop: "1px solid rgba(123,69,48,0.12)" },
  },
];

export default function VerificationTiers() {
  return (
    <section className="section" id="verification" style={{ background: "#fff" }}>
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              Goal Verification
            </div>
            <h2>
              Trust that scales with<br />your ambition.
            </h2>
            <p style={{ marginTop: "16px", color: "var(--gray)", fontSize: "17px" }}>
              Lumenpact starts with social trust and gets more verifiable over
              time. No oracle required to launch — your judge is your oracle.
            </p>
          </div>
        </ScrollReveal>

        <div className="tiers-grid">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.label} delay={i * 100}>
              <div className={tier.className} style={{ height: "100%" }}>
                <div className="tier-label">{tier.label}</div>
                <span className="tier-tag">{tier.tag}</span>
                <h3>{tier.title}</h3>
                <p>{tier.description}</p>
                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "16px",
                    ...tier.borderStyle,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--gray)",
                      fontWeight: 500,
                      marginBottom: "6px",
                    }}
                  >
                    Best for
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--ink)" }}>
                    {tier.bestFor}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
