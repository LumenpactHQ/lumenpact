export default function CtaSection() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-inner">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            <span className="eyebrow-dot"></span>
            Get started
          </div>
          <h2>
            Make a commitment<br />you can&apos;t back out of.
          </h2>
          <p>
            Lock your XLM. Name your judge. Ship the thing. The contract
            doesn&apos;t care about your excuses.
          </p>
          <div className="cta-actions">
            <a href="#" className="btn btn-primary">
              Create a commitment →
            </a>
            <a href="#" className="btn btn-secondary">
              Read the docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
