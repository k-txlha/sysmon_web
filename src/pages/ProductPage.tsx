import { StatusBadge } from "../components/StatusBadge";

interface ProductPageProps {
  onNavigate?: (path: string) => void;
}

export function ProductPage({ onNavigate }: ProductPageProps) {
  const navigateTo = (path: string) => {
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  return (
    <div className="subpage-container">
      {/* HEADER HERO */}
      <section className="subpage-hero">
        <div className="subpage-hero-copy">
          <p className="section-label">PRODUCT OVERVIEW &amp; CAPABILITIES</p>
          <h1>Endpoint visibility without complexity.</h1>
          <p className="subpage-hero-description">
            SysMon is an open-source, self-hosted endpoint monitoring platform built
            to give engineering and security teams clear visibility into what runs
            across their infrastructure. It couples a lightweight cross-platform sensor
            with an asynchronous Kafka and ClickHouse telemetry pipeline.
          </p>
          <div className="hero-status">
            CURRENT MATURITY: EARLY FUNCTIONAL PROTOTYPE · 118 VERIFIED TESTS<br />
            <span>Not a commercial EDR replacement. Designed for self-hosted inspection and telemetry collection.</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: ENDPOINT MONITORING */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">01 / ENDPOINT SENSING</p>
          <h2>Detailed host &amp; process telemetry.</h2>
          <p>
            The SysMon agent runs as a background process or system service, periodically
            collecting host metrics, process activity, and authentication logs directly from OS APIs.
          </p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">PROCESS EXECUTION</span>
              <StatusBadge status="available" />
            </div>
            <h3>Process Lineage &amp; Metadata</h3>
            <p>
              The <code>ProcessCollector</code> inspects running processes using <code>psutil</code>, capturing:
            </p>
            <ul className="spec-list">
              <li><strong>Process ID (PID) &amp; Parent PID (PPID):</strong> Establishes direct parent-child relationships.</li>
              <li><strong>Executable Name &amp; Full Path:</strong> Binary location on disk.</li>
              <li><strong>Command-Line Arguments:</strong> Exact execution arguments without truncation.</li>
              <li><strong>Execution Identity:</strong> Username and current working directory.</li>
              <li><strong>Start Timestamp:</strong> Monotonic process start time in ISO-8601 UTC.</li>
            </ul>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">BINARY INTEGRITY</span>
              <StatusBadge status="available" />
            </div>
            <h3>SHA-256 Executable Hashing</h3>
            <p>
              When enumerating processes, the collector reads the executable binary from
              disk and calculates a cryptographic SHA-256 fingerprint.
            </p>
            <div className="diagram-snippet">
              <code>sha256 = hashlib.sha256(f.read()).hexdigest()</code>
              <small>Fingerprints active binaries to support threat intelligence matching.</small>
            </div>
            <p className="audit-note">
              Note: Cryptographic hashing is implemented. Malware verdict scoring and cloud reputation lookups are planned future capabilities.
            </p>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">LIFECYCLE DIFFING</span>
              <StatusBadge status="in-development" />
            </div>
            <h3>Process Start &amp; Exit Diffing</h3>
            <p>
              The agent maintains in-memory state of running processes identified by <code>(pid, process_start_time)</code>.
              On each poll:
            </p>
            <ul className="spec-list">
              <li><strong>Initial Snapshot:</strong> Emits full <code>process.snapshot</code> on first loop iteration.</li>
              <li><strong>Process Starts:</strong> Newly discovered processes emit <code>process.start</code> events.</li>
              <li><strong>Process Exits:</strong> Terminated processes emit <code>process.exit</code> with observed exit timestamp.</li>
            </ul>
            <p className="audit-note warning">
              Pipeline Notice: Process events are actively emitted by the agent, but the current backend worker does not yet persist them to ClickHouse.
            </p>
          </article>

          <article className="detail-card">
            <div className="detail-card-top">
              <span className="mono-label">AUTHENTICATION LOGS</span>
              <StatusBadge status="partially-implemented" />
            </div>
            <h3>OS Authentication Events</h3>
            <p>
              Platform collectors parse local operating system authentication records into normalized records:
            </p>
            <ul className="spec-list">
              <li><strong>Windows:</strong> Queries Security Event Log via <code>pywin32</code> for Event IDs 4624 (Logon Success) and 4625 (Logon Failure).</li>
              <li><strong>Linux:</strong> Scans readable auth logs (<code>/var/log/auth.log</code>, <code>secure</code>) with fallback to <code>journalctl</code>.</li>
              <li><strong>macOS:</strong> Bounded query over recent <code>log show</code> for loginwindow, sshd, and sudo.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* SECTION 2: TELEMETRY COLLECTION & QUEUING */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">02 / TELEMETRY RESILIENCE</p>
          <h2>Reliable collection with bounded offline buffering.</h2>
          <p>
            Network partitions and server maintenance should not cause silent telemetry loss.
            SysMon incorporates durable local storage and controlled retry policies.
          </p>
        </div>

        <div className="feature-comparison-table-wrap">
          <table className="feature-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Implementation Specification</th>
                <th>Verified Behavior &amp; Limits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>EventEnvelope v1</strong></td>
                <td>Pydantic model with UUIDv4 event_id, sequence counter, host_id, agent_id, and severity enum.</td>
                <td>Enforces strict schema typing before local write and network transmission.</td>
              </tr>
              <tr>
                <td><strong>Local SQLite Buffer</strong></td>
                <td>Embedded SQLite queue located at <code>agent/.agent_buffer.db</code> in WAL journal mode.</td>
                <td><code>synchronous=FULL</code> ensures durable on-disk writes before transport delivery.</td>
              </tr>
              <tr>
                <td><strong>Queue Capacity Limits</strong></td>
                <td>Configured via <code>SIEM_BUFFER_MAX_EVENTS</code> (default 25,000) and <code>SIEM_BUFFER_MAX_BYTES</code> (50 MiB).</td>
                <td>Oldest records evicted on overflow (FIFO). Dropped count metric tracked in health envelope.</td>
              </tr>
              <tr>
                <td><strong>Queue Retention</strong></td>
                <td>Configured via <code>SIEM_BUFFER_RETENTION_SECONDS</code> (default 7 days / 604,800s).</td>
                <td>Events older than retention threshold are purged automatically during queue maintenance.</td>
              </tr>
              <tr>
                <td><strong>Transport Delivery</strong></td>
                <td>HTTPS POST to <code>/api/v1/telemetry</code> with Bearer Authorization header.</td>
                <td>Batches up to 50 envelopes per request; max 10 batches per drain loop.</td>
              </tr>
              <tr>
                <td><strong>Retry Backoff</strong></td>
                <td>Exponential backoff with randomized jitter, capping at 300 seconds.</td>
                <td>Server 429 <code>Retry-After</code> headers are parsed and strictly honored by the agent.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: CENTRALIZED VISIBILITY */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">03 / CENTRALIZED VISIBILITY</p>
          <h2>Operational visibility into the fleet.</h2>
          <p>
            The platform provides web-based investigation views backed by ClickHouse MergeTree tables.
          </p>
        </div>

        <div className="detail-cards-grid">
          <article className="detail-card">
            <span className="mono-label">INVENTORY MANAGEMENT</span>
            <h3>Device Fleet Inventory</h3>
            <p>
              The <code>DEVICES</code> table stores the latest known state for every enrolled endpoint.
              Queried via <code>GET /api/v1/devices</code> with summary aggregates from <code>/stats</code>.
            </p>
            <ul className="spec-list">
              <li>Hostname, primary IP, and MAC address identity</li>
              <li>Operating system release, kernel, and machine architecture</li>
              <li>Agent status (Active vs Revoked in SQLite registry)</li>
              <li>Latest check-in timestamp and health diagnostic readings</li>
            </ul>
          </article>

          <article className="detail-card">
            <span className="mono-label">AUTHENTICATION AUDIT</span>
            <h3>Authentication Event Explorer</h3>
            <p>
              The <code>EVENTS</code> table stores normalized login records from all monitored operating systems.
              Queried via <code>GET /api/v1/events</code>.
            </p>
            <ul className="spec-list">
              <li>Filter by status (SUCCESS vs FAILURE)</li>
              <li>Filter by target username or source IP address</li>
              <li>Filter by logon type (SSH, Interactive, Service)</li>
              <li>Time-range bounding for forensic triage</li>
            </ul>
          </article>

          <article className="detail-card">
            <span className="mono-label">ALERT MANAGEMENT</span>
            <h3>Threat &amp; Alert Management</h3>
            <p>
              The <code>ALERTS</code> table records detection rule firings.
              Queried via <code>GET /api/v1/alerts</code> and resolved via <code>PATCH /api/v1/alerts/{'{id}'}/resolve</code>.
            </p>
            <ul className="spec-list">
              <li>Severity classification (Informational, Low, Medium, High, Critical)</li>
              <li>Rule name and triggered condition summary</li>
              <li>JSON forensic context containing offending event attributes</li>
              <li>Resolution state tracking (Open vs Resolved)</li>
            </ul>
          </article>
        </div>
      </section>

      {/* SECTION 4: DETECTION ENGINE */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">04 / DETECTION ENGINE</p>
          <h2>Server-side YAML detection rules.</h2>
          <p>
            The worker evaluates authentication telemetry against configurable detection rules
            defined in YAML files, dispatching alerts to external channels.
          </p>
        </div>

        <div className="detection-rules-summary">
          <p>
            The detection engine evaluates authentication records in near-real-time.
            Seven rules are currently loaded at worker startup:
          </p>
          <div className="rules-grid-mini">
            <div className="rule-item">
              <strong>brute_force</strong>
              <span>≥5 login failures from same IP within 60 seconds (Critical)</span>
            </div>
            <div className="rule-item">
              <strong>after_hours_login</strong>
              <span>Successful authentication between 22:00 and 06:00 UTC (High)</span>
            </div>
            <div className="rule-item">
              <strong>privileged_account_login</strong>
              <span>Logins involving root, administrator, or admin usernames (High)</span>
            </div>
            <div className="rule-item">
              <strong>multiple_ip_login</strong>
              <span>3+ authentication events for a user in 5 minutes (Critical)</span>
            </div>
            <div className="rule-item">
              <strong>new_device_seen</strong>
              <span>Evaluates authentication events grouped per agent (Medium)</span>
            </div>
            <div className="rule-item">
              <strong>off_hours_service_start</strong>
              <span>Successful logons during 20:00–07:00 UTC window (Medium)</span>
            </div>
            <div className="rule-item">
              <strong>repeated_logon_type_change</strong>
              <span>≥4 successful events per username in 180 seconds (High)</span>
            </div>
          </div>
          <div className="section-action-bar" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigateTo("/features")}
            >
              Read In-Depth Rule Analysis in Features Index <Arrow diagonal />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="closing-cta">
        <div className="closing-main">
          <div>
            <h2>Inspect the architecture behind the product.</h2>
            <p>Review the data flow, Kafka messaging pipelines, and database schemas.</p>
          </div>
          <div className="closing-actions">
            <button
              className="button button-light"
              type="button"
              onClick={() => navigateTo("/architecture")}
            >
              View System Architecture <Arrow diagonal />
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

