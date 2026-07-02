"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "nav-scrolled" : ""}>
      <div className="container">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <Image
              src="/logo.png"
              alt="Lumenpact"
              width={140}
              height={44}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Desktop links */}
          <ul className="nav-links">
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#verification">Verification</a></li>
            <li><a href="#stellar">Built on Stellar</a></li>
          </ul>

          {/* Desktop CTA */}
          <div className="nav-cta">
            <a href="#" className="btn btn-ghost" style={{ padding: "9px 18px", fontSize: "13px" }}>
              View docs
            </a>
            <Link href="/app" className="btn btn-primary" style={{ padding: "9px 18px", fontSize: "13px" }}>
              Launch app →
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={`nav-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-mobile-drawer">
          <ul>
            <li><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a></li>
            <li><a href="#verification" onClick={() => setMenuOpen(false)}>Verification</a></li>
            <li><a href="#stellar" onClick={() => setMenuOpen(false)}>Built on Stellar</a></li>
          </ul>
          <div className="nav-mobile-cta">
            <a href="#" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
              View docs
            </a>
            <Link
              href="/app"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setMenuOpen(false)}
            >
              Launch app →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
