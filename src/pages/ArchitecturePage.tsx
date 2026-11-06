import {
  DiagramCard,
  SystemArchitectureDiagram,
  AgentArchitectureDiagram,
  TelemetryDataFlowDiagram,
  EnrollmentSequenceDiagram,
  TokenRenewalSequenceDiagram,
  DatabaseSchemaDiagram,
  MultiTenantArchitectureDiagram,
  DetectionAlertPipelineDiagram,
  BackendArchitectureDiagram,
  DeploymentTopologyDiagram,
} from "../components/Diagrams";

interface ArchitecturePageProps {
  onNavigate?: (path: string) => void;
}

export function ArchitecturePage({ onNavigate }: ArchitecturePageProps) {
  const navigateTo = (path: string) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  return (
    <div className="subpage-container">
      {/* HERO */}
      <section className="subpage-hero">
        <div className="subpage-hero-copy">
          <p className="section-label">SYSTEM ARCHITECTURE &amp; ENGINEERING SPECIFICATION</p>
          <h1>The Engineering Behind SysMon</h1>
          <p className="subpage-hero-description">
            A comprehensive, verifiable architectural walkthrough of SysMon's subsystems:
            cross-platform Python sensing, bounded SQLite buffering, asynchronous Kafka streaming,
            and ClickHouse analytical storage.
          </p>
          <div className="hero-status">
            TECHNICAL AUDIT DATE: 2026-11-06 · 118 VERIFIED PYTESTS PASSING<br />
            <span>10 rendered vector diagrams reflect exact repository source wiring.</span>
          </div>
        </div>
      </section>

      {/* QUICK JUMP NAVIGATION */}
      <div className="arch-toc-strip">
        <span className="mono-label">INDEX:</span>
        <a href="#diagram-system">01 High-Level Architecture</a>
        <a href="#diagram-agent">02 Endpoint Sensor</a>
        <a href="#diagram-backend">03 Backend Gateway</a>
        <a href="#diagram-flow">04 Telemetry Pipeline</a>
        <a href="#diagram-enrollment">05 Agent Enrollment</a>
        <a href="#diagram-renewal">06 Token Renewal</a>
        <a href="#diagram-multitenancy">07 Multi-Tenancy</a>
        <a href="#diagram-detection">08 Detection &amp; Alerts</a>
        <a href="#diagram-database">09 Database Schemas</a>
        <a href="#diagram-deployment">10 Deployment Topology</a>
      </div>

      {/* DIAGRAM 1: HIGH-LEVEL ARCHITECTURE */}
      <section className="section" id="diagram-system">
        <DiagramCard
          id="system-overview"
          number="01"
          title="High-Level System Architecture"
          description="The logical path of endpoint telemetry across all 6 core subsystems: from host sensor collection through HTTPS transport, FastAPI gateway ingestion, Kafka topic streaming, worker batch processing, and ClickHouse storage to administrative dashboard queries."
          statusNote="VERIFIED CODEPATH"
        >
          <SystemArchitectureDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Subsystem Responsibilities &amp; Boundaries</h4>
          <p>
            SysMon separates data collection, message transport, processing, and query visualization into distinct layers:
          </p>
          <ul>
            <li><strong>Endpoint Layer:</strong> An independent Python agent process polling host metrics, process execution, and authentication logs at 5-second intervals.</li>
            <li><strong>Ingestion Layer:</strong> FastAPI REST gateway validating request schemas, checking bearer credentials, and enforcing HTTPS.</li>
            <li><strong>Streaming Layer:</strong> Apache Kafka KRaft cluster decoupling sensor transmission from analytical ingestion.</li>
            <li><strong>Processing &amp; Detection Layer:</strong> Dedicated Python worker consuming Kafka batches, evaluating authentication detection rules, and persisting data to ClickHouse.</li>
            <li><strong>Storage Layer:</strong> ClickHouse columnar database for high-throughput event analytics, and SQLite for backend administrative state.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 2: ENDPOINT AGENT ARCHITECTURE */}
      <section className="section" id="diagram-agent">
        <DiagramCard
          id="agent-arch"
          number="02"
          title="Endpoint Sensor Internal Architecture"
          description="Internal modular pipeline of the SysMon sensor: host collectors (System, Process, OS, and Health), TelemetryAssembler serialization into EventEnvelope v1, LocalBoundedBuffer SQLite queue with WAL mode, and AgentTokenManager credential renewal."
          statusNote="54 AGENT TESTS PASSING"
        >
          <AgentArchitectureDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Collector Implementation &amp; Queuing Semantics</h4>
          <p>
            The agent runs in a continuous loop in <code>agent/main.py</code>. Key architectural attributes:
          </p>
          <ul>
            <li><strong>Non-Blocking Diffing:</strong> A single <code>ProcessCollector</code> instance is retained across collection cycles to compute process start and exit diffs without re-enumerating the whole system from scratch.</li>
            <li><strong>Cryptographic Integrity:</strong> SHA-256 hashes of running binaries are computed directly from disk to support downstream threat intelligence lookups.</li>
            <li><strong>WAL Queue Resilience:</strong> The local SQLite queue operates with <code>synchronous=FULL</code> and Write-Ahead Logging, guaranteeing that buffered records survive unexpected operating system crashes or power losses.</li>
            <li><strong>Backpressure Management:</strong> When the queue reaches 25,000 events or 50 MiB, oldest records are evicted (FIFO) while tracking a <code>dropped_count</code> metric in subsequent health envelopes.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 3: BACKEND ARCHITECTURE */}
      <section className="section" id="diagram-backend">
        <DiagramCard
          id="backend-arch"
          number="03"
          title="FastAPI Gateway &amp; Backend Services"
          description="Internal architecture of the backend application: 8 mounted routers covering 30 registered operations, Argon2id authentication service, SQLite agent registry, Redis-compatible Valkey rate limiter, aiokafka producer, and ClickHouse query client."
          statusNote="45 BACKEND TESTS PASSING"
        >
          <BackendArchitectureDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Ingestion Flow &amp; Asynchronous Publishing</h4>
          <p>
            When <code>POST /api/v1/telemetry</code> receives an envelope or batch:
          </p>
          <ul>
            <li><strong>Authentication &amp; Transport Check:</strong> Verifies bearer credential header and ensures the connection is HTTPS (or loopback HTTP in development).</li>
            <li><strong>Envelope Validation:</strong> Pydantic models validate required fields: UUID event_id, observed_at, host_id, agent_id, and severity.</li>
            <li><strong>Deduplication Transaction:</strong> Envelopes are compared against SQLite <code>telemetry_receipts</code>. Previously accepted event IDs are skipped.</li>
            <li><strong>Cluster Acknowledgment:</strong> The producer sends new events to Kafka topic <code>telemetry_data</code> with <code>acks="all"</code> and idempotence, returning <code>202 Accepted</code> only after broker confirmation.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 4: TELEMETRY DATA FLOW */}
      <section className="section" id="diagram-flow">
        <DiagramCard
          id="telemetry-flow"
          number="04"
          title="Telemetry Data Flow &amp; Pipeline Stages"
          description="End-to-end event lifecycle from endpoint activity to analytics persistence. Transparently illustrates where supported records (snapshot, auth, health) are stored in ClickHouse versus where process lifecycle events are currently dropped by the worker."
          statusNote="AUDIT FINDING: WORKER MAPS 3 OF 6 TYPES"
        >
          <TelemetryDataFlowDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Delivery Semantics &amp; Current Worker Mapping Gap</h4>
          <p>
            The audit identified an important architectural distinction between agent emission and worker persistence:
          </p>
          <ul>
            <li><strong>Agent Emits 6 Event Types:</strong> <code>telemetry.snapshot</code>, <code>process.snapshot</code>, <code>process.start</code>, <code>process.exit</code>, <code>security.auth</code>, and <code>agent.health</code>.</li>
            <li><strong>Worker Stores 3 Event Types:</strong> Maps <code>telemetry.snapshot</code> into ClickHouse <code>DEVICES</code>, <code>security.auth</code> into <code>EVENTS</code>, and <code>agent.health</code> into <code>AGENT_HEALTH</code>.</li>
            <li><strong>Process Events Currently Unmapped:</strong> The worker has no handler for <code>process.snapshot</code>, <code>process.start</code>, or <code>process.exit</code>; these events are currently dropped upon consumption. Full persistence is scheduled for Roadmap Phase 2.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 5: AGENT ENROLLMENT SEQUENCE */}
      <section className="section" id="diagram-enrollment">
        <DiagramCard
          id="enrollment-seq"
          number="05"
          title="Agent Enrollment &amp; Credential Sequence"
          description="Sequence diagram showing administrator bootstrap token creation, agent CLI invocation, mutual handshake over HTTPS, server agent ID assignment, and atomic credential storage on the endpoint."
          statusNote="VERIFIED WORKFLOW"
        >
          <EnrollmentSequenceDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Bootstrap Credential Security</h4>
          <p>
            SysMon enforces a strict separation between administrator setup and agent registration:
          </p>
          <ul>
            <li><strong>Short-Lived Bootstrap Tokens:</strong> Created via <code>POST /api/v1/agents/token</code> with a 30-minute expiry. Only the SHA-256 hash is retained in SQLite; raw tokens are never saved on the server.</li>
            <li><strong>Single-Use Consumption:</strong> Upon <code>POST /api/v1/agents/enroll</code>, the bootstrap token is consumed and cannot be reused.</li>
            <li><strong>Server-Bound Identity:</strong> The server assigns the unique <code>agent_id</code> and binds it to the configured default tenant.</li>
            <li><strong>Restricted File Permissions:</strong> The agent writes its assigned ID and initial token into <code>agent/.env</code> using atomic file replacement and restrictive OS permissions (0600 on Linux/macOS).</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 6: TOKEN RENEWAL SEQUENCE */}
      <section className="section" id="diagram-renewal">
        <DiagramCard
          id="renewal-seq"
          number="06"
          title="Automatic Token Renewal &amp; Recovery Overlap"
          description="Background renewal thread checking token expiration, requesting rotation within the 5-minute pre-expiration window, server-side overlap recovery handling, and atomic credential replacement on disk."
          statusNote="VERIFIED WORKFLOW"
        >
          <TokenRenewalSequenceDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Rotation Mechanics &amp; In-Flight Recovery</h4>
          <p>
            Operational agent credentials expire every 1 hour (3,600 seconds).
          </p>
          <ul>
            <li><strong>Renewal Window:</strong> The agent's background renewal thread triggers renewal when less than 5 minutes (300s) remain before expiration.</li>
            <li><strong>No-Op Response:</strong> If more than 5 minutes remain, <code>POST /api/v1/agents/renew</code> returns <code>renewed=false</code>, keeping current credentials active.</li>
            <li><strong>Recovery Overlap:</strong> The backend retains the previous token hash during the rotation transition. If a network blip causes the renewal response to drop, the agent can retry with its existing token without being locked out.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 7: MULTI-TENANCY ARCHITECTURE */}
      <section className="section" id="diagram-multitenancy">
        <DiagramCard
          id="multitenancy-arch"
          number="07"
          title="Multi-Tenancy: Identity Metadata vs Isolation Reality"
          description="Visual analysis of tenant identifier handling: illustrates where tenant_id is assigned and validated in ingestion envelopes, contrasted with the absence of tenant columns in ClickHouse tables and query filters."
          statusNote="AUDIT VERDICT: METADATA ONLY · ISOLATION PLANNED"
        >
          <MultiTenantArchitectureDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Honest Assessment of Current Tenant Isolation</h4>
          <p>
            The technical audit established that SysMon cannot be claimed as a production multi-tenant platform today:
          </p>
          <ul>
            <li><strong>What is Implemented:</strong> <code>DEFAULT_TENANT_ID</code> is configured in backend settings. Enrolled agents are assigned to this tenant, and ingestion rejects envelopes where <code>tenant_id</code> does not match the token's bound identity.</li>
            <li><strong>What is Missing:</strong> ClickHouse <code>DEVICES</code>, <code>EVENTS</code>, <code>ALERTS</code>, and <code>AGENT_HEALTH</code> tables have no <code>tenant_id</code> column. Administrative API queries are global and do not filter by tenant.</li>
            <li><strong>Roadmap Path:</strong> Full tenant isolation (tenant provisioning CRUD, tenant partition keys in ClickHouse, and per-tenant admin RBAC) is planned for Roadmap Phase 4.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 8: DETECTION ENGINE & ALERT DISPATCH */}
      <section className="section" id="diagram-detection">
        <DiagramCard
          id="detection-arch"
          number="08"
          title="Detection Engine &amp; Alert Dispatch Workflow"
          description="Worker detection architecture: streaming consumption of authentication rows, evaluation against YAML rules (Threshold, Pattern Match, and Time Window conditions), insertion into ClickHouse ALERTS, and webhook dispatch to Slack, Discord, and SMTP."
          statusNote="19 ENGINE TESTS PASSING"
        >
          <DetectionAlertPipelineDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Detection Execution Details</h4>
          <p>
            The detection engine in <code>worker/detection/engine.py</code> evaluates rules against incoming authentication events:
          </p>
          <ul>
            <li><strong>Evaluation Scope:</strong> Only <code>security.auth</code> records (Event IDs 4624/4625) are currently evaluated. Process lifecycle events are not inspected by rules.</li>
            <li><strong>In-Memory Sliding Windows:</strong> Threshold rules maintain deque queues in process memory to count occurrences over sliding time windows (e.g. 5 failures within 60s). Threshold state is in-memory and resets on worker restart.</li>
            <li><strong>Dispatch Adapters:</strong> When a rule fires, a <code>FiredAlert</code> object is committed to ClickHouse and fanned out to configured notification channels (Slack webhook, Discord webhook, or SMTP email).</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 9: DATABASE SCHEMAS */}
      <section className="section" id="diagram-database">
        <DiagramCard
          id="database-schemas"
          number="09"
          title="Database Schemas: SQLite State &amp; ClickHouse Analytics"
          description="Complete relational and columnar database models: SQLite tables (admin_users, admin_sessions, agents, agent_credentials, telemetry_receipts) and ClickHouse MergeTree tables (DEVICES, EVENTS, ALERTS, AGENT_HEALTH) with their exact sorting keys."
          statusNote="ACTIVE DATABASE DEFINITIONS"
        >
          <DatabaseSchemaDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Dual-Store Database Architecture</h4>
          <p>
            SysMon utilizes SQLite for transactional consistency and ClickHouse for analytical scale:
          </p>
          <ul>
            <li><strong>SQLite for State:</strong> Manages administrative users, password hashes (Argon2id), active sessions, agent tokens, and deduplication receipts. Located in <code>data/sysmon_auth.db</code>.</li>
            <li><strong>ClickHouse for Telemetry:</strong> Stores high-volume telemetry records in <code>MergeTree</code> tables sorted by <code>(agent_id, updated_at)</code> or <code>(triggered_at, severity, agent_id)</code>.</li>
            <li><strong>PostgreSQL Status:</strong> PostgreSQL is not used in the current codebase; earlier references in documentation were design intentions, not implemented code.</li>
          </ul>
        </div>
      </section>

      {/* DIAGRAM 10: DEPLOYMENT TOPOLOGY */}
      <section className="section" id="diagram-deployment">
        <DiagramCard
          id="deployment-topology"
          number="10"
          title="Deployment Topology: Current Compose Stacks vs Target"
          description="Comparison between the currently implemented infrastructure (three separate Docker Compose configurations for Kafka KRaft, ClickHouse, and Valkey) and the planned unified self-hosted stack with automated TLS ingress."
          statusNote="INFRASTRUCTURE AUDIT SPEC"
        >
          <DeploymentTopologyDiagram />
        </DiagramCard>

        <div className="arch-explanation">
          <h4>Current Deployment Requirements</h4>
          <p>
            To operate SysMon in self-hosted environments today:
          </p>
          <ul>
            <li><strong>Separate Stacks:</strong> Start infrastructure using the three individual Compose files in <code>infra/kafka/</code>, <code>infra/clickhouse/</code>, and <code>infra/redis/</code>.</li>
            <li><strong>Manual Services:</strong> Backend and worker are started as Python processes (<code>python -m backend</code> and <code>python -m worker.main</code>).</li>
            <li><strong>Port Alignment:</strong> Note that ClickHouse published HTTP port is 8123, while worker configuration defaults to 8443 unless overridden via <code>CLICKHOUSE_PORT=8123</code>.</li>
          </ul>
        </div>
      </section>

      {/* KEY ARCHITECTURAL DECISIONS */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">ENGINEERING RATIONALE</p>
          <h2>Key Architectural Decisions</h2>
          <p>Why specific technologies and patterns were selected for SysMon.</p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <span className="mono-label">MESSAGING</span>
            <h3>Why Apache Kafka?</h3>
            <p>
              Decouples telemetry ingestion from database persistence. If ClickHouse is undergoing
              maintenance or re-indexing, the FastAPI gateway continues accepting agent events and
              acknowledging Kafka offsets, preventing endpoint queue overflows.
            </p>
          </article>

          <article className="detail-card">
            <span className="mono-label">ANALYTICS STORAGE</span>
            <h3>Why ClickHouse MergeTree?</h3>
            <p>
              Columnar storage provides high compression ratios (typically 5x–10x) and sub-second
              analytical queries over millions of telemetry rows without requiring memory-heavy
              relational indexes.
            </p>
          </article>

          <article className="detail-card">
            <span className="mono-label">CREDENTIAL LIFECYCLE</span>
            <h3>Why Rotating Bearer Tokens?</h3>
            <p>
              Static tokens present high risk if an endpoint is compromised. SysMon uses 1-hour
              tokens with 5-minute renewal windows and atomic file swaps, minimizing credential exposure
              windows while preserving offline resilience.
            </p>
          </article>

          <article className="detail-card">
            <span className="mono-label">OFFLINE QUEUING</span>
            <h3>Why SQLite WAL for Endpoint Buffers?</h3>
            <p>
              In-memory queues lose telemetry if an endpoint reboots. File-based append-only text logs
              require complex parsing. SQLite in WAL mode offers transactional reliability, fast FIFO
              queries, and bounded capacity controls in a zero-dependency C binary.
            </p>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="closing-cta">
        <div className="closing-main">
          <div>
            <h2>Explore the complete API reference or setup guide.</h2>
            <p>30 active endpoints, verified schemas, and operational instructions.</p>
          </div>
          <div className="closing-actions">
            <button
              className="button button-light"
              type="button"
              onClick={() => navigateTo("/docs/api-reference/overview")}
            >
              API Reference <Arrow diagonal />
            </button>
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

