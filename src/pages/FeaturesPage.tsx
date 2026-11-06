import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";

interface FeaturesPageProps {
  onNavigate?: (path: string) => void;
}

interface FeatureItem {
  id: number;
  name: string;
  component: string;
  status: "available" | "partially-implemented" | "planned" | "not-implemented";
  testing: string;
  evidence: string;
  summary: string;
}

const masterMatrix: FeatureItem[] = [
  { id: 1, name: "CPU and memory metrics", component: "Agent", status: "available", testing: "Unit/assembly tests", evidence: "agent/collectors/common.py", summary: "Captures host CPU percentage and RSS memory utilization via psutil." },
  { id: 2, name: "Host/IP/MAC identity", component: "Agent", status: "available", testing: "Assembly tests", evidence: "common.py", summary: "Resolves outbound interface IP via UDP connect probe and reads MAC addresses." },
  { id: 3, name: "Process snapshots", component: "Agent", status: "available", testing: "Process tests", evidence: "agent/collectors/process.py", summary: "Enumerates all running processes on first scan and populates snapshot payload." },
  { id: 4, name: "Parent/child PID metadata", component: "Agent", status: "available", testing: "Process tests", evidence: "process.py (ppid)", summary: "Tracks PPID for all processes to establish process lineage." },
  { id: 5, name: "Process start/exit diffing", component: "Agent", status: "available", testing: "Process/assembler tests", evidence: "process.py", summary: "Maintains (pid, start_time) tuples to emit granular start and exit events." },
  { id: 6, name: "SHA-256 executable hashing", component: "Agent", status: "available", testing: "Process tests", evidence: "agent/utils/hash.py", summary: "Reads binary on disk during process enumeration and computes SHA-256." },
  { id: 7, name: "Windows auth events", component: "Agent", status: "partially-implemented", testing: "Unit/mock tests", evidence: "collectors/windows.py", summary: "Queries Security Channel for Event IDs 4624 and 4625 via pywin32." },
  { id: 8, name: "Linux auth parsing", component: "Agent", status: "partially-implemented", testing: "Parser tests", evidence: "collectors/linux.py", summary: "Parses /var/log/auth.log, secure, and journalctl for SSH/PAM/sudo logins." },
  { id: 9, name: "macOS auth parsing", component: "Agent", status: "partially-implemented", testing: "No live OS tests", evidence: "collectors/darwin.py", summary: "Executes bounded log show query for loginwindow, sshd, and sudo." },
  { id: 10, name: "Persistence monitoring", component: "Agent", status: "not-implemented", testing: "None", evidence: "No collector found", summary: "Scheduled tasks, cron jobs, and autoruns are planned for future roadmap." },
  { id: 11, name: "File integrity monitoring (FIM)", component: "Agent", status: "not-implemented", testing: "None", evidence: "No collector found", summary: "File change detection and integrity monitoring are planned." },
  { id: 12, name: "Network flow/connection monitoring", component: "Agent", status: "not-implemented", testing: "None", evidence: "Identity only", summary: "Continuous socket/flow monitoring is not implemented." },
  { id: 13, name: "Agent enrollment", component: "Backend/Agent", status: "available", testing: "API tests", evidence: "agents.py, enroll.py", summary: "Consumes one-time bootstrap token and issues unique operational credentials." },
  { id: 14, name: "Bootstrap token hashing/expiry", component: "Backend", status: "available", testing: "API/token tests", evidence: "agent_service.py", summary: "Stores SHA-256 hashes of 30-minute bootstrap tokens in SQLite." },
  { id: 15, name: "Agent token renewal/rotation", component: "Backend/Agent", status: "available", testing: "Renewal tests", evidence: "agent_service.py", summary: "Automatic rotation in 5-minute window before 1-hour expiry with recovery overlap." },
  { id: 16, name: "Admin session & CSRF auth", component: "Backend/UI", status: "available", testing: "Auth/API tests", evidence: "auth_service.py, auth.py", summary: "Argon2id password hashes, 12h HttpOnly cookies, and CSRF token enforcement." },
  { id: 17, name: "TLS transport", component: "Backend/Agent", status: "available", testing: "Transport tests", evidence: "settings.py, transport.py", summary: "Enforces HTTPS for agent transport; supports Uvicorn TLS or reverse proxy." },
  { id: 18, name: "Bounded offline buffer", component: "Agent", status: "available", testing: "Buffer tests", evidence: "agent/utils/buffer.py", summary: "SQLite buffer with WAL mode, 25k cap, 50 MiB limit, and 7-day retention." },
  { id: 19, name: "Retry & exponential backoff", component: "Agent", status: "available", testing: "Transport/token tests", evidence: "transport.py, retry.py", summary: "Exponential backoff with jitter up to 300s; honors HTTP Retry-After." },
  { id: 20, name: "Kafka ingestion", component: "Backend/Worker", status: "available", testing: "Producer mocked", evidence: "producer.py, worker", summary: "Asynchronous producer sends JSON to telemetry_data with acks='all'." },
  { id: 21, name: "Event validation & deduplication", component: "Backend", status: "available", testing: "API tests", evidence: "transport.py, receipts", summary: "Pydantic validation, batch deduplication, and SQLite telemetry_receipts." },
  { id: 22, name: "Process event persistence", component: "Worker", status: "not-implemented", testing: "No tests", evidence: "worker/main.py", summary: "Worker currently drops process.snapshot, start, and exit envelope types." },
  { id: 23, name: "ClickHouse persistence", component: "Worker", status: "partially-implemented", testing: "Client mocked", evidence: "worker/db/ch_client.py", summary: "Stores DEVICES, EVENTS, ALERTS, and AGENT_HEALTH MergeTree tables." },
  { id: 24, name: "SQLite application state", component: "Backend", status: "available", testing: "Backend tests", evidence: "auth_service.py", summary: "Stores admin users, sessions, agents, credentials, and receipts." },
  { id: 25, name: "PostgreSQL persistence", component: "Backend", status: "not-implemented", testing: "None", evidence: "No client found", summary: "PostgreSQL is not present in the repository; SQLite is actively used." },
  { id: 26, name: "Valkey / Redis rate limiting", component: "Backend", status: "available", testing: "API tests", evidence: "rate_limiter.py", summary: "Sliding window rate limiting with process-local in-memory fallback." },
  { id: 27, name: "YAML detection rules", component: "Worker", status: "partially-implemented", testing: "19 engine tests", evidence: "worker/detection/", summary: "7 YAML rules loaded at worker start evaluating authentication records." },
  { id: 28, name: "Alert generation", component: "Worker", status: "available", testing: "Engine tests", evidence: "detection/engine.py", summary: "Fires structured FiredAlert instances when detection conditions match." },
  { id: 29, name: "Alert persistence & resolution", component: "Worker/Backend", status: "available", testing: "API mocked", evidence: "ch_client.py, alerts.py", summary: "Writes to ALERTS table and supports PATCH /resolve to close alerts." },
  { id: 30, name: "Slack notifications", component: "Worker", status: "available", testing: "Unit tested", evidence: "alerting/slack.py", summary: "Webhook adapter sends formatted message blocks to Slack." },
  { id: 31, name: "Discord notifications", component: "Worker", status: "available", testing: "Unit tested", evidence: "alerting/discord.py", summary: "Webhook adapter sends color-coded alert embeds to Discord." },
  { id: 32, name: "Email notifications (SMTP)", component: "Worker", status: "available", testing: "Unit tested", evidence: "alerting/email.py", summary: "MIME email adapter formats and transmits alerts over standard SMTP." },
  { id: 33, name: "WhatsApp notifications", component: "Worker", status: "not-implemented", testing: "None", evidence: "No adapter found", summary: "Mentioned in early roadmap ideas; no code exists in the repository." },
  { id: 34, name: "Multi-tenant isolation", component: "Backend/Storage", status: "not-implemented", testing: "None", evidence: "No tenant queries", summary: "tenant_id exists as metadata only; ClickHouse schemas lack tenant isolation." },
  { id: 35, name: "React dashboard UI", component: "Dashboard", status: "available", testing: "Build verified", evidence: "dashboard/src/", summary: "SPA for overview metrics, device inventory, authentication, and rules." },
  { id: 36, name: "Windows agent support", component: "Agent", status: "partially-implemented", testing: "Selected unit tests", evidence: "windows.py, service.py", summary: "Security Event Log collector and Windows Task Scheduler installation." },
  { id: 37, name: "Linux agent support", component: "Agent", status: "partially-implemented", testing: "Selected unit tests", evidence: "linux.py, service.py", summary: "Auth log collector and systemd service unit installation." },
  { id: 38, name: "macOS agent support", component: "Agent", status: "partially-implemented", testing: "No service installer", evidence: "darwin.py", summary: "Collector queries log show; daemon service installer absent." },
  { id: 39, name: "Individual Docker Compose", component: "Infra", status: "available", testing: "Configs present", evidence: "infra/{kafka,ch,redis}", summary: "Individual Compose files for Kafka KRaft, ClickHouse, and Valkey." },
  { id: 40, name: "Complete unified Docker deployment", component: "Infra", status: "not-implemented", testing: "None", evidence: "No root Compose", summary: "Single-command full stack deployment is planned for Phase 6." },
  { id: 41, name: "Health check endpoint", component: "Backend", status: "available", testing: "API tests", evidence: "health.py", summary: "GET /health reports Kafka producer, ClickHouse, and Valkey ping status." },
  { id: 42, name: "Prometheus / Metrics stack", component: "Platform", status: "not-implemented", testing: "None", evidence: "No exporter found", summary: "Prometheus metrics export is planned for future observability." },
  { id: 43, name: "Application logging", component: "All", status: "available", testing: "Indirect", evidence: "Logger utilities", summary: "Configurable logging across sensor, backend, and worker processes." },
  { id: 44, name: "Offline restart persistence", component: "Agent", status: "available", testing: "Buffer restart test", evidence: "agent/utils/buffer.py", summary: "Buffered events in SQLite survive agent process restarts." },
  { id: 45, name: "Measured performance benchmarks", component: "Platform", status: "not-implemented", testing: "No benchmarks run", evidence: "Locust file present", summary: "Locust test file exists, but verified throughput benchmarks are unverified." },
];

