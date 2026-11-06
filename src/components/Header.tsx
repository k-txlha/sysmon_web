import { useState } from "react";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 16 16"
      fill="none"
    >
      {diagonal ? (
        <path d="M4 12 12 4M5 4h7v7" />
      ) : (
        <path d="M2.5 8h10m-4-4 4 4-4 4" />
      )}
    </svg>
  );
}

interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Header({ currentPath = "/", onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    setMenuOpen(false);
    if (path.startsWith("http")) return; // external link
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const navItems = [
    { label: "Product", path: "/product" },
    { label: "Features", path: "/features" },
    { label: "Architecture", path: "/architecture" },
    { label: "Roadmap", path: "/roadmap" },
    { label: "Documentation", path: "/docs" },
    { label: "GitHub", path: "https://github.com/k-txlha/sysmon" },
  ];

  return (
    <header className="site-header" id="top">
      <a
        className="brand"
        href="/"
        onClick={(e) => handleLinkClick(e, "/")}
        aria-label="SysMon home"
      >
        <img src="/assets/sysmon-logo.svg" alt="" />
        <span>SysMon</span>
      </a>

      <button
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        className={`menu-toggle${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
      >
        <span />
        <span />
      </button>

      <nav className={`main-nav${menuOpen ? " nav-open" : ""}`} aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={isActive ? "is-active" : ""}
              target={item.path.startsWith("http") ? "_blank" : undefined}
              rel={item.path.startsWith("http") ? "noreferrer" : undefined}
              onClick={(e) => handleLinkClick(e, item.path)}
            >
              {item.label}
              {item.path.startsWith("http") && <span className="nav-external"> ↗</span>}
            </a>
          );
        })}
      </nav>

      <div className="header-action">
        <a
          className="button"
          href="/docs/getting-started/installation"
          onClick={(e) => handleLinkClick(e, "/docs/getting-started/installation")}
        >
          Get Started <Arrow diagonal />
        </a>
      </div>
    </header>
  );
}

