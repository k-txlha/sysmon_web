import { useState } from "react";

const chartBars = [
  20, 29, 24, 35, 29, 39, 27, 44, 34, 41, 28, 48, 36, 44, 39, 52, 33, 48,
  42, 59, 38, 51, 45, 61, 43, 55, 48, 66, 45, 58, 51, 72, 48, 63, 54, 75,
  57, 68, 61, 80, 57, 72, 64, 86, 62, 78, 70, 91, 67, 83, 75, 96,
];

const pillars = [
  {
    number: "01",
    icon: "/assets/monitor.svg",
    title: "Endpoint Visibility",
    description:
      "Understand process execution, parent-child relationships, and the endpoint information behind each event.",
    note: "PROCESSES / EXECUTION / HOSTS",
  },
  {
    number: "02",
    icon: "/assets/database.svg",
    title: "Centralized Telemetry",
    description:
      "Bring normalized events into a consistent structure that is easier to query, explore, and investigate.",
    note: "COLLECT / NORMALIZE / EXPLORE",
  },
  {
    number: "03",
    icon: "/assets/shield-check.svg",
    title: "Threat Awareness",
    description:
      "Make suspicious activity visible, with a foundation for custom detection rules and centralized alerting.",
    note: "OBSERVE / INVESTIGATE / RESPOND",
  },
];

const features = [
  {
    number: "01",
    title: "Process Monitoring",
    status: "IN DEVELOPMENT",
    description:
      "See what executes: process IDs, command lines, executable paths, and parent-child relationships.",
    diagram: ["explorer.exe · 2816", "└─ powershell.exe · 4820"],
    note: "PROCESS / EXEC / LINEAGE",
    size: "feature-wide",
  },
  {
    number: "02",
    title: "Endpoint Inventory",
    status: "IN DEVELOPMENT",
    description:
      "Keep endpoint identities, operating systems, agent status, and last check-ins in one view.",
    diagram: ["DEV-WORKSTATION-01", "● Online  /  Windows 11"],
    note: "HOST / IDENTITY / HEALTH",
    size: "feature-top-small",
  },
  {
    number: "03",
    title: "Persistence Monitoring",
    status: "PLANNED SCOPE",
    description:
      "Inspect scheduled tasks, startup entries, services, and cron activity for unexpected changes.",
    diagram: ["schedule → task change", "startup → new entry"],
    note: "TASKS / SERVICES / CRON",
    size: "",
  },
  {
    number: "04",
    title: "File Integrity Monitoring",
    status: "PLANNED SCOPE",
    description:
      "Track important directory changes and retain context for investigating modified files.",
    diagram: ["/etc/cron.d/demo-task", "modified · 09:40:09 UTC"],
    note: "PATH / CHANGE / CONTEXT",
    size: "",
  },
  {
    number: "05",
    title: "Event Collection",
    status: "IN DEVELOPMENT",
    description:
      "Collect system activity into a consistent, structured event schema for downstream exploration.",
    diagram: ["{ host.id, event.type,", "  process.name, timestamp }"],
    note: "COLLECT / VALIDATE / NORMALIZE",
    size: "",
  },
  {
    number: "06",
    title: "Centralized Investigation",
    status: "IN DEVELOPMENT",
    description:
      "Follow activity across endpoints with unified event exploration and connected record details.",
    diagram: ["host.id = HOST-001", "↳ process execution · 09:41"],
    note: "SEARCH / FILTER / CORRELATE",
    size: "feature-medium",
  },
  {
    number: "07",
    title: "Custom Detection Rules",
    status: "PLANNED SCOPE",
    description:
      "Build a foundation for rules that surface suspicious behavior with clear, inspectable context.",
    diagram: ["event → condition match", "        → review signal"],
    note: "RULE / CONDITION / SIGNAL",
    size: "feature-bottom-main",
  },
  {
    number: "08",
    title: "Alerting",
    status: "PLANNED SCOPE",
    description:
      "Bring alerts into a central queue. Notification integrations are a future direction, not a current promise.",
    diagram: ["03 critical / 07 high", "12 medium · demo queue"],
    note: "DETECT / TRIAGE / REVIEW",
    size: "feature-bottom-small",
  },
];

const processes = [
  { time: "09:41:12", host: "DEV-WORKSTATION-01", process: "powershell.exe", level: "Critical" },
  { time: "09:40:58", host: "UBUNTU-NODE-04", process: "python.exe", level: "Info" },
  { time: "09:40:46", host: "HOST-002", process: "sshd", level: "High" },
  { time: "09:40:31", host: "HOST-001", process: "explorer.exe", level: "Info" },
];

