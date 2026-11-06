import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";

interface HomePageProps {
  onNavigate?: (path: string) => void;
}

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
      "Understand process execution, parent-child relationships, command-line arguments, and host system metrics directly from the source.",
    note: "METRICS / PROCESSES / IDENTITY",
  },
  {
    number: "02",
    icon: "/assets/database.svg",
    title: "Centralized Telemetry",
    description:
      "Serialize endpoint activity into versioned EventEnvelopes, buffered in local SQLite and transmitted over HTTPS to a Kafka and ClickHouse backend.",
    note: "BUFFER / ENVELOPE / KAFKA",
  },
  {
    number: "03",
    icon: "/assets/shield-check.svg",
    title: "Detection & Alerts",
    description:
      "Evaluate normalized authentication events against YAML-defined detection rules for brute-force attacks and off-hours activity, with Slack/Discord dispatch.",
    note: "RULES / THRESHOLDS / ALERTS",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Process Lineage & Diffing",
    status: "in-development",
    description:
      "Sensor samples host processes, captures PID, PPID, executable paths, command lines, and computes SHA-256 binary fingerprints.",
    detail: "Collector diffs lifecycle starts & exits; worker persistence currently in progress.",
    diagram: ["explorer.exe (PID 2816)", "└─ powershell.exe (PID 4820)", "   SHA-256: 7f83b165..."],
    note: "PID / PPID / LINEAGE / HASH",
    size: "feature-wide",
  },
  {
    number: "02",
    title: "Device Inventory & Health",
    status: "available",
    description:
      "Maintains host metadata, network interfaces, operating system release, CPU %, and memory RSS. ClickHouse DEVICES table stores current state.",
    detail: "Heartbeats and health metrics track queue depth, dropped counts, and uptime.",
    diagram: ["WORKSTATION-01 · 10.24.1.15", "● Active / Linux 6.8.0-generic"],
    note: "HOST / IDENTITY / HEALTH",
    size: "feature-top-small",
  },
  {
    number: "03",
    title: "Bounded Offline Buffering",
    status: "available",
    description:
      "Agent persists telemetry in a local SQLite database in WAL mode with synchronous=FULL to withstand network cuts and backend restarts.",
    detail: "Bounded at 25,000 events and 50 MiB with 7-day retention; FIFO eviction when capped.",
    diagram: ["SQLite Buffer: 1,420 pending", "WAL mode · 0 dropped events"],
    note: "BUFFER / WAL / RETENTION",
    size: "",
  },
  {
    number: "04",
    title: "Rotating Agent Credentials",
    status: "available",
    description:
      "One-time 30-minute bootstrap tokens enroll agents. Operational tokens expire after 1 hour and rotate automatically every 55 minutes.",
    detail: "Atomic file swaps in .env prevent credential corruption with overlap recovery.",
    diagram: ["Bootstrap: 30m exchange", "Token: 1h rotating bearer"],
    note: "BOOTSTRAP / RENEWAL / 0600",
    size: "",
  },
  {
    number: "05",
    title: "Event Validation & Deduplication",
    status: "available",
    description:
      "FastAPI validates Pydantic envelopes, enforces HTTPS transport, checks agent tenant binding, and filters duplicate event IDs.",
    detail: "SQLite telemetry_receipts prevents duplicate Kafka publishing across retry batches.",
    diagram: ["POST /api/v1/telemetry", "202 Accepted · acks=all"],
    note: "VALIDATE / DEDUPE / ACKS",
    size: "",
  },
  {
    number: "06",
    title: "Kafka & ClickHouse Engine",
    status: "available",
    description:
      "Asynchronous aiokafka producer streams events to telemetry_data topic. Worker batches and flushes records into ClickHouse MergeTree tables.",
    detail: "Currently stores telemetry.snapshot, security.auth, and agent.health records.",
    diagram: ["FastAPI → Kafka KRaft", "→ Worker → ClickHouse"],
    note: "KRAFT / MERGETREE / BUFFER",
    size: "feature-medium",
  },
  {
    number: "07",
    title: "YAML Detection Engine",
    status: "partially-implemented",
    description:
      "Worker evaluates authentication events against 7 YAML rules covering brute-force, after-hours logins, and privileged account access.",
    detail: "Operates on authentication rows; in-memory sliding threshold and time-window conditions.",
    diagram: ["security.auth → Rule Check", "→ 5 failures / 60s → Alert"],
    note: "YAML / THRESHOLD / WINDOW",
    size: "feature-bottom-main",
  },
  {
    number: "08",
    title: "Multi-Channel Alert Dispatch",
    status: "available",
    description:
      "Fired alerts are written to ClickHouse ALERTS table and dispatched via webhook adapters to Slack, Discord, and SMTP email.",
    detail: "Alerts queried and resolved via authenticated dashboard PATCH endpoint.",
    diagram: ["FiredAlert → Slack / Discord", "ClickHouse ALERTS (resolved=0)"],
    note: "SLACK / DISCORD / SMTP",
    size: "feature-bottom-small",
  },
];

