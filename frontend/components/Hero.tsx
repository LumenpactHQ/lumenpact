"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero reveal-section" ref={sectionRef}>
      <div className="container">
        <div className="hero-grid">

          {/* ── Copy ── */}
          <div className="hero-copy reveal-child">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              Built on Stellar · Soroban Smart Contracts
            </div>

            <h1>Your word,<br />on-chain.</h1>

            <p className="sub">
              Lock XLM with a personal goal. Nominate a Judge. Hit your target
              and get it back — or lose it. No excuses are accepted by the
              blockchain.
            </p>

            <div className="hero-actions">
              <a href="/app/create" className="btn btn-primary">Create a commitment →</a>
              <a href="#how-it-works" className="btn btn-ghost">See how it works</a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">0%</span>
                <span className="stat-label">Platform fee</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">5s</span>
                <span className="stat-label">Stellar finality</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Non-custodial</span>
              </div>
            </div>
          </div>

          {/* ── Visual ── */}
          <div className="hero-visual reveal-child" style={{ animationDelay: "0.15s" }}>
            {/* Commitment card mockup */}
            <div className="mock-card-shadow">
              <div className="mock-card">
                <div className="mock-top">
                  <div>
                    <div className="mock-goal">Ship my portfolio site by Friday</div>
                    <div className="mock-meta">
                      <span>⏱️ 3 days left</span>
                      <span>📅 Deadline Jul 4</span>
                    </div>
                  </div>
                  <span className="mock-badge active">Active</span>
                </div>

                <div className="mock-stake-row">
                  <span className="mock-stake-label">Staked amount</span>
                  <span className="mock-stake-amount">50 XLM</span>
                </div>

                <div className="mock-judge-row">
                  <div className="mock-avatar">KA</div>
                  <div className="mock-judge-info">
                    <strong>Kola Adeyemi</strong>
                    <span>Judge · GDKZ...4CXE</span>
                  </div>
                  <span className="mock-badge pass" style={{ marginLeft: "auto" }}>Watching</span>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <div className="hero-float float-in">
              <div className="hero-float-icon">🔥</div>
              <div className="hero-float-text">
                <strong>Commitment passed</strong>
                <span>50 XLM returned · 2 mins ago</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
