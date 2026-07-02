import ScrollReveal from "./ScrollReveal";

const chips = [
  "Soroban Smart Contracts",
  "5s Finality",
  "XLM Native",
  "Non-Custodial",
  "Freighter · xBull · Albedo",
];

export default function StellarBar() {
  return (
    <section className="section" id="stellar">
      <div className="container">
        <ScrollReveal>
          <div className="stellar-bar">
            <div className="stellar-bar-copy">
              <div className="eyebrow" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span className="eyebrow-dot"></span>
                Infrastructure
              </div>
              <h2>Built on Stellar. Native speed, near-zero fees.</h2>
              <p>
                Lumenpact runs on Soroban smart contracts — Stellar&apos;s
                EVM-compatible execution layer. Your stake is locked on-chain,
                your judge resolves on-chain, every transfer settles in five
                seconds.
              </p>
              <div className="stellar-chips">
                {chips.map((chip) => (
                  <span className="stellar-chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <a
              href="#"
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              View contracts →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
