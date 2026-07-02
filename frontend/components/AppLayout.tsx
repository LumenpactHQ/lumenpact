"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: "⬡" },
  { href: "/app/create", label: "New Commitment", icon: "✦" },
  { href: "/app/my-commitments", label: "My Commitments", icon: "◈" },
  { href: "/app/judge", label: "Judge Inbox", icon: "⚖" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <Link href="/" className="app-sidebar-logo">
          <Image src="/logo.png" alt="Lumenpact" width={120} height={38} style={{ objectFit: "contain" }} />
        </Link>

        <nav className="app-sidenav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`app-sidenav-item${pathname === item.href ? " active" : ""}`}
            >
              <span className="app-sidenav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-sidebar-bottom">
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "13px", padding: "10px 16px" }}>
            ← Back to site
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        {/* Top bar */}
        <div className="app-topbar">
          <div className="app-topbar-title">
            {navItems.find((n) => n.href === pathname)?.label ?? "App"}
          </div>
          <div className="app-topbar-right">
            <div className="wallet-status">
              <span className="wallet-dot"></span>
              <span className="wallet-address">Not connected</span>
            </div>
            <button className="btn btn-primary" style={{ padding: "9px 20px", fontSize: "13px" }}>
              Connect Wallet
            </button>
          </div>
        </div>

        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
}