const processes = [
  { time: "09:41:12", host: "WORKSTATION-01", process: "powershell.exe", level: "Critical" },
  { time: "09:40:58", host: "UBUNTU-NODE-04", process: "python3", level: "Info" },
  { time: "09:40:46", host: "HOST-002", process: "sshd", level: "High" },
  { time: "09:40:31", host: "HOST-001", process: "explorer.exe", level: "Info" },
];

const endpointRows = [
  ["DEV-WORKSTATION-01", "Windows 11", "Online", "09:41:12"],
  ["PROD-SERVER-12", "Ubuntu 22.04", "Online", "09:41:03"],
  ["UBUNTU-NODE-04", "Ubuntu 24.04", "Online", "09:40:58"],
  ["HR-EMPLOYEE-07", "Windows 11", "Offline", "08:12:16"],
];

const pipeline = [
  { title: "Endpoint Sensor", details: ["psutil & OS Logs", "Process Diffing"] },
  { title: "SQLite Buffer", details: ["WAL Journal", "25k Bounded Queue"] },
  { title: "HTTPS Transport", details: ["1h Rotating Token", "Exponential Retry"] },
  { title: "FastAPI Gateway", details: ["Auth & Dedupe", "Pydantic Schema"] },
  { title: "Apache Kafka", details: ["KRaft Cluster", "acks='all' Producer"] },
  { title: "Worker Consumer", details: ["Batch Flush", "Type Routing"] },
  { title: "Detection Engine", details: ["7 YAML Rules", "Threshold Engine"] },
  { title: "ClickHouse & UI", details: ["MergeTree Tables", "Admin SPA"] },
];

const verifiedTechStack = [
  { name: "Python 3", role: "Sensor agent, FastAPI backend, and Kafka/ClickHouse worker process", verified: true },
  { name: "FastAPI", role: "REST API gateway with 30 registered operations and OpenAPI schema", verified: true },
  { name: "Apache Kafka", role: "Distributed KRaft cluster for reliable asynchronous telemetry transport", verified: true },
  { name: "ClickHouse", role: "Columnar MergeTree analytical database for telemetry and event views", verified: true },
  { name: "SQLite", role: "Backend admin/agent credential store and local endpoint buffer queue", verified: true },
  { name: "Valkey / Redis", role: "Redis-compatible rate limiting backend with process-local fallback", verified: true },
  { name: "React 19 & Vite", role: "Administrative dashboard for fleet inventory, events, and alerts", verified: true },
  { name: "psutil & pywin32", role: "System metrics, process enumeration, and Windows Security Log access", verified: true },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 16 16" fill="none">
      {diagonal ? <path d="M4 12 12 4M5 4h7v7" /> : <path d="M2.5 8h10m-4-4 4 4-4 4" />}
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label">{children}</p>;
}