const endpointRows = [
  ["DEV-WORKSTATION-01", "Windows 11", "Online", "09:41:12"],
  ["PROD-SERVER-12", "Ubuntu 22.04", "Online", "09:41:03"],
  ["UBUNTU-NODE-04", "Ubuntu 24.04", "Online", "09:40:58"],
  ["HR-EMPLOYEE-07", "Windows 11", "Offline", "08:12:16"],
];

const pipeline = ["Endpoint Agent", "API Gateway", "Event Processing", "Storage", "Dashboard"];

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

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand${light ? " brand-light" : ""}`} href="#top" aria-label="SysMon home">
      <img src="/assets/sysmon-logo.svg" alt="" />
      <span>SysMon</span>
    </a>
  );
}

function Button({
  href,
  children,
  secondary = false,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  light?: boolean;
}) {
  return (
    <a
      className={`button${secondary ? " button-secondary" : ""}${light ? " button-light" : ""}`}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header" id="top">
      <Brand />
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
        <a href="#product" onClick={closeMenu}>Product</a>
        <a href="#features" onClick={closeMenu}>Features</a>
        <a href="#architecture" onClick={closeMenu}>Architecture</a>
        <a href="/docs" onClick={closeMenu}>Documentation</a>
        <a href="#community" onClick={closeMenu}>GitHub</a>
      </nav>
      <div className="header-action">
        <Button href="#community">Get Started <Arrow diagonal /></Button>
      </div>
    </header>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label">{children}</p>;
}

function DashboardFrame({ mode = "dark" }: { mode?: "dark" | "light" }) {
  const isDark = mode === "dark";
  const nav = ["Overview", "Endpoints", "Events", "Alerts"];

  return (
    <div className={`dashboard-frame ${isDark ? "dashboard-dark" : "dashboard-light"}`}>
      <div className="dashboard-topbar">
        <div className="dashboard-brand">
          <img className="mini-mark" src="/assets/sysmon-logo.svg" alt="" />
          <b>SysMon</b>
          <span className="dashboard-divider">/</span>
          <span>DEMO</span>
        </div>
        <span>06 NOV 2026 / 09:42 UTC</span>
      </div>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <span className="workspace-caption">WORKSPACE</span>
          {nav.map((item, index) => (
            <span className={`side-nav-item${index === 0 ? " active" : ""}`} key={item}>
              {item}
            </span>
          ))}
          <p>In development<br />Fictional telemetry</p>
        </aside>
        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <h3>Security Overview</h3>
              <p>FICTIONAL TELEMETRY · LAST 24H</p>
            </div>
            <img src="/assets/list-filter.svg" alt="" />
          </div>
          <div className="metric-grid">
            {[
              ["128", "Endpoints"],
              ["124", "Online"],
              ["4", "Offline"],
              ["1.28M", "Events / 24h"],
            ].map(([value, label]) => (
              <div className="metric" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="alert-strip">
            <span><i />3 critical alerts</span>
            <small>96.9% online</small>
          </div>
          <div className="activity-chart">
            <div className="chart-heading">
              <span>Process &amp; system activity</span>
              <small>EVENTS / 15 MIN</small>
            </div>
            <div className="chart-legend">
              <span><i className="legend-process" />Process</span>
              <span><i className="legend-system" />System</span>
            </div>
            <div className="chart-bars" aria-label="Illustrative process and system event volume chart">
              {chartBars.map((height, index) => (
                <span className="chart-bar-group" key={index}>
                  <i style={{ height: `${height * 0.38}%` }} />
                  <i style={{ height: `${height * 0.63}%` }} />
                </span>
              ))}
            </div>
            <div className="chart-axis"><span>09:42</span><span>15:42</span><span>21:42</span><span>03:42</span><span>09:42</span></div>
          </div>
          <div className="recent-events">
            <div className="recent-heading"><span>Recent security events</span><small>UTC</small></div>
            {processes.slice(0, isDark ? 2 : 3).map((event) => (
              <div className="event-row" key={`${event.time}-${event.host}`}>
                <span>{event.time}</span>
                <div><b>{event.process}</b><small>{event.host}</small></div>
                <em className={`severity severity-${event.level.toLowerCase()}`}>{event.level}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="dashboard-footnote">DESIGN DEMO / PRODUCT IN DEVELOPMENT</div>
    </div>
  );
}

function EndpointScreen() {
  return (
    <div className="app-window app-window-light">
      <div className="window-titlebar"><div className="dashboard-brand"><img className="mini-mark" src="/assets/sysmon-logo.svg" alt="" /><b>SysMon</b><span>/ DEMO</span></div><span>06 NOV 2026 / 09:42 UTC</span></div>
      <div className="window-layout">
        <aside className="window-sidebar"><span>WORKSPACE</span><b>Overview</b><b className="selected">Endpoints</b><b>Events</b><b>Alerts</b><small>In development</small></aside>
        <div className="window-content">
          <div className="screen-title"><div><h3>Endpoint Explorer</h3><span>FICTIONAL TELEMETRY · LAST 24H</span></div><img src="/assets/list-filter.svg" alt="" /></div>
          <div className="search-field"><img src="/assets/search.svg" alt="" /><span>Search hostname or host ID...</span></div>
          <p className="result-count">128 total · 124 online · 4 offline</p>
          <div className="data-table">
            <div className="table-head"><span>ENDPOINT / HOST ID</span><span>OPERATING SYSTEM</span><span>STATUS</span><span>CHECK-IN UTC</span></div>
            {endpointRows.map((row) => (
              <div className="table-row" key={row[0]}>
                <span><b>{row[0]}</b><small>HOST-{row[0].slice(-3)} · 10.24.1.1</small></span><span>{row[1]}</span>
                <span><i className={`status-dot ${row[2] === "Offline" ? "offline" : ""}`} />{row[2]}</span><span>{row[3]}</span>
              </div>
            ))}
          </div>
          <div className="endpoint-detail"><b>DEV-WORKSTATION-01 / HOST-001</b><span>Windows 11 · 10.24.41.1 · Agent connected</span><span>CPU 18% / Memory 42% · Last check-in 09:41:12 UTC</span></div>
        </div>
      </div>
      <div className="window-footnote">DESIGN DEMO / PRODUCT IN DEVELOPMENT</div>
    </div>
  );
}

function EventScreen() {
  return (
    <div className="app-window app-window-light event-window">
      <div className="window-titlebar"><div className="dashboard-brand"><img className="mini-mark" src="/assets/sysmon-logo.svg" alt="" /><b>SysMon</b><span>/ DEMO</span></div><span>06 NOV 2026 / 09:42 UTC</span></div>
      <div className="window-layout">
        <aside className="window-sidebar"><span>WORKSPACE</span><b>Overview</b><b>Endpoints</b><b className="selected">Events</b><b>Alerts</b><small>In development</small></aside>
        <div className="window-content">
          <div className="screen-title"><div><h3>Event Explorer</h3><span>FICTIONAL TELEMETRY · LAST 24H</span></div><img src="/assets/list-filter.svg" alt="" /></div>
          <div className="search-field"><img src="/assets/search.svg" alt="" /><span>Search process, event type, or host ID...</span></div>
          <p className="result-count">Last 24h · 18,421 events · 3 critical</p>
          <div className="data-table events-table">
            <div className="table-head"><span>TIME UTC</span><span>HOST ID</span><span>PROCESS</span><span>SEVERITY</span></div>
            {processes.map((event) => (
              <div className="table-row" key={`${event.time}-${event.process}`}><span>{event.time}</span><span>HOST-001</span><span>{event.process}</span><span><em className={`severity severity-${event.level.toLowerCase()}`}>{event.level}</em></span></div>
            ))}
          </div>
          <div className="event-detail"><b>Event detail / EVT-08421</b><span>powershell.exe · PID 4820</span><span>Parent: explorer.exe / PID 2816</span><span>User: DEV-WORKSTATION-01</span><span>Command: powershell -NoProfile -EncodedCommand [demo]</span></div>
        </div>
      </div>
      <div className="window-footnote">DESIGN DEMO / PRODUCT IN DEVELOPMENT</div>
    </div>
  );
}

function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <SectionLabel>ENDPOINT SECURITY / SYSTEM VISIBILITY</SectionLabel>
          <h1>Know what’s happening across your infrastructure.</h1>
          <p className="hero-description">
            Monitor endpoint activity, understand system behavior, and identify
            suspicious processes with a lightweight security monitoring platform
            designed for growing teams.
          </p>
          <div className="hero-actions">
            <Button href="#community">Get Started <Arrow diagonal /></Button>
            <Button href="#product" secondary>Explore the Platform</Button>
          </div>
          <p className="hero-status">IN DEVELOPMENT · OPEN-SOURCE-FIRST<br /><span>An early look at the platform we’re building.</span></p>
        </div>
        <div className="hero-visual">
          <DashboardFrame />
        </div>
      </section>
      <div className="platform-meta">
        <span>Endpoint Monitoring · Real-time Telemetry · Centralized Visibility</span>
        <small>SYSMON / PLATFORM NOTES 001</small>
      </div>
    </>
  );
}

function ProductOverview() {
  return (
    <section className="section product-section" id="product">
      <div className="section-intro">
        <SectionLabel>01 / THE PLATFORM</SectionLabel>
        <h2>Security starts with visibility.</h2>
        <p>
          Understanding what runs across your infrastructure is the first step
          towards securing it. SysMon collects endpoint telemetry and organizes
          it into a centralized view, helping teams understand system activity
          and investigate suspicious behavior.
        </p>
      </div>
      <div className="pillar-grid">
        {pillars.map((pillar) => (
          <article className="pillar-card" key={pillar.number}>
            <div className="pillar-top"><span className="mono-label">{pillar.number}</span><img src={pillar.icon} alt="" /></div>
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
            <span className="mono-note">{pillar.note}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeatureSpecifications() {
  return (
    <section className="section feature-section" id="features">
      <div className="section-intro">
        <SectionLabel>02 / CAPABILITY INDEX</SectionLabel>
        <h2>The detail behind the signal.</h2>
        <p>
          A practical toolkit for endpoint visibility. The platform is in
          development; planned capabilities below describe the direction, not a
          production-ready feature set.
        </p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article className={`feature-card ${feature.size}`} key={feature.number}>
            <div className="feature-top"><span className="mono-label">{feature.number}</span><span className="availability">{feature.status}</span></div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className="feature-diagram">{feature.diagram.map((line) => <span key={line}>{line}</span>)}</div>
            <span className="mono-note">{feature.note}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductShowcase() {
  return (
    <section className="showcase-section">
      <div className="showcase-inner">
        <div className="showcase-intro">
          <SectionLabel>03 / INSIDE SYSMON</SectionLabel>
          <h2>Your infrastructure. One place to understand it.</h2>
          <p>Bring endpoint activity, system telemetry, and security events together in a single operational view.</p>
        </div>
        <div className="showcase-list">
          <article className="showcase-item">
            <div className="showcase-copy">
              <SectionLabel>SCREEN 01</SectionLabel>
              <h3>Security Overview</h3>
              <p>Start with the whole picture. Review fleet health, event volume, critical alerts, and recent activity in one operational view.</p>
              <ul><li>128 endpoints / 124 online / 4 offline</li><li>1.28M events in the demo window</li><li>3 critical alerts to investigate</li></ul>
            </div>
            <DashboardFrame />
          </article>
          <article className="showcase-item">
            <div className="showcase-copy">
              <SectionLabel>SCREEN 02</SectionLabel>
              <h3>Endpoint Explorer</h3>
              <p>Move from fleet to host. Explore endpoint identities, agent status, last check-in, and CPU and memory context.</p>
              <ul><li>Filter by system, state, or identity</li><li>Inspect host-level context</li><li>Keep check-ins in view</li></ul>
            </div>
            <EndpointScreen />
          </article>
          <article className="showcase-item">
            <div className="showcase-copy">
              <SectionLabel>SCREEN 03</SectionLabel>
              <h3>Event Explorer</h3>
              <p>Find the event. Keep its context. Search structured telemetry and inspect the process, host, and severity behind a signal.</p>
              <ul><li>Timestamp / host ID / event type</li><li>Process context and severity</li><li>Selected-event detail drawer</li></ul>
            </div>
            <EventScreen />
          </article>
        </div>
        <p className="showcase-footnote">ILLUSTRATIVE PRODUCT DIRECTION / ALL TELEMETRY IS FICTIONAL / NOT A PRODUCTION SCREENSHOT</p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Endpoint Agent", "A lightweight agent collects endpoint activity close to the source."],
    ["02", "Secure Communication", "Authenticated, encrypted connections carry telemetry to the platform."],
    ["03", "Event Processing", "Events are validated, normalized, and ingested into a consistent structure."],
    ["04", "Centralized Visibility", "Monitor the fleet, explore records, and investigate system behavior."],
  ];

  return (
    <section className="section flow-section">
      <div className="section-intro">
        <SectionLabel>04 / TELEMETRY LIFECYCLE</SectionLabel>
        <h2>From endpoint activity to actionable visibility.</h2>
      </div>
      <div className="flow-steps">
        {steps.map(([number, title, description]) => (
          <article className="flow-step" key={number}>
            <span className="mono-label">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <div className="pipeline">
        <p>DESIGNED DATA FLOW / PLANNED</p>
        <div className="pipeline-steps">
          {pipeline.map((item, index) => (
            <div className="pipeline-part" key={item}>
              <span>{item}</span>
              {index < pipeline.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  const architecture = [
    ["01 / COLLECT", "Endpoint agent", "Python", "System telemetry", "Collect endpoint events at the source."],
    ["02 / RECEIVE", "API & backend", "Python / FastAPI", "AsyncIO", "Authenticate, validate, and ingest."],
    ["03 / BUFFER", "Messaging", "Apache Kafka", "Valkey", "Decouple collection from processing."],
    ["04 / RETAIN", "Storage", "ClickHouse", "SQLite · initial admin", "Separate telemetry from administration."],
  ];

  return (
    <section className="section architecture-section" id="architecture">
      <div className="section-intro">
        <SectionLabel>05 / ENGINEERING NOTES</SectionLabel>
        <h2>Engineered for structured, scalable telemetry.</h2>
        <p>
          Clear boundaries between collection, transport, processing, and
          storage. This is the architecture we’re working toward—not a list of
          deployed capabilities.
        </p>
      </div>
      <div className="architecture-panel">
        <div className="architecture-heading"><span>PLANNED ARCHITECTURE</span><span>DESIGN DIRECTION / 2026</span></div>
        <div className="architecture-flow">
          {architecture.map(([number, title, primary, secondary, description], index) => (
            <article className="architecture-card" key={title}>
              <span className="mono-label">{number}</span>
              <h3>{title}</h3>
              <code>{primary}</code>
              <code className="architecture-secondary">{secondary}</code>
              <p>{description}</p>
              {index < architecture.length - 1 && <span className="architecture-arrow"><Arrow /></span>}
            </article>
          ))}
        </div>
        <p className="architecture-outcome"><span>↳</span> Structured telemetry → Dashboard / exploration / investigation</p>
        <div className="infrastructure-layer">
          <span>INFRASTRUCTURE LAYER</span>
          <code>Docker / Caddy reverse proxy / TLS</code>
          <p>Containerized services with an authenticated, encrypted entry point.</p>
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <>
      <section className="community-section" id="community">
        <div className="community-copy">
          <SectionLabel>06 / OPEN BY INTENT</SectionLabel>
          <h2>Security tools should be accessible.</h2>
          <p>
            SysMon is being built with an open-source-first philosophy. Our goal
            is to make meaningful endpoint visibility more accessible to
            startups and growing teams that need practical security monitoring
            without enterprise-level complexity.
          </p>
          <Button href="/docs" secondary>View Documentation</Button>
        </div>
        <aside className="community-card">
          <div className="community-card-top"><img src="/assets/git-branch.svg" alt="" /><span>WORK IN PROGRESS</span></div>
          <h3>Built in the open.<br />Better with perspective.</h3>
          <p>Ideas, feedback, and future contributions can help shape a practical tool for smaller teams. Contribution guidance will accompany the public project.</p>
          <hr />
          <b>GitHub <Arrow diagonal /></b>
          <small>REPOSITORY LINK TO BE ANNOUNCED<br />License not yet finalized.</small>
        </aside>
      </section>
      <section className="closing-cta">
        <div className="closing-kicker"><span>SYSMON / THE NEXT STEP</span><span>[ + ]</span></div>
        <div className="closing-main">
          <div><h2>Get visibility into your systems.</h2><p>Start building a clearer picture of what’s happening across your endpoints.</p></div>
          <div className="closing-actions"><Button href="/docs" light>Get Started <Arrow diagonal /></Button><Button href="/docs" secondary>View Documentation</Button></div>
        </div>
        <p className="closing-footnote">IN DEVELOPMENT / OPEN-SOURCE-FIRST / BUILT FOR GROWING TEAMS</p>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Brand />
          <p>Endpoint security starts with understanding your systems. Open-source-first visibility, in development for growing teams.</p>
          <span>SYSMON IS A WORKING NAME.</span>
        </div>
        <div className="footer-column"><span>Product</span><a href="#product">Overview</a><a href="#features">Features</a><a href="#architecture">Architecture</a></div>
        <div className="footer-column"><span>Resources</span><a href="/docs">Documentation</a><a href="#community">GitHub — soon</a></div>
        <div className="footer-column"><span>Project</span><a href="#features">In development</a><a href="#community">Contact — TBA</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 SysMon</span><span>VISIBILITY, BEFORE COMPLEXITY.</span></div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductOverview />
        <FeatureSpecifications />
        <ProductShowcase />
        <HowItWorks />
        <Architecture />
        <Community />
      </main>
      <Footer />
    </>
  );
}
