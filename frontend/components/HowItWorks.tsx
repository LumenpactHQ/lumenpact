import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    icon: "🔒",
    num: "Step 01",
    title: "Create your commitment",
    description:
      "Write your goal, set a deadline, choose your penalty — a friend's wallet or a burn address. Lock your XLM. The contract holds it.",
  },
  {
    icon: "⚖️",
    num: "Step 02",
    title: "Your judge watches",
    description:
      "Nominate someone you trust. They see your goal in their Judge Inbox and review your progress when the deadline arrives.",
  },
  {
    icon: "⚡️",
    num: "Step 03",
    title: "The contract executes",
    description:
      "Judge calls Pass and your XLM comes back in seconds. Judge calls Fail and it goes to your penalty address. No delays. No disputes.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works" style={{ background: "#fff" }}>
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <div className="eyebrow">
              <span className="eyebrow-dot navy"></span>
              The Flow
            </div>
            <h2>Three steps.<br />Real stakes.</h2>
          </div>
        </ScrollReveal>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 100}>
              <div className="step-card">
                <div className="step-icon">{step.icon}</div>
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
