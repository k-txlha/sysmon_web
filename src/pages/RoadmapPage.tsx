import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";

interface RoadmapPageProps {
  onNavigate?: (path: string) => void;
}

interface RoadmapItem {
  id: string;
  title: string;
  category: "endpoint" | "telemetry" | "detection" | "investigation" | "response" | "multitenancy" | "security";
  phase: "implemented" | "in-progress" | "planned" | "under-consideration";
  description: string;
  auditContext: string;
}

const roadmapItems: RoadmapItem[] = [
  // IMPLEMENTED
  {
    id: "imp-1",
    title: "Cross-Platform Process & Metrics Polling",
    category: "endpoint",
    phase: "implemented",
    description: "Captures host CPU %, memory RSS, network interfaces, running processes, and SHA-256 binary fingerprints.",
    auditContext: "Verified in agent/collectors/common.py and process.py across 54 passing agent tests.",
  },
  {
    id: "imp-2",
    title: "Durable SQLite Local Queue",
    category: "telemetry",
    phase: "implemented",
    description: "Write-Ahead Logging SQLite buffer with 25k event limit, 50 MiB ceiling, and 7-day retention.",
    auditContext: "Verified in agent/utils/buffer.py; tests confirm rows survive unexpected restarts.",
  },
  {
    id: "imp-3",
    title: "Rotating Agent Credentials",
    category: "security",
    phase: "implemented",
    description: "Bootstrap tokens with 30-min expiry exchanged for 1-hour rotating bearer tokens with 5-minute renewal window.",
    auditContext: "Verified in backend/services/agent_service.py and agent/utils/token_manager.py.",
  },
  {
    id: "imp-4",
    title: "Kafka Streaming with acks='all'",
    category: "telemetry",
    phase: "implemented",
    description: "FastAPI producer streams events to telemetry_data with cluster acknowledgement and SQLite deduplication receipts.",
    auditContext: "Verified in backend/services/producer.py; gateway returns 202 after Kafka confirmation.",
  },
  {
    id: "imp-5",
    title: "ClickHouse Columnar Storage",
    category: "telemetry",
    phase: "implemented",
    description: "MergeTree tables for DEVICES, EVENTS, ALERTS, and AGENT_HEALTH.",
    auditContext: "Verified in worker/db/ch_client.py and backend/services/ch_service.py.",
  },
  {
    id: "imp-6",
    title: "YAML Login Detection Rules",
    category: "detection",
    phase: "implemented",
    description: "Worker evaluates authentication events against 7 rules covering brute-force, after-hours logins, and privileged accounts.",
    auditContext: "Verified in worker/detection/ with 19 passing unit tests.",
  },
  {
    id: "imp-7",
    title: "Multi-Channel Alert Dispatch",
    category: "detection",
    phase: "implemented",
    description: "Webhook dispatchers for Slack, Discord, and standard SMTP email.",
    auditContext: "Implemented adapters in worker/alerting/.",
  },

  // IN PROGRESS
  {
    id: "inp-1",
    title: "Worker Process Event Persistence",
    category: "telemetry",
    phase: "in-progress",
    description: "Mapping process.snapshot, process.start, and process.exit envelope types into dedicated ClickHouse tables.",
    auditContext: "Critical release-blocking gap: sensor currently emits these events, but worker drops them.",
  },
  {
    id: "inp-2",
    title: "Durable Worker Processing & Offset Commits",
    category: "telemetry",
    phase: "in-progress",
    description: "Manual Kafka offset commits tied to successful ClickHouse bulk insert transactions to prevent event loss.",
    auditContext: "Worker currently catches insert exceptions and logs them without failing Kafka offset commits.",
  },
  {
    id: "inp-3",
    title: "Rule Condition Semantics Correction",
    category: "detection",
    phase: "in-progress",
    description: "Refining multiple_ip_login to evaluate distinct IP sets and fixing off_hours_service_start logon_type checks.",
    auditContext: "Audit identified logic discrepancies between YAML descriptions and engine evaluation code.",
  },
  {
    id: "inp-4",
    title: "macOS Service Management Daemon",
    category: "endpoint",
    phase: "in-progress",
    description: "Launchd daemon service helper to complement existing Linux systemd and Windows Task Scheduler installers.",
    auditContext: "macOS sensor code exists, but service management installer is currently absent.",
  },

  // PLANNED
  {
    id: "pla-1",
    title: "Tenant Isolation in ClickHouse & Queries",
    category: "multitenancy",
    phase: "planned",
    description: "Adding tenant_id partitioning to ClickHouse tables and enforcing tenant-scoped predicates on all admin APIs.",
    auditContext: "Multi-tenancy currently exists as metadata only; no storage isolation is implemented.",
  },
  {
    id: "pla-2",
    title: "Process Lineage Tree Visualization",
    category: "investigation",
    phase: "planned",
    description: "Interactive visual tree in the dashboard reconstructing parent-child process chains from PID/PPID telemetry.",
    auditContext: "Dependent on worker process event persistence.",
  },
  {
    id: "pla-3",
    title: "File Integrity Monitoring (FIM)",
    category: "endpoint",
    phase: "planned",
    description: "Cross-platform file watcher monitoring sensitive system directories (/etc, C:\\Windows\\System32) for alterations.",
    auditContext: "FIM collector planned for Phase 3.",
  },
  {
    id: "pla-4",
    title: "Persistence Mechanism Monitoring",
    category: "endpoint",
    phase: "planned",
    description: "Inspection of scheduled tasks, cron jobs, systemd service modifications, and Windows Registry Run keys.",
    auditContext: "Persistence collector planned for Phase 3.",
  },
  {
    id: "pla-5",
    title: "Unified Single-Command Docker Deployment",
    category: "security",
    phase: "planned",
    description: "Root docker-compose.yaml orchestrating Kafka, ClickHouse, Valkey, FastAPI, Worker, and Nginx Dashboard.",
    auditContext: "Replaces the current requirement to launch three separate infrastructure Compose files.",
  },
  {
    id: "pla-6",
    title: "Dynamic Hot-Reloading for Detection Rules",
    category: "detection",
    phase: "planned",
    description: "Reloading YAML rules without requiring worker process restart, coupled with API-driven rule creation.",
    auditContext: "Worker currently loads rules once at startup.",
  },

  // UNDER CONSIDERATION
  {
    id: "und-1",
    title: "Automated Host Quarantine & Process Kill",
    category: "response",
    phase: "under-consideration",
    description: "Authenticated command channel allowing administrators to terminate malicious PIDs or isolate network interfaces.",
    auditContext: "Under review; requires mutual TLS command channel and tamper-resistant agent daemon.",
  },
  {
    id: "und-2",
    title: "Continuous Network Socket & Flow Telemetry",
    category: "endpoint",
    phase: "under-consideration",
    description: "Tracking open listening ports, established TCP/UDP connections, and DNS query resolution.",
    auditContext: "Requires performance profiling to ensure minimal agent CPU impact.",
  },
  {
    id: "und-3",
    title: "Multi-Tenant Organization RBAC & Provisioning",
    category: "multitenancy",
    phase: "under-consideration",
    description: "Tenant CRUD API, organization invitation workflows, and separate analyst vs viewer roles.",
    auditContext: "Dependent on replacing SQLite application state with PostgreSQL.",
  },
];

