interface FooterProps {
  onNavigate?: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("http")) return;
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <a
            className="brand"
            href="/"
            onClick={(e) => handleLinkClick(e, "/")}
            aria-label="SysMon home"
          >
            <img src="/assets/sysmon-logo.svg" alt="" />
            <span>SysMon</span>
          </a>
          <p>
            An open-source endpoint telemetry and visibility platform for self-hosted
            experimentation and monitoring. Built in Python, FastAPI, Kafka, and ClickHouse.
          </p>
          <span>DEVELOPMENT PROTOTYPE · 118 VERIFIED TESTS · NOT PRODUCTION-READY</span>
        </div>

        <div className="footer-column">
          <span>Product</span>
          <a href="/product" onClick={(e) => handleLinkClick(e, "/product")}>Platform Overview</a>
          <a href="/features" onClick={(e) => handleLinkClick(e, "/features")}>Features Index</a>
          <a href="/architecture" onClick={(e) => handleLinkClick(e, "/architecture")}>Architecture &amp; Diagrams</a>
          <a href="/roadmap" onClick={(e) => handleLinkClick(e, "/roadmap")}>Development Roadmap</a>
        </div>

        <div className="footer-column">
          <span>Documentation</span>
          <a href="/docs" onClick={(e) => handleLinkClick(e, "/docs")}>Docs Home</a>
          <a href="/docs/getting-started/installation" onClick={(e) => handleLinkClick(e, "/docs/getting-started/installation")}>Installation Guide</a>
          <a href="/docs/api-reference/overview" onClick={(e) => handleLinkClick(e, "/docs/api-reference/overview")}>API Reference (30 Routes)</a>
          <a href="/docs/event-schema/overview" onClick={(e) => handleLinkClick(e, "/docs/event-schema/overview")}>Event Schema &amp; Models</a>
          <a href="/docs/security/overview" onClick={(e) => handleLinkClick(e, "/docs/security/overview")}>Security &amp; Privacy</a>
        </div>

        <div className="footer-column">
          <span>Project &amp; Code</span>
          <a href="https://github.com/k-txlha/sysmon" target="_blank" rel="noreferrer">
            GitHub Repository ↗
          </a>
          <a href="https://github.com/k-txlha/sysmon/issues" target="_blank" rel="noreferrer">
            Issue Tracker ↗
          </a>
          <a href="/docs/glossary" onClick={(e) => handleLinkClick(e, "/docs/glossary")}>Glossary &amp; FAQ</a>
          <a href="/docs/contributing/principles" onClick={(e) => handleLinkClick(e, "/docs/contributing/principles")}>Project Principles</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 SysMon · Open-Source Under Active Development</span>
        <span>INSPECT YOUR INFRA BEFORE AN ATTACKER DOES.</span>
      </div>
    </footer>
  );
}

