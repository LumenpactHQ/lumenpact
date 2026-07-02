import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "GitHub", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Stellar Explorer", href: "#" },
  { label: "MIT License", href: "#" },
];

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div>
            <Link href="/" className="logo" style={{ marginBottom: "6px", display: "inline-flex" }}>
              <Image
                src="/logo.png"
                alt="Lumenpact"
                width={110}
                height={34}
                style={{ objectFit: "contain" }}
              />
            </Link>
            <div className="footer-copy" style={{ marginTop: "4px" }}>
              by LumenpactHQ · Built on Stellar
            </div>
          </div>

          <ul className="footer-links">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