export function RoadmapPage({ onNavigate }: RoadmapPageProps) {
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredItems = roadmapItems.filter((item) => {
    const matchesPhase = phaseFilter === "all" || item.phase === phaseFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesPhase && matchesCategory;
  });

  const navigateTo = (path: string) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  return (
    <div className="subpage-container">
      {/* HERO */}
      <section className="subpage-hero">
        <div className="subpage-hero-copy">
          <p className="section-label">DEVELOPMENT ROADMAP &amp; PROJECT MATURITY</p>
          <h1>SysMon Product Roadmap</h1>
          <p className="subpage-hero-description">
            SysMon is under active development. This roadmap transparently delineates
            verified current capabilities from in-progress engineering, scheduled milestones,
            and future research directions.
          </p>
          <div className="hero-status">
            CURRENT MATURITY: EARLY FUNCTIONAL PROTOTYPE · NOT PRODUCTION-READY<br />
            <span>Phased roadmap synthesized from repository audit and master project specification.</span>
          </div>
        </div>
      </section>

      {/* MATURITY SUMMARY STRIP */}
      <div className="platform-meta">
        <span>Phase 0–1: Telemetry Foundation (Complete) · Phase 2: Pipeline Durability (Active) · Phase 3+: Forensics &amp; Scale</span>
        <small>NO FABRICATED TIMELINES · VERIFIABLE PROGRESS</small>
      </div>

      {/* FILTER CONTROLS */}
      <section className="section" style={{ paddingBottom: "24px" }}>
        <div className="matrix-controls">
          <div className="filter-buttons">
            <span className="mono-label" style={{ alignSelf: "center", marginRight: "8px" }}>PHASE:</span>
            <button
              type="button"
              className={`filter-btn ${phaseFilter === "all" ? "active" : ""}`}
              onClick={() => setPhaseFilter("all")}
            >
              All ({roadmapItems.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${phaseFilter === "implemented" ? "active" : ""}`}
              onClick={() => setPhaseFilter("implemented")}
            >
              Implemented ({roadmapItems.filter((i) => i.phase === "implemented").length})
            </button>
            <button
              type="button"
              className={`filter-btn ${phaseFilter === "in-progress" ? "active" : ""}`}
              onClick={() => setPhaseFilter("in-progress")}
            >
              In Progress ({roadmapItems.filter((i) => i.phase === "in-progress").length})
            </button>
            <button
              type="button"
              className={`filter-btn ${phaseFilter === "planned" ? "active" : ""}`}
              onClick={() => setPhaseFilter("planned")}
            >
              Planned ({roadmapItems.filter((i) => i.phase === "planned").length})
            </button>
            <button
              type="button"
              className={`filter-btn ${phaseFilter === "under-consideration" ? "active" : ""}`}
              onClick={() => setPhaseFilter("under-consideration")}
            >
              Under Consideration ({roadmapItems.filter((i) => i.phase === "under-consideration").length})
            </button>
          </div>
          <div className="filter-buttons" style={{ marginTop: "12px" }}>
            <span className="mono-label" style={{ alignSelf: "center", marginRight: "8px" }}>CATEGORY:</span>
            {["all", "endpoint", "telemetry", "detection", "investigation", "response", "multitenancy", "security"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-btn ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP GRID */}
      <section className="section" style={{ paddingTop: "0" }}>
        <div className="roadmap-grid">
          {filteredItems.map((item) => (
            <article className="roadmap-card" key={item.id}>
              <div className="roadmap-card-header">
                <span className="mono-label">{item.category.toUpperCase()}</span>
                <StatusBadge status={item.phase} />
              </div>
              <h3>{item.title}</h3>
              <p className="roadmap-desc">{item.description}</p>
              <div className="roadmap-audit-note">
                <span className="mono-label">AUDIT CONTEXT:</span>
                <p>{item.auditContext}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TECHNICAL DEBT & KNOWN LIMITATIONS */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">TRANSPARENCY AUDIT</p>
          <h2>Technical Debt &amp; Release-Blocking Gaps</h2>
          <p>
            Before deploying SysMon in real environments, security and infrastructure
            evaluators must understand these active limitations:
          </p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <span className="mono-label">DATA PIPELINE</span>
            <h3>1. Worker Process Event Persistence</h3>
            <p>
              The agent captures process start, exit, and snapshot events, but the worker currently
              lacks database mapping for them. Full process investigation requires ClickHouse process schema integration.
            </p>
          </article>

          <article className="detail-card">
            <span className="mono-label">DATA INTEGRITY</span>
            <h3>2. Worker Offset Commit Semantics</h3>
            <p>
              The worker logs and swallows ClickHouse insert failures while clearing its local batch,
              and Kafka consumer auto-commit remains enabled. A database outage could lead to lost records after consumption.
            </p>
          </article>

          <article className="detail-card">
            <span className="mono-label">TENANT ISOLATION</span>
            <h3>3. Absence of Database Tenant Scoping</h3>
            <p>
              All agent enrollments are assigned to <code>DEFAULT_TENANT_ID</code>. ClickHouse tables have no
              tenant column, and dashboard queries read all records. Do not use for multi-tenant isolation.
            </p>
          </article>

          <article className="detail-card">
            <span className="mono-label">CONFIGURATION</span>
            <h3>4. ClickHouse Default Port Mismatch</h3>
            <p>
              The ClickHouse Compose file and backend default to port <code>8123</code>, whereas the worker
              configuration defaults to port <code>8443</code>. Explicit configuration via environment variables is required.
            </p>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="closing-cta">
        <div className="closing-main">
          <div>
            <h2>Interested in contributing or evaluating SysMon?</h2>
            <p>Inspect the source repository or read the detailed installation instructions.</p>
          </div>
          <div className="closing-actions">
            <a
              className="button button-light"
              href="https://github.com/k-txlha/sysmon"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repository <Arrow diagonal />
            </a>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigateTo("/docs/getting-started/installation")}
            >
              Installation Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 16 16" fill="none">
      {diagonal ? <path d="M4 12 12 4M5 4h7v7" /> : <path d="M2.5 8h10m-4-4 4 4-4 4" />}
    </svg>
  );
}