export function FeaturesPage({ onNavigate }: FeaturesPageProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredFeatures = masterMatrix.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.component.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
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
          <p className="section-label">CAPABILITY INDEX &amp; TECHNICAL SPECIFICATION</p>
          <h1>SysMon Technical Features Index</h1>
          <p className="subpage-hero-description">
            A comprehensive, verified inventory of SysMon's endpoint sensing,
            telemetry transport, detection rules, and administrative capabilities.
            Every claim is cross-referenced with the source code and master technical audit.
          </p>
        </div>
      </section>

      {/* CATEGORY A: ENDPOINT MONITORING */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">CATEGORY A</p>
          <h2>Endpoint Monitoring &amp; Process Telemetry</h2>
          <p>How the cross-platform sensor enumerates and inspects host processes.</p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">PROCESS METADATA</span>
              <StatusBadge status="available" />
            </div>
            <h3>Process Lineage &amp; Execution Data</h3>
            <p>
              The agent polls the system at <code>SIEM_COLLECTION_INTERVAL</code> (default 5s)
              using <code>psutil.process_iter()</code>, extracting:
            </p>
            <ul className="spec-list">
              <li><strong>PID &amp; PPID:</strong> Captures process hierarchy for process tree reconstruction.</li>
              <li><strong>Executable Path &amp; Name:</strong> Full resolved binary path on disk.</li>
              <li><strong>Command-Line Array:</strong> Exact argument strings passed to the executable.</li>
              <li><strong>Process Start Time:</strong> Monotonic timestamp converted to UTC ISO-8601 string.</li>
              <li><strong>User Identity:</strong> OS user under whose security context the process runs.</li>
              <li><strong>Working Directory:</strong> Current working directory (CWD) of the process.</li>
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">CRYPTOGRAPHIC FINGERPRINT</span>
              <StatusBadge status="available" />
            </div>
            <h3>SHA-256 Binary Hashing</h3>
            <p>
              Implemented in <code>agent/utils/hash.py</code>. During process enumeration,
              the binary file is opened in binary read mode and hashed in chunks:
            </p>
            <div className="diagram-snippet">
              <code>def hash_file_sha256(filepath):</code>
              <code>  h = hashlib.sha256()</code>
              <code>  # 64KB chunked buffer reads</code>
              <code>  return h.hexdigest()</code>
            </div>
            <p className="audit-note">
              Captures file hash for running binaries. File-system permission errors on protected system processes are handled gracefully with null fallback.
            </p>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">LIFECYCLE DIFFING</span>
              <StatusBadge status="in-development" />
            </div>
            <h3>Process Start &amp; Exit Diffing</h3>
            <p>
              The <code>ProcessCollector</code> maintains a previous-state dictionary indexed by
              <code>(pid, process_start_time)</code> to distinguish new processes from recycled PIDs:
            </p>
            <ul className="spec-list">
              <li><strong>First Scan:</strong> Emits full <code>process.snapshot</code>.</li>
              <li><strong>Subsequent Scans:</strong> Computes set difference of new keys → emits <code>process.start</code>.</li>
              <li><strong>Terminated Processes:</strong> Computes missing keys → emits <code>process.exit</code> with observed exit timestamp.</li>
            </ul>
            <p className="audit-note warning">
              Worker Status: Process events are correctly emitted by the sensor, but the worker currently drops them.
            </p>
          </article>
        </div>
      </section>

      {/* CATEGORY B: TELEMETRY COLLECTION */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">CATEGORY B</p>
          <h2>Telemetry Collection &amp; Envelope Schema</h2>
          <p>Canonical serialization, sequence counters, and host identity.</p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">CANONICAL CONTRACT</span>
              <StatusBadge status="available" />
            </div>
            <h3>EventEnvelope v1 Model</h3>
            <p>
              Defined in both <code>agent/models/envelope.py</code> and <code>backend/models/envelope.py</code>:
            </p>
            <ul className="spec-list">
              <li><code>event_id</code>: UUID string generated client-side</li>
              <li><code>schema_version</code>: Integer version (default 1)</li>
              <li><code>tenant_id</code>: Tenant string (server binds to default)</li>
              <li><code>host_id</code>: Unique hostname or server identifier</li>
              <li><code>agent_id</code>: Server-assigned agent UUID</li>
              <li><code>event_type</code>: Dot-notated category string</li>
              <li><code>observed_at</code>: Timestamp recorded at collection time</li>
              <li><code>sequence</code>: Monotonic integer counter per agent session</li>
              <li><code>severity</code>: Informational, Low, Medium, High, Critical</li>
              <li><code>data</code>: Structured dictionary containing event-specific fields</li>
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">LOCAL QUEUING</span>
              <StatusBadge status="available" />
            </div>
            <h3>SQLite WAL Buffer</h3>
            <p>
              Every envelope is committed to a local SQLite database before any network call:
            </p>
            <ul className="spec-list">
              <li><strong>WAL Mode:</strong> Write-Ahead Logging allows concurrent collection and transmission.</li>
              <li><strong>Durable Commits:</strong> <code>synchronous=FULL</code> ensures data survives host power cuts.</li>
              <li><strong>Capacity Bounding:</strong> 25,000 events / 50 MiB ceiling with FIFO eviction.</li>
              <li><strong>Retention Bounding:</strong> 7-day automated purge policy.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* CATEGORY C: SECURE COMMUNICATION */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">CATEGORY C</p>
          <h2>Secure Communication &amp; Agent Credentials</h2>
          <p>Bootstrap tokens, rotating credentials, and transport encryption.</p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">CREDENTIAL LIFECYCLE</span>
              <StatusBadge status="available" />
            </div>
            <h3>Two-Stage Enrollment</h3>
            <p>
              Agents never use permanent hardcoded tokens:
            </p>
            <ul className="spec-list">
              <li><strong>1. Bootstrap Token:</strong> Administrator generates a one-time token (30-minute expiry) via <code>POST /api/v1/agents/token</code>.</li>
              <li><strong>2. Enrollment Exchange:</strong> Agent sends <code>POST /api/v1/agents/enroll</code> with hardware metadata, consuming the bootstrap token.</li>
              <li><strong>3. Operational Token:</strong> Server issues a 1-hour bearer token, storing its SHA-256 hash in SQLite.</li>
              <li><strong>4. Atomic Storage:</strong> Agent saves credentials to <code>agent/.env</code> using atomic rename with 0600 file permissions.</li>
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">BACKGROUND ROTATION</span>
              <StatusBadge status="available" />
            </div>
            <h3>Automatic Token Renewal</h3>
            <p>
              The <code>AgentTokenManager</code> runs a background renewal thread:
            </p>
            <ul className="spec-list">
              <li>Begins renewal checks in the 5-minute window before the 1-hour expiration.</li>
              <li>Calls <code>POST /api/v1/agents/renew</code> using current bearer credentials.</li>
              <li>Backend rotates the token and maintains an overlap recovery window in case the response is lost.</li>
              <li>Agent atomically persists the renewed token to disk before swapping it in memory.</li>
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">TRANSPORT SECURITY</span>
              <StatusBadge status="available" />
            </div>
            <h3>HTTPS Transport Enforcement</h3>
            <p>
              The agent's HTTP client verifies TLS certificates. In production environments,
              the backend strictly rejects unencrypted plain HTTP transport for agent routes.
            </p>
            <p className="audit-note">
              Loopback HTTP is permitted only in local development testing mode (<code>ENVIRONMENT=development</code>).
            </p>
          </article>
        </div>
      </section>

      {/* CATEGORY D: EVENT PROCESSING PIPELINE */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">CATEGORY D</p>
          <h2>Event Processing Pipeline &amp; Messaging</h2>
          <p>FastAPI ingestion, Kafka cluster streaming, and ClickHouse persistence.</p>
        </div>

        <div className="feature-comparison-table-wrap">
          <table className="feature-table">
            <thead>
              <tr>
                <th>Pipeline Stage</th>
                <th>Underlying Technology</th>
                <th>Operation &amp; Implementation Semantics</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Ingestion Gateway</strong></td>
                <td>FastAPI / Pydantic v2</td>
                <td>
                  Endpoint <code>POST /api/v1/telemetry</code> accepts batches. Checks bearer token, verifies agent tenant binding,
                  stamps <code>received_at</code>, and filters duplicate event IDs.
                </td>
              </tr>
              <tr>
                <td><strong>2. Deduplication Receipts</strong></td>
                <td>SQLite <code>telemetry_receipts</code></td>
                <td>
                  Composite primary key <code>(agent_id, event_id)</code> records accepted events. Prevents duplicate Kafka
                  publishing across retry requests.
                </td>
              </tr>
              <tr>
                <td><strong>3. Message Streaming</strong></td>
                <td>Apache Kafka KRaft</td>
                <td>
                  Producer publishes JSON envelopes to <code>telemetry_data</code> with <code>acks="all"</code> and idempotence.
                  Gateway returns <code>202 Accepted</code> only after Kafka cluster acknowledgement.
                </td>
              </tr>
              <tr>
                <td><strong>4. Worker Consumption</strong></td>
                <td>Python <code>aiokafka</code> Consumer</td>
                <td>
                  Consumes the topic in consumer group. Buffers up to 1,000 items or 5 seconds, flushing batches into ClickHouse.
                </td>
              </tr>
              <tr>
                <td><strong>5. Analytics Storage</strong></td>
                <td>ClickHouse MergeTree</td>
                <td>
                  Stores <code>telemetry.snapshot</code> in DEVICES, <code>security.auth</code> in EVENTS, and <code>agent.health</code> in AGENT_HEALTH.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CATEGORY E: DETECTION CAPABILITIES */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">CATEGORY E</p>
          <h2>YAML Detection Engine &amp; Rule Catalog</h2>
          <p>Analysis of the 7 implemented YAML detection rules and engine conditions.</p>
        </div>

        <div className="rules-deep-dive">
          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>brute_force.yaml</code>
              <StatusBadge status="available" />
              <span className="severity-badge-crit">CRITICAL</span>
            </div>
            <h4>Authentication Brute Force Detection</h4>
            <p><strong>Configured Logic:</strong> Triggers when ≥5 login failure events occur from the same <code>source_ip</code> within 60 seconds.</p>
            <p><strong>Engine Evaluation:</strong> Stateful sliding time window in memory. Correctly identifies rapid password spraying and SSH/RDP brute force.</p>
          </div>

          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>after_hours_login.yaml</code>
              <StatusBadge status="available" />
              <span className="severity-badge-high">HIGH</span>
            </div>
            <h4>After-Hours Successful Authentication</h4>
            <p><strong>Configured Logic:</strong> Matches successful login events occurring between 22:00 and 06:00 UTC.</p>
            <p><strong>Engine Evaluation:</strong> Evaluates time window against event timestamp. Operates reliably for remote access review.</p>
          </div>

          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>privileged_account_login.yaml</code>
              <StatusBadge status="caveat" />
              <span className="severity-badge-high">HIGH</span>
            </div>
            <h4>Privileged Account Access Watchlist</h4>
            <p><strong>Configured Logic:</strong> Case-insensitive watchlist matching usernames: <code>root</code>, <code>administrator</code>, <code>admin</code>.</p>
            <p><strong>Audit Caveat:</strong> The rule does not filter <code>status == SUCCESS</code>, meaning failed login attempts against these usernames also trigger this alert.</p>
          </div>

          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>multiple_ip_login.yaml</code>
              <StatusBadge status="caveat" />
              <span className="severity-badge-crit">CRITICAL</span>
            </div>
            <h4>Multiple Source IP Login Alert</h4>
            <p><strong>Configured Intent:</strong> Detect when the same user logs in from multiple distinct IP addresses within 5 minutes.</p>
            <p><strong>Audit Caveat:</strong> The engine counts occurrences of matching <code>username</code>, but does not calculate set cardinality of distinct IP addresses.</p>
          </div>

          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>new_device_seen.yaml</code>
              <StatusBadge status="caveat" />
              <span className="severity-badge-med">MEDIUM</span>
            </div>
            <h4>New Device Discovery</h4>
            <p><strong>Configured Intent:</strong> Detect new agents connecting to the fleet.</p>
            <p><strong>Audit Caveat:</strong> Events are evaluated grouped per agent, so <code>agent_id</code> is constant within each group; it cannot discover multiple distinct devices as described.</p>
          </div>

          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>off_hours_service_start.yaml</code>
              <StatusBadge status="caveat" />
              <span className="severity-badge-med">MEDIUM</span>
            </div>
            <h4>Off-Hours Service Logon</h4>
            <p><strong>Configured Intent:</strong> Detect service-type logons outside business hours (20:00–07:00 UTC).</p>
            <p><strong>Audit Caveat:</strong> The rule checks the time window and status, but omits a filter on <code>logon_type == "Service"</code>.</p>
          </div>

          <div className="rule-card-detailed">
            <div className="rule-header">
              <code>repeated_logon_type_change.yaml</code>
              <StatusBadge status="caveat" />
              <span className="severity-badge-high">HIGH</span>
            </div>
            <h4>Repeated Logon Type Alternation</h4>
            <p><strong>Configured Intent:</strong> Detect rapid changes between interactive and network logon types for a user.</p>
            <p><strong>Audit Caveat:</strong> The threshold counts occurrences of the username, not changes in the <code>logon_type</code> field.</p>
          </div>
        </div>
      </section>

      {/* MASTER FEATURE STATUS MATRIX */}
      <section className="section" id="matrix">
        <div className="section-intro">
          <p className="section-label">MASTER AUDIT MATRIX</p>
          <h2>Complete 45-Capability Status Matrix</h2>
          <p>
            Directly sourced from Section 31 of <code>report.md</code>. Search or filter
            to inspect verified implementation, testing status, and source file evidence.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="matrix-controls">
          <div className="filter-buttons">
            <button
              type="button"
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All (45)
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "available" ? "active" : ""}`}
              onClick={() => setFilter("available")}
            >
              Implemented ({masterMatrix.filter((i) => i.status === "available").length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "partially-implemented" ? "active" : ""}`}
              onClick={() => setFilter("partially-implemented")}
            >
              Partial ({masterMatrix.filter((i) => i.status === "partially-implemented").length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "not-implemented" ? "active" : ""}`}
              onClick={() => setFilter("not-implemented")}
            >
              Planned / Not Implemented ({masterMatrix.filter((i) => i.status === "not-implemented").length})
            </button>
          </div>
          <div className="search-field matrix-search">
            <img src="/assets/search.svg" alt="" />
            <input
              type="text"
              placeholder="Search capability, component, or file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search master feature matrix"
            />
          </div>
        </div>

        {/* Table */}
        <div className="feature-comparison-table-wrap">
          <table className="feature-table matrix-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Feature Name</th>
                <th>Component</th>
                <th>Implementation Status</th>
                <th>Testing Evidence</th>
                <th>Source Code Reference</th>
                <th>Audit Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((item) => (
                <tr key={item.id}>
                  <td><span className="mono-label">{String(item.id).padStart(2, "0")}</span></td>
                  <td><strong>{item.name}</strong></td>
                  <td><code>{item.component}</code></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td><small>{item.testing}</small></td>
                  <td><code>{item.evidence}</code></td>
                  <td><span className="matrix-summary">{item.summary}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="closing-cta">
        <div className="closing-main">
          <div>
            <h2>Review the architecture diagrams and data flows.</h2>
            <p>10 rendered architecture diagrams demonstrate the verified engineering behind SysMon.</p>
          </div>
          <div className="closing-actions">
            <button
              className="button button-light"
              type="button"
              onClick={() => navigateTo("/architecture")}
            >
              View Architecture Diagrams <Arrow diagonal />
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigateTo("/docs/api-reference/overview")}
            >
              Explore API Reference (30 Routes)
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