function DashboardFrame({ mode = "dark" }: { mode?: "dark" | "light" }) {
  const isDark = mode === "dark";
  const nav = ["Overview", "Devices", "Events", "Threats", "Rules"];

  return (
    <div className={`dashboard-frame ${isDark ? "dashboard-dark" : "dashboard-light"}`}>
      <div className="dashboard-topbar">
        <div className="dashboard-brand">
          <img className="mini-mark" src="/assets/sysmon-logo.svg" alt="" />
          <b>SysMon</b>
          <span className="dashboard-divider">/</span>
          <span>ADMIN</span>
        </div>
        <span>06 NOV 2026 / 09:42 UTC</span>
      </div>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <span className="workspace-caption">PLATFORM</span>
          {nav.map((item, index) => (
            <span className={`side-nav-item${index === 0 ? " active" : ""}`} key={item}>
              {item}
            </span>
          ))}
          <p>Prototype UI<br />Fictional preview</p>
        </aside>
        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <h3>Security Overview</h3>
              <p>FLEET ACTIVITY · 15S REFRESH POLLING</p>
            </div>
            <img src="/assets/list-filter.svg" alt="" />
          </div>
          <div className="metric-grid">
            {[
              ["128", "Devices"],
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
              <span>Telemetry snapshot &amp; auth activity</span>
              <small>EVENTS / 15 MIN</small>
            </div>
            <div className="chart-legend">
              <span><i className="legend-process" />Auth</span>
              <span><i className="legend-system" />Snapshot</span>
            </div>
            <div className="chart-bars" aria-label="Illustrative telemetry volume chart">
              {chartBars.map((height, index) => (
                <span className="chart-bar-group" key={index}>
                  <i style={{ height: `${height * 0.38}%` }} />
                  <i style={{ height: `${height * 0.63}%` }} />
                </span>
              ))}
            </div>
            <div className="chart-axis">
              <span>09:42</span><span>15:42</span><span>21:42</span><span>03:42</span><span>09:42</span>
            </div>
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
      <div className="dashboard-footnote">ILLUSTRATIVE PRODUCT PREVIEW · ALL DEMO DATA IS MOCK TELEMETRY · PRODUCT IN ACTIVE DEVELOPMENT</div>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const pipelineRef = useRef<HTMLDivElement>(null);
  const [pipelineScrollState, setPipelineScrollState] = useState({ left: false, right: false });

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  useEffect(() => {
    const p = pipelineRef.current;
    if (!p) return;

    const updateScroll = () => {
      setPipelineScrollState({
        left: p.scrollLeft > 1,
        right: p.scrollLeft + p.clientWidth < p.scrollWidth - 1,
      });
    };

    updateScroll();
    p.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);

    return () => {
      p.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const scrollPipeline = (direction: -1 | 1) => {
    const p = pipelineRef.current;
    if (!p) return;
    p.scrollBy({ left: direction * p.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-copy">
          <SectionLabel>OPEN-SOURCE ENDPOINT TELEMETRY &amp; VISIBILITY</SectionLabel>
          <h1>Inspect your infra before an attacker does.</h1>
          <p className="hero-description">
            SysMon is a lightweight, self-hosted endpoint monitoring prototype.
            A Python sensor collects process execution, parent-child lineage, and
            authentication logs, buffering events locally before transmitting them
            over HTTPS to a Kafka, ClickHouse, and FastAPI backend.
          </p>
          <div className="hero-actions">
            <button
              className="button"
              type="button"
              onClick={() => navigateTo("/docs/getting-started/installation")}
            >
              Get Started <Arrow diagonal />
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigateTo("/product")}
            >
              Explore the Platform
            </button>
          </div>
          <p className="hero-status">
            EARLY FUNCTIONAL PROTOTYPE · 118 VERIFIED TESTS · OPEN-SOURCE-FIRST<br />
            <span>Development codebase with active FastAPI, Kafka, and ClickHouse pipelines.</span>
          </p>
        </div>
        <div className="hero-visual">
          <DashboardFrame />
        </div>
      </section>

      {/* PLATFORM META STRIP */}
      <div className="platform-meta">
        <span>Cross-Platform Sensor · Bounded SQLite Queue · Kafka Streaming · ClickHouse Storage</span>
        <small>SYSMON TECHNICAL AUDIT 2026 · PASSING 118 TESTS</small>
      </div>

      {/* 01 PRODUCT PILLARS */}
      <section className="section product-section" id="product">
        <div className="section-intro">
          <SectionLabel>01 / THE PLATFORM</SectionLabel>
          <h2>Security starts with visibility.</h2>
          <p>
            Understanding what executes across your servers and workstations is the
            foundation of practical defense. SysMon provides a transparent, self-hosted
            telemetry pipeline without commercial agent lock-in or cloud dependencies.
          </p>
        </div>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar-card" key={pillar.number}>
              <div className="pillar-top">
                <span className="mono-label">{pillar.number}</span>
                <img src={pillar.icon} alt="" />
              </div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <span className="mono-note">{pillar.note}</span>
            </article>
          ))}
        </div>
      </section>

      {/* 02 CORE CAPABILITIES */}
      <section className="section feature-section" id="features">
        <div className="section-intro">
          <SectionLabel>02 / VERIFIED CAPABILITIES</SectionLabel>
          <h2>The detail behind the signal.</h2>
          <p>
            Every capability below reflects the technical audit of the SysMon repository.
            We transparently separate implemented functionality from in-development stages.
          </p>
        </div>
        <div className="feature-grid">
          {capabilities.map((cap) => (
            <article className={`feature-card ${cap.size}`} key={cap.number}>
              <div className="feature-top">
                <span className="mono-label">{cap.number}</span>
                <StatusBadge status={cap.status} />
              </div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
              <div className="feature-diagram">
                {cap.diagram.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              <small className="feature-audit-detail">{cap.detail}</small>
              <span className="mono-note">{cap.note}</span>
            </article>
          ))}
        </div>
        <div className="section-action-bar">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigateTo("/features")}
          >
            View Complete 45-Feature Status Matrix <Arrow diagonal />
          </button>
        </div>
      </section>

      {/* 03 PRODUCT PREVIEWS */}
      <section className="showcase-section">
        <div className="showcase-inner">
          <div className="showcase-intro">
            <SectionLabel>03 / INSIDE SYSMON</SectionLabel>
            <h2>Your infrastructure. One place to inspect it.</h2>
            <p>
              The SysMon React dashboard organizes fleet inventory, authentication records,
              and detection alerts into clear views. Interface previews below illustrate
              current UI layouts and the backend endpoints powering them.
            </p>
          </div>
          <div className="showcase-list">
            <article className="showcase-item">
              <div className="showcase-copy">
                <SectionLabel>VIEW 01</SectionLabel>
                <h3>Security Overview</h3>
                <p>
                  Fleet-wide metrics powered by <code>GET /api/v1/devices/stats</code> and
                  <code>GET /api/v1/alerts/stats</code>. Monitors device counts, online ratios,
                  and alert tallies refreshed at 15-second polling intervals.
                </p>
                <ul>
                  <li>128 endpoints in preview dataset</li>
                  <li>ClickHouse DEVICES aggregate stats</li>
                  <li>Recent security alerts triage strip</li>
                </ul>
              </div>
              <DashboardFrame />
            </article>

            <article className="showcase-item">
              <div className="showcase-copy">
                <SectionLabel>VIEW 02</SectionLabel>
                <h3>Endpoint Explorer</h3>
                <p>
                  Device inventory backed by ClickHouse <code>DEVICES</code> table through
                  <code>GET /api/v1/devices</code>. Displays operating system versions, IP/MAC
                  identities, CPU/RAM utilization, and latest check-in timestamps.
                </p>
                <ul>
                  <li>Query by hostname or agent ID</li>
                  <li>Hardware RAM and CPU inspection</li>
                  <li>Latest check-in tracking</li>
                </ul>
              </div>
              <div className="app-window app-window-light">
                <div className="window-titlebar">
                  <div className="dashboard-brand">
                    <img className="mini-mark" src="/assets/sysmon-logo.svg" alt="" />
                    <b>SysMon</b><span>/ PREVIEW</span>
                  </div>
                  <span>06 NOV 2026 / 09:42 UTC</span>
                </div>
                <div className="window-layout">
                  <aside className="window-sidebar">
                    <span>WORKSPACE</span><b>Overview</b><b className="selected">Endpoints</b><b>Events</b><b>Alerts</b>
                    <small>Prototype</small>
                  </aside>
                  <div className="window-content">
                    <div className="screen-title">
                      <div><h3>Endpoint Explorer</h3><span>CLICKHOUSE DEVICES · BACKEND INTEGRATED</span></div>
                      <img src="/assets/list-filter.svg" alt="" />
                    </div>
                    <div className="search-field">
                      <img src="/assets/search.svg" alt="" />
                      <span>Search hostname or host ID...</span>
                    </div>
                    <p className="result-count">128 total · 124 online · 4 offline</p>
                    <div className="data-table">
                      <div className="table-head">
                        <span>ENDPOINT / HOST ID</span><span>OPERATING SYSTEM</span><span>STATUS</span><span>CHECK-IN UTC</span>
                      </div>
                      {endpointRows.map((row) => (
                        <div className="table-row" key={row[0]}>
                          <span><b>{row[0]}</b><small>HOST-{row[0].slice(-3)} · 10.24.1.1</small></span>
                          <span>{row[1]}</span>
                          <span><i className={`status-dot ${row[2] === "Offline" ? "offline" : ""}`} />{row[2]}</span>
                          <span>{row[3]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="window-footnote">ILLUSTRATIVE INTERFACE · DEMO TELEMETRY SHOWN</div>
              </div>
            </article>
          </div>
          <p className="showcase-footnote">
            NOTICE: ILLUSTRATIVE INTERFACE PREVIEW. MOCK TELEMETRY DATA IS USED FOR VISUALIZATION. BACKEND CONNECTIVITY CONFIRMED BY API AUDIT.
          </p>
        </div>
      </section>

      {/* 04 TELEMETRY LIFECYCLE */}
      <section className="section flow-section">
        <div className="section-intro">
          <SectionLabel>04 / TELEMETRY LIFECYCLE</SectionLabel>
          <h2>From host activity to actionable visibility.</h2>
          <p>
            SysMon decouples collection from transmission and processing using local
            SQLite queuing and an Apache Kafka message broker.
          </p>
        </div>
        <div className="pipeline">
          <div className="pipeline-heading">
            <p>VERIFIED END-TO-END TELEMETRY PIPELINE</p>
            <div className="pipeline-scroll-controls" aria-label="Scroll pipeline diagram">
              <button
                aria-label="Scroll left"
                className="pipeline-scroll-button"
                disabled={!pipelineScrollState.left}
                onClick={() => scrollPipeline(-1)}
                type="button"
              >
                ←
              </button>
              <span className="pipeline-scroll-label">SCROLL</span>
              <button
                aria-label="Scroll right"
                className="pipeline-scroll-button"
                disabled={!pipelineScrollState.right}
                onClick={() => scrollPipeline(1)}
                type="button"
              >
                →
              </button>
            </div>
          </div>
          <div className="pipeline-steps" ref={pipelineRef}>
            {pipeline.map((item, index) => (
              <div className="pipeline-part" key={item.title}>
                <div className="pipeline-node">
                  <strong>{item.title}</strong>
                  <span>
                    {item.details.map((detail) => (
                      <span key={detail}>{detail}</span>
                    ))}
                  </span>
                </div>
                {index < pipeline.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        </div>
        <div className="section-action-bar">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigateTo("/architecture")}
          >
            Explore Detailed Architecture &amp; Diagrams <Arrow diagonal />
          </button>
        </div>
      </section>

      {/* 05 VERIFIED TECHNOLOGY STACK */}
      <section className="section tech-stack-section">
        <div className="section-intro">
          <SectionLabel>05 / TECHNOLOGY STACK</SectionLabel>
          <h2>The engineering foundation.</h2>
          <p>
            SysMon is built on battle-tested open-source components. Every technology
            listed here is actively present and utilized in the repository codebase.
          </p>
        </div>
        <div className="tech-grid">
          {verifiedTechStack.map((tech) => (
            <article className="tech-card" key={tech.name}>
              <div className="tech-top">
                <strong>{tech.name}</strong>
                <span className="mono-label">ACTIVE</span>
              </div>
              <p>{tech.role}</p>
            </article>
          ))}
        </div>
        <div className="tech-disclaimer">
          <span className="mono-note">ACCURACY AUDIT NOTE:</span>
          <p>
            PostgreSQL and Caddy are not present in the current codebase. Administrative
            sessions and credentials are stored in SQLite; rate-limiting utilizes Valkey;
            and telemetry is analyzed in ClickHouse.
          </p>
        </div>
      </section>

      {/* 06 OPEN BY INTENT & COMMUNITY */}
      <section className="community-section" id="community">
        <div className="community-copy">
          <SectionLabel>06 / OPEN BY INTENT</SectionLabel>
          <h2>Built transparently in the open.</h2>
          <p>
            SysMon is designed to make endpoint monitoring practical and accessible
            to startups, small security teams, and researchers. The code is structured
            into clear components: an agent sensor, a FastAPI ingestion gateway, a Kafka
            processing worker, and a React administrative console.
          </p>
          <div className="hero-actions">
            <a
              className="button"
              href="https://github.com/k-txlha/sysmon"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub <Arrow diagonal />
            </a>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigateTo("/roadmap")}
            >
              Inspect Development Roadmap
            </button>
          </div>
        </div>
        <aside className="community-card">
          <div className="community-card-top">
            <img src="/assets/git-branch.svg" alt="" />
            <span>REPOSITORY AUDIT</span>
          </div>
          <h3>118 Passing Tests.<br />Clear Architecture.</h3>
          <p>
            54 agent tests, 45 backend tests, and 19 worker tests verify current
            code paths across enrollment, SQLite queuing, token rotation, and detection rules.
          </p>
          <hr />
          <a
            className="community-repo-link"
            href="https://github.com/k-txlha/sysmon"
            target="_blank"
            rel="noreferrer"
          >
            <b>GitHub Repository <Arrow diagonal /></b>
          </a>
          <small>
            <a
            >
              k-txlha/sysmon
            </a> · Python 3.10+ / FastAPI / Vite<br />
            License under active finalization.
          </small>
        </aside>
      </section>

      {/* CLOSING BANNER */}
      <section className="closing-cta">
        <div className="closing-kicker">
          <span>SYSMON / TELEMETRY PLATFORM</span>
          <span>[ + ]</span>
        </div>
        <div className="closing-main">
          <div>
            <h2>Inspect your systems with clarity.</h2>
            <p>Explore the architecture, read the documentation, or review the source code.</p>
          </div>
          <div className="closing-actions">
            <button
              className="button button-light"
              type="button"
              onClick={() => navigateTo("/docs/getting-started/installation")}
            >
              Get Started <Arrow diagonal />
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigateTo("/docs")}
            >
              View Documentation
            </button>
          </div>
        </div>
        <p className="closing-footnote">
          EARLY FUNCTIONAL PROTOTYPE · NOT PRODUCTION-READY · BUILT FOR TRANSPARENT MONITORING
        </p>
      </section>
    </>
  );
}

