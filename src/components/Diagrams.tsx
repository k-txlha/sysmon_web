import React from "react";

interface DiagramCardProps {
  id: string;
  number: string;
  title: string;
  description: string;
  statusNote?: string;
  children: React.ReactNode;
}

export function DiagramCard({
  id,
  number,
  title,
  description,
  statusNote,
  children,
}: DiagramCardProps) {
  return (
    <article className="diagram-card" id={id}>
      <div className="diagram-header">
        <div className="diagram-meta">
          <span className="mono-label">{number} / ARCHITECTURE DIAGRAM</span>
          <h3>{title}</h3>
        </div>
        {statusNote && (
          <span className="diagram-status-tag">{statusNote}</span>
        )}
      </div>
      <p className="diagram-desc">{description}</p>
      <div className="diagram-canvas" tabIndex={0} aria-label={`${title} diagram`}>
        {children}
      </div>
      <div className="diagram-footer">
        <span>SYSMON ENGINEERING SPEC · VERIFIED AGAINST REPORT.MD</span>
        <span>SVG / CLIENT-SIDE VECTOR</span>
      </div>
    </article>
  );
}

/** 1. High-Level System Architecture */
export function SystemArchitectureDiagram() {
  return (
    <svg viewBox="0 0 1000 480" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
        <marker id="arrow-muted" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#899cb3" />
        </marker>
      </defs>

      {/* Grid background lines */}
      <rect x="0" y="0" width="1000" height="480" fill="#f8f6f0" rx="4" />
      <rect x="10" y="10" width="980" height="460" fill="none" stroke="#e2e6ea" strokeWidth="1" />

      {/* ZONE 1: ENDPOINT */}
      <rect x="30" y="40" width="220" height="400" rx="2" fill="#f4f1e9" stroke="#182d4d" strokeWidth="1.5" />
      <rect x="30" y="40" width="220" height="32" fill="#182d4d" />
      <text x="42" y="61" fill="#f4f1e9" fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="600">ENDPOINT (AGENT PROCESS)</text>
      <text x="42" y="90" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">CROSS-PLATFORM SENSOR</text>
      
      {/* Agent internal blocks */}
      <rect x="45" y="105" width="190" height="52" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="55" y="125" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Collectors</text>
      <text x="55" y="143" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">psutil · OS logs · Proc diff</text>

      <rect x="45" y="170" width="190" height="52" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="55" y="190" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">TelemetryAssembler</text>
      <text x="55" y="208" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">EventEnvelope v1 + sequence</text>

      <rect x="45" y="235" width="190" height="52" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="55" y="255" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Local SQLite Buffer</text>
      <text x="55" y="273" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">WAL · 25k cap · 50MB · FIFO</text>

      <rect x="45" y="300" width="190" height="52" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="55" y="320" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">TokenManager</text>
      <text x="55" y="338" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">1h rotating token · 5m renew</text>

      <rect x="45" y="365" width="190" height="58" fill="#e5eaf0" stroke="#4778b8" strokeWidth="1" />
      <text x="55" y="386" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">HTTP/TLS Transport</text>
      <text x="55" y="404" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">POST /api/v1/telemetry</text>
      <text x="55" y="416" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Exponential backoff + jitter</text>

      {/* Internal flow arrows */}
      <line x1="140" y1="157" x2="140" y2="170" stroke="#4778b8" strokeWidth="1.2" markerEnd="url(#arrow)" />
      <line x1="140" y1="222" x2="140" y2="235" stroke="#4778b8" strokeWidth="1.2" markerEnd="url(#arrow)" />
      <line x1="140" y1="287" x2="140" y2="300" stroke="#4778b8" strokeWidth="1.2" markerEnd="url(#arrow)" />
      <line x1="140" y1="352" x2="140" y2="365" stroke="#4778b8" strokeWidth="1.2" markerEnd="url(#arrow)" />

      {/* CONNECTOR: AGENT TO GATEWAY */}
      <path d="M 235 394 L 320 394 L 320 180 L 340 180" fill="none" stroke="#4778b8" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="250" y="380" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">HTTPS POST</text>
      <text x="250" y="390" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Bearer auth</text>

      {/* ZONE 2: FASTAPI BACKEND GATEWAY */}
      <rect x="345" y="40" width="220" height="400" rx="2" fill="#f4f1e9" stroke="#182d4d" strokeWidth="1.5" />
      <rect x="345" y="40" width="220" height="32" fill="#182d4d" />
      <text x="357" y="61" fill="#f4f1e9" fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="600">FASTAPI GATEWAY (:8000)</text>
      <text x="357" y="90" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">30 MOUNTED OPERATIONS</text>

      <rect x="360" y="105" width="190" height="48" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="370" y="125" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Auth &amp; Rate Limiting</text>
      <text x="370" y="142" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">Argon2id · Valkey / local-mem</text>

      <rect x="360" y="165" width="190" height="62" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="370" y="185" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Ingestion Router</text>
      <text x="370" y="202" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">Pydantic validation</text>
      <text x="370" y="216" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Identity match · Duplicate drop</text>

      <rect x="360" y="240" width="190" height="52" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="370" y="260" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">SQLite State (data/)</text>
      <text x="370" y="278" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">admin_users · agents · receipts</text>

      <rect x="360" y="305" width="190" height="56" fill="#e5eaf0" stroke="#4778b8" strokeWidth="1" />
      <text x="370" y="325" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">aiokafka Producer</text>
      <text x="370" y="342" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">acks="all" · idempotent</text>
      <text x="370" y="354" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">gzip compression</text>

      <rect x="360" y="375" width="190" height="52" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="370" y="395" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Query Routers (Admin)</text>
      <text x="370" y="413" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="9">devices · alerts · events · stats</text>

      {/* CONNECTOR: GATEWAY TO KAFKA */}
      <path d="M 550 333 L 610 333" fill="none" stroke="#4778b8" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="555" y="324" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">JSON</text>

      {/* ZONE 3: MESSAGING (KAFKA) */}
      <rect x="615" y="295" width="120" height="78" rx="2" fill="#182d4d" stroke="#182d4d" strokeWidth="1" />
      <text x="625" y="320" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Apache Kafka</text>
      <text x="625" y="338" fill="#8cb5e6" fontFamily="'JetBrains Mono', monospace" fontSize="9">KRaft Cluster</text>
      <text x="625" y="352" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">telemetry_data</text>

      {/* CONNECTOR: KAFKA TO WORKER */}
      <path d="M 735 333 L 780 333 L 780 180 L 800 180" fill="none" stroke="#4778b8" strokeWidth="2" markerEnd="url(#arrow)" />

      {/* ZONE 4: WORKER & STORAGE */}
      <rect x="805" y="40" width="170" height="400" rx="2" fill="#f4f1e9" stroke="#182d4d" strokeWidth="1.5" />
      <rect x="805" y="40" width="170" height="32" fill="#182d4d" />
      <text x="817" y="61" fill="#f4f1e9" fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="600">WORKER &amp; STORAGE</text>
      <text x="817" y="90" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">CONSUMER / DETECT</text>

      <rect x="815" y="105" width="150" height="60" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="823" y="125" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Worker Consumer</text>
      <text x="823" y="142" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">Batch flush: 1000/5s</text>
      <text x="823" y="156" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">⚠ Drops proc events</text>

      <rect x="815" y="175" width="150" height="60" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="823" y="195" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Detection Engine</text>
      <text x="823" y="212" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">7 YAML Rules (Auth)</text>
      <text x="823" y="226" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Threshold · Win · Pattern</text>

      <rect x="815" y="245" width="150" height="60" fill="#ffffff" stroke="#c9ced2" strokeWidth="1" />
      <text x="823" y="265" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Alert Dispatcher</text>
      <text x="823" y="282" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Slack · Discord · SMTP</text>
      <text x="823" y="296" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">FiredAlert payload</text>

      <rect x="815" y="315" width="150" height="70" fill="#e5eaf0" stroke="#4778b8" strokeWidth="1" />
      <text x="823" y="335" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">ClickHouse</text>
      <text x="823" y="352" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">MergeTree Tables:</text>
      <text x="823" y="365" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="8">DEVICES · EVENTS</text>
      <text x="823" y="377" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="8">ALERTS · AGENT_HEALTH</text>

      {/* Query back-channel from ClickHouse to Backend Query Routers */}
      <path d="M 815 350 L 550 401" fill="none" stroke="#899cb3" strokeWidth="1" strokeDasharray="3 3" markerEnd="url(#arrow-muted)" />
      <text x="640" y="415" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">SQL queries (admin)</text>
    </svg>
  );
}

/** 2. Endpoint Agent Architecture */
export function AgentArchitectureDiagram() {
  return (
    <svg viewBox="0 0 960 400" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ag-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
      </defs>

      <rect x="0" y="0" width="960" height="400" fill="#f8f6f0" rx="4" />
      
      {/* Top Banner */}
      <rect x="20" y="20" width="920" height="40" fill="#182d4d" rx="2" />
      <text x="35" y="45" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">Endpoint Sensor Architecture</text>
      <text x="500" y="45" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">POLLING INTERVAL: 5s (DEFAULT) · THREAD-SAFE</text>

      {/* Phase 1: Host Collectors */}
      <rect x="20" y="80" width="210" height="300" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <text x="35" y="105" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">1. Collectors</text>
      <text x="35" y="122" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">HOST &amp; PROCESS POLING</text>

      <rect x="35" y="135" width="180" height="46" fill="#fff" stroke="#d7d9d7" />
      <text x="45" y="154" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">SystemCollector</text>
      <text x="45" y="169" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">CPU %, RAM, host IP/MAC</text>

      <rect x="35" y="190" width="180" height="56" fill="#fff" stroke="#d7d9d7" />
      <text x="45" y="209" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">ProcessCollector</text>
      <text x="45" y="224" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">PID, PPID, cmdline, start_time</text>
      <text x="45" y="236" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">SHA-256 hash diffing</text>

      <rect x="35" y="255" width="180" height="56" fill="#fff" stroke="#d7d9d7" />
      <text x="45" y="274" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Platform OSCollector</text>
      <text x="45" y="289" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Win: Event 4624/4625 (pywin32)</text>
      <text x="45" y="301" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Linux: PAM/SSH / journalctl</text>

      <rect x="35" y="320" width="180" height="44" fill="#fff" stroke="#d7d9d7" />
      <text x="45" y="338" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Agent Health Collector</text>
      <text x="45" y="352" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Agent CPU %, RSS MB, queue depth</text>

      {/* Arrow 1 to 2 */}
      <line x1="230" y1="230" x2="260" y2="230" stroke="#4778b8" strokeWidth="2" markerEnd="url(#ag-arr)" />

      {/* Phase 2: Assembly */}
      <rect x="265" y="80" width="200" height="300" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <text x="280" y="105" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">2. Assembler</text>
      <text x="280" y="122" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">ENVELOPE SERIALIZATION</text>

      <rect x="280" y="140" width="170" height="150" fill="#fff" stroke="#d7d9d7" />
      <text x="290" y="162" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">EventEnvelope</text>
      <text x="290" y="180" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• event_id: UUIDv4</text>
      <text x="290" y="196" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• schema_version: 1</text>
      <text x="290" y="212" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• tenant_id: string</text>
      <text x="290" y="228" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• host_id / agent_id</text>
      <text x="290" y="244" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• event_type &amp; sequence</text>
      <text x="290" y="260" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• severity &amp; data dict</text>
      <text x="290" y="276" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">• observed_at: UTC</text>

      <rect x="280" y="300" width="170" height="64" fill="#e5eaf0" stroke="#4778b8" />
      <text x="290" y="320" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="600">Sequence Counter</text>
      <text x="290" y="336" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Monotonic per process run</text>
      <text x="290" y="350" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Tracks gap &amp; loss metrics</text>

      {/* Arrow 2 to 3 */}
      <line x1="465" y1="230" x2="495" y2="230" stroke="#4778b8" strokeWidth="2" markerEnd="url(#ag-arr)" />

      {/* Phase 3: Bounded Storage */}
      <rect x="500" y="80" width="200" height="300" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <text x="515" y="105" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">3. SQLite Queue</text>
      <text x="515" y="122" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">BOUNDED OFFLINE BUFFER</text>

      <rect x="515" y="140" width="170" height="110" fill="#fff" stroke="#d7d9d7" />
      <text x="525" y="162" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">LocalBoundedBuffer</text>
      <text x="525" y="180" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• WAL Journal Mode</text>
      <text x="525" y="196" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• synchronous=FULL</text>
      <text x="525" y="212" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Cap: 25,000 events</text>
      <text x="525" y="228" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Max size: 50 MiB</text>
      <text x="525" y="242" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Retention: 7 days</text>

      <rect x="515" y="260" width="170" height="104" fill="#e5eaf0" stroke="#c9ced2" />
      <text x="525" y="280" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="600">Queue Overflow Semantics</text>
      <text x="525" y="298" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">FIFO eviction of older events</text>
      <text x="525" y="312" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">dropped_count tracked</text>
      <text x="525" y="328" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Acks required before deletion</text>
      <text x="525" y="344" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">Best-effort, not lossless</text>

      {/* Arrow 3 to 4 */}
      <line x1="700" y1="230" x2="730" y2="230" stroke="#4778b8" strokeWidth="2" markerEnd="url(#ag-arr)" />

      {/* Phase 4: Token Manager & Transport */}
      <rect x="735" y="80" width="205" height="300" fill="#f4f1e9" stroke="#182d4d" strokeWidth="1.5" rx="2" />
      <text x="750" y="105" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">4. Transport &amp; Auth</text>
      <text x="750" y="122" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">SECURE TRANSMISSION</text>

      <rect x="750" y="140" width="175" height="96" fill="#fff" stroke="#d7d9d7" />
      <text x="760" y="162" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">AgentTokenManager</text>
      <text x="760" y="180" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">1h rotating operational token</text>
      <text x="760" y="196" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Renew thread: 5min window</text>
      <text x="760" y="212" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Atomic file swap (.env)</text>
      <text x="760" y="226" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">Overlap recovery window</text>

      <rect x="750" y="246" width="175" height="118" fill="#e5eaf0" stroke="#4778b8" />
      <text x="760" y="266" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">ship_to_backend()</text>
      <text x="760" y="284" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">HTTPS enforced in prod</text>
      <text x="760" y="298" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Header: Bearer &lt;TOKEN&gt;</text>
      <text x="760" y="312" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Batch limit: 50 envelopes</text>
      <text x="760" y="326" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Exponential backoff (max 300s)</text>
      <text x="760" y="340" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Retry-After header respected</text>
      <text x="760" y="354" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="8">Awaits exact accepted IDs</text>
    </svg>
  );
}

/** 3. Telemetry Pipeline Data Flow */
export function TelemetryDataFlowDiagram() {
  return (
    <svg viewBox="0 0 1000 480" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="flow-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
        <marker id="drop-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e18b7e" />
        </marker>
      </defs>

      <rect x="0" y="0" width="1000" height="480" fill="#f8f6f0" rx="4" />
      
      {/* Top Header */}
      <rect x="20" y="20" width="960" height="42" fill="#182d4d" rx="2" />
      <text x="35" y="46" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">Telemetry Data Flow &amp; Pipeline Stages</text>
      <text x="580" y="46" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">AUDIT FINDING: WORKER PERSISTS 3 OF 6 TYPES</text>

      {/* STAGE 1: ENDPOINT EXECUTION */}
      <rect x="20" y="80" width="170" height="130" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="30" y="102" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 1</text>
      <text x="30" y="120" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Host Activity</text>
      <text x="30" y="140" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Process start/exit</text>
      <text x="30" y="155" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• CPU/RAM metrics</text>
      <text x="30" y="170" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Auth events 4624/4625</text>
      <text x="30" y="185" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Agent health check</text>

      {/* Arrow 1 to 2 */}
      <line x1="190" y1="145" x2="215" y2="145" stroke="#4778b8" strokeWidth="2" markerEnd="url(#flow-arr)" />

      {/* STAGE 2: LOCAL BUFFER */}
      <rect x="220" y="80" width="170" height="130" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="230" y="102" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 2</text>
      <text x="230" y="120" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">SQLite FIFO Buffer</text>
      <text x="230" y="140" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• WAL persistence</text>
      <text x="230" y="155" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Bounded queue (25k)</text>
      <text x="230" y="170" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• FIFO eviction on cap</text>
      <text x="230" y="185" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Preserves offline rows</text>

      {/* Arrow 2 to 3 */}
      <line x1="390" y1="145" x2="415" y2="145" stroke="#4778b8" strokeWidth="2" markerEnd="url(#flow-arr)" />

      {/* STAGE 3: INGESTION GATEWAY */}
      <rect x="420" y="80" width="175" height="130" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="430" y="102" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 3</text>
      <text x="430" y="120" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">FastAPI Ingestion</text>
      <text x="430" y="140" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Bearer token verify</text>
      <text x="430" y="155" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Batch schema validation</text>
      <text x="430" y="170" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• SQLite receipt dedupe</text>
      <text x="430" y="185" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Acks after Kafka send</text>

      {/* Arrow 3 to 4 */}
      <line x1="595" y1="145" x2="620" y2="145" stroke="#4778b8" strokeWidth="2" markerEnd="url(#flow-arr)" />

      {/* STAGE 4: KAFKA TOPIC */}
      <rect x="625" y="80" width="160" height="130" fill="#182d4d" stroke="#182d4d" rx="2" />
      <text x="635" y="102" fill="#8cb5e6" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 4</text>
      <text x="635" y="120" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Kafka Topic</text>
      <text x="635" y="140" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">• topic: telemetry_data</text>
      <text x="635" y="155" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">• acks="all" (idempotent)</text>
      <text x="635" y="170" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Key: agent_id:event_id</text>
      <text x="635" y="185" fill="#8cb5e6" fontFamily="'JetBrains Mono', monospace" fontSize="8">• KRaft 3-broker cluster</text>

      {/* Arrow 4 to 5 */}
      <line x1="785" y1="145" x2="810" y2="145" stroke="#4778b8" strokeWidth="2" markerEnd="url(#flow-arr)" />

      {/* STAGE 5: WORKER CONSUMER */}
      <rect x="815" y="80" width="165" height="130" fill="#fff" stroke="#182d4d" strokeWidth="1.5" rx="2" />
      <text x="825" y="102" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 5</text>
      <text x="825" y="120" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Worker Consumer</text>
      <text x="825" y="140" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Deserializes JSON batch</text>
      <text x="825" y="155" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Buffers up to 1000 items</text>
      <text x="825" y="170" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• 5s flush interval</text>
      <text x="825" y="185" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Type-based routing</text>

      {/* BRANCHING: SPLIT WORKER DOWNWARDS */}
      <path d="M 897 210 L 897 260" fill="none" stroke="#4778b8" strokeWidth="2" markerEnd="url(#flow-arr)" />

      {/* TYPE ROUTING DECISION BOX */}
      <rect x="740" y="265" width="240" height="50" fill="#e5eaf0" stroke="#4778b8" rx="2" />
      <text x="750" y="285" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Worker Event Type Routing</text>
      <text x="750" y="302" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Evaluates event_type field</text>

      {/* BRANCH A: STORED TYPES */}
      <path d="M 740 290 L 580 290 L 580 340" fill="none" stroke="#4778b8" strokeWidth="2" markerEnd="url(#flow-arr)" />
      <text x="610" y="282" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">3 SUPPORTED TYPES</text>

      <rect x="420" y="340" width="280" height="120" fill="#fff" stroke="#4778b8" strokeWidth="1.5" rx="2" />
      <text x="430" y="360" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">CLICKHOUSE MERGETREE INSERTS</text>
      <text x="430" y="380" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9">✓ telemetry.snapshot → DEVICES</text>
      <text x="430" y="400" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9">✓ security.auth → EVENTS + Detection</text>
      <text x="430" y="420" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9">✓ agent.health → AGENT_HEALTH</text>
      <text x="430" y="442" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Exception logged; buffer cleared (no offset retry)</text>

      {/* BRANCH B: DROPPED TYPES */}
      <path d="M 980 290 L 980 340" fill="none" stroke="#e18b7e" strokeWidth="2" markerEnd="url(#drop-arr)" />
      <text x="830" y="335" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="9">UNMAPPED / DROPPED</text>

      <rect x="730" y="340" width="250" height="120" fill="#fcf3f2" stroke="#e18b7e" strokeWidth="1.5" rx="2" />
      <text x="740" y="360" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="9">NOT PERSISTED BY CURRENT WORKER</text>
      <text x="740" y="380" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="9">✗ process.snapshot</text>
      <text x="740" y="400" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="9">✗ process.start</text>
      <text x="740" y="420" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="9">✗ process.exit</text>
      <text x="740" y="442" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">Emitted by sensor, but ignored by worker</text>

      {/* Query view back-arrow */}
      <path d="M 420 400 L 120 400 L 120 230" fill="none" stroke="#899cb3" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#flow-arr)" />
      <text x="140" y="392" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Dashboard query via /api/v1/devices, /events, /alerts</text>
    </svg>
  );
}

/** 4. Agent Enrollment Sequence */
export function EnrollmentSequenceDiagram() {
  return (
    <svg viewBox="0 0 940 420" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="seq-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#182d4d" />
        </marker>
        <marker id="seq-ret" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
      </defs>

      <rect x="0" y="0" width="940" height="420" fill="#f8f6f0" rx="4" />
      
      {/* Sequence Lifelines */}
      <g fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600" textAnchor="middle">
        {/* Admin */}
        <rect x="40" y="20" width="130" height="34" fill="#182d4d" rx="2" />
        <text x="105" y="42" fill="#fff">Administrator</text>
        <line x1="105" y1="54" x2="105" y2="400" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />

        {/* Dashboard / UI */}
        <rect x="230" y="20" width="130" height="34" fill="#182d4d" rx="2" />
        <text x="295" y="42" fill="#fff">Dashboard UI</text>
        <line x1="295" y1="54" x2="295" y2="400" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />

        {/* FastAPI Gateway */}
        <rect x="420" y="20" width="140" height="34" fill="#182d4d" rx="2" />
        <text x="490" y="42" fill="#fff">FastAPI Gateway</text>
        <line x1="490" y1="54" x2="490" y2="400" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />

        {/* SQLite DB */}
        <rect x="620" y="20" width="130" height="34" fill="#182d4d" rx="2" />
        <text x="685" y="42" fill="#fff">SQLite Auth DB</text>
        <line x1="685" y1="54" x2="685" y2="400" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />

        {/* Endpoint Agent */}
        <rect x="790" y="20" width="120" height="34" fill="#182d4d" rx="2" />
        <text x="850" y="42" fill="#fff">Endpoint Agent</text>
        <line x1="850" y1="54" x2="850" y2="400" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />
      </g>

      {/* Step 1: Create bootstrap token */}
      <line x1="105" y1="80" x2="295" y2="80" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="195" y="74" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">1. Request Token Generation</text>

      {/* Step 2: POST /api/v1/agents/token */}
      <line x1="295" y1="105" x2="490" y2="105" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="390" y="99" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">2. POST /api/v1/agents/token (CSRF)</text>

      {/* Step 3: SQLite store bootstrap hash */}
      <line x1="490" y1="130" x2="685" y2="130" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="585" y="124" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">3. SHA-256 hash (30-min expiry)</text>

      {/* Step 4: Return raw token once */}
      <line x1="490" y1="155" x2="295" y2="155" stroke="#4778b8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#seq-ret)" />
      <text x="390" y="149" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">4. Return bootstrap_token (no-store)</text>

      {/* Step 5: Admin provides token to enroll.py CLI */}
      <line x1="105" y1="190" x2="850" y2="190" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="460" y="184" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">5. Run enroll.py --token &lt;TOKEN&gt; --backend &lt;URL&gt;</text>

      {/* Step 6: Agent sends POST /api/v1/agents/enroll */}
      <line x1="850" y1="225" x2="490" y2="225" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="670" y="219" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">6. POST /api/v1/agents/enroll (HTTPS)</text>

      {/* Step 7: Consume bootstrap token & assign agent ID */}
      <line x1="490" y1="255" x2="685" y2="255" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="585" y="249" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">7. Consume token; insert agent + credential</text>

      {/* Step 8: Return operational agent token */}
      <line x1="490" y1="285" x2="850" y2="285" stroke="#4778b8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#seq-ret)" />
      <text x="670" y="279" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">8. 200 OK: agent_id + 1h operational token</text>

      {/* Step 9: Agent persists to .env atomically */}
      <rect x="800" y="305" width="100" height="35" fill="#e5eaf0" stroke="#4778b8" rx="2" />
      <text x="850" y="322" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="600" textAnchor="middle">9. Atomic Save</text>
      <text x="850" y="334" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8" textAnchor="middle">agent/.env 0600</text>

      {/* Step 10: Authenticated Telemetry Ingestion */}
      <line x1="850" y1="365" x2="490" y2="365" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#seq-arr)" />
      <text x="670" y="359" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">10. POST /api/v1/telemetry (Bearer Token)</text>

      <line x1="490" y1="390" x2="850" y2="390" stroke="#4778b8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#seq-ret)" />
      <text x="670" y="384" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">11. 202 Accepted (after Kafka acks=all)</text>
    </svg>
  );
}

/** 5. Token Renewal Sequence */
export function TokenRenewalSequenceDiagram() {
  return (
    <svg viewBox="0 0 940 380" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ren-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#182d4d" />
        </marker>
        <marker id="ren-ret" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
      </defs>

      <rect x="0" y="0" width="940" height="380" fill="#f8f6f0" rx="4" />

      {/* Lifelines */}
      <g fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600" textAnchor="middle">
        <rect x="80" y="20" width="180" height="34" fill="#182d4d" rx="2" />
        <text x="170" y="42" fill="#fff">Agent Renewal Thread</text>
        <line x1="170" y1="54" x2="170" y2="360" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />

        <rect x="380" y="20" width="180" height="34" fill="#182d4d" rx="2" />
        <text x="470" y="42" fill="#fff">FastAPI /renew Route</text>
        <line x1="470" y1="54" x2="470" y2="360" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />

        <rect x="680" y="20" width="180" height="34" fill="#182d4d" rx="2" />
        <text x="770" y="42" fill="#fff">SQLite Credentials Store</text>
        <line x1="770" y1="54" x2="770" y2="360" stroke="#c9ced2" strokeWidth="1" strokeDasharray="4 4" />
      </g>

      {/* Step 1: Check interval */}
      <rect x="120" y="70" width="100" height="30" fill="#e5eaf0" stroke="#c9ced2" rx="2" />
      <text x="170" y="88" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="8" textAnchor="middle">Checks expiry</text>

      {/* Step 2: Request renewal */}
      <line x1="170" y1="120" x2="470" y2="120" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#ren-arr)" />
      <text x="320" y="112" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">1. POST /api/v1/agents/renew (Bearer &lt;TOKEN&gt;)</text>

      {/* Step 3: Check SQLite */}
      <line x1="470" y1="145" x2="770" y2="145" stroke="#182d4d" strokeWidth="1.5" markerEnd="url(#ren-arr)" />
      <text x="620" y="137" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">2. Validate token hash &amp; active status</text>

      {/* Condition A: > 5 mins remain */}
      <rect x="250" y="170" width="440" height="46" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="260" y="188" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">Case A: &gt; 5 minutes remain on current token</text>
      <text x="260" y="204" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Returns renewed=false, keeps current token and expiration unchanged</text>

      {/* Condition B: <= 5 mins remain */}
      <line x1="770" y1="240" x2="470" y2="240" stroke="#4778b8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ren-ret)" />
      <text x="620" y="232" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">3. Rotate token + hash replacement in DB</text>

      <rect x="620" y="255" width="220" height="30" fill="#e5eaf0" stroke="#4778b8" rx="2" />
      <text x="730" y="274" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="8" textAnchor="middle">Retains previous hash for overlap recovery</text>

      {/* Step 4: Return new token */}
      <line x1="470" y1="305" x2="170" y2="305" stroke="#4778b8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ren-ret)" />
      <text x="320" y="297" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9" textAnchor="middle">4. Return renewed=true + replacement token (no-store)</text>

      {/* Step 5: Save locally */}
      <rect x="110" y="325" width="120" height="30" fill="#fff" stroke="#182d4d" rx="2" />
      <text x="170" y="343" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="8" textAnchor="middle">Atomic file swap on disk</text>
    </svg>
  );
}

/** 6. Database ERD and Schema Diagram */
export function DatabaseSchemaDiagram() {
  return (
    <svg viewBox="0 0 980 440" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="980" height="440" fill="#f8f6f0" rx="4" />

      {/* Banner */}
      <rect x="20" y="20" width="940" height="36" fill="#182d4d" rx="2" />
      <text x="35" y="43" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">SysMon Database Architecture &amp; Schemas</text>
      <text x="560" y="43" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">SQLITE (STATE/AUTH) &amp; CLICKHOUSE (TELEMETRY)</text>

      {/* SQLITE SECTION */}
      <rect x="20" y="70" width="460" height="350" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <rect x="20" y="70" width="460" height="26" fill="#4778b8" />
      <text x="35" y="87" fill="#fff" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">SQLITE (data/sysmon_auth.db) — ADMIN &amp; CREDENTIALS</text>

      {/* Table: admin_users */}
      <rect x="35" y="105" width="195" height="100" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="122" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">admin_users</text>
      <text x="45" y="137" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">PK: id (TEXT)</text>
      <text x="45" y="150" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">username (TEXT, UNIQUE)</text>
      <text x="45" y="163" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">password_hash (Argon2id)</text>
      <text x="45" y="176" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">role (TEXT default 'admin')</text>
      <text x="45" y="189" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">created_at, last_login</text>

      {/* Table: admin_sessions */}
      <rect x="250" y="105" width="215" height="100" fill="#fff" stroke="#c9ced2" />
      <text x="260" y="122" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">admin_sessions</text>
      <text x="260" y="137" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">PK: id (TEXT)</text>
      <text x="260" y="150" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">FK: user_id → admin_users.id</text>
      <text x="260" y="163" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">session_token_hash (SHA-256)</text>
      <text x="260" y="176" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">csrf_token_hash (SHA-256)</text>
      <text x="260" y="189" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">expires_at (12h expiration)</text>

      {/* Table: agents */}
      <rect x="35" y="215" width="195" height="95" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="232" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">agents</text>
      <text x="45" y="247" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">PK: agent_id (TEXT)</text>
      <text x="45" y="260" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">tenant_id (DEFAULT_TENANT_ID)</text>
      <text x="45" y="273" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">hostname, os, arch, mac</text>
      <text x="45" y="286" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">status ('active' / 'revoked')</text>
      <text x="45" y="299" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">current_token_hash</text>

      {/* Table: agent_credentials */}
      <rect x="250" y="215" width="215" height="95" fill="#fff" stroke="#c9ced2" />
      <text x="260" y="232" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">agent_credentials</text>
      <text x="260" y="247" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">PK: id (TEXT)</text>
      <text x="260" y="260" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">FK: agent_id → agents.agent_id</text>
      <text x="260" y="273" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">token_hash (SHA-256, UNIQUE)</text>
      <text x="260" y="286" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">token_type ('bootstrap' / 'agent')</text>
      <text x="260" y="299" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">expires_at, is_revoked</text>

      {/* Table: telemetry_receipts */}
      <rect x="35" y="320" width="430" height="85" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="337" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">telemetry_receipts (Ingestion Deduplication)</text>
      <text x="45" y="354" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">Composite PK: (agent_id, event_id)</text>
      <text x="45" y="369" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">accepted_at (DateTime) · Prevents duplicate Kafka republishing per agent batch</text>
      <text x="45" y="384" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">Note: Audit identifies retention/cleanup policy not yet established</text>

      {/* CLICKHOUSE SECTION */}
      <rect x="500" y="70" width="460" height="350" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <rect x="500" y="70" width="460" height="26" fill="#182d4d" />
      <text x="515" y="87" fill="#fff" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">CLICKHOUSE (metrics DB) — MERGETREE ANALYTICS</text>

      {/* Table: DEVICES */}
      <rect x="515" y="105" width="210" height="95" fill="#fff" stroke="#c9ced2" />
      <text x="525" y="122" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">DEVICES (MergeTree)</text>
      <text x="525" y="137" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">ORDER BY: (agent_id, updated_at)</text>
      <text x="525" y="150" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">agent_id, hostname, ip_address</text>
      <text x="525" y="163" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">mac_address, total_memory</text>
      <text x="525" y="176" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">os_name, release, platform, arch</text>
      <text x="525" y="189" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">is_latest (UInt8), updated_at</text>

      {/* Table: EVENTS */}
      <rect x="735" y="105" width="210" height="95" fill="#fff" stroke="#c9ced2" />
      <text x="745" y="122" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">EVENTS (MergeTree)</text>
      <text x="745" y="137" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">ORDER BY: (agent_id, time, evt_id)</text>
      <text x="745" y="150" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">agent_id (String), timestamp</text>
      <text x="745" y="163" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">event_id (UInt32: 4624/4625)</text>
      <text x="745" y="176" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">status, username, domain</text>
      <text x="745" y="189" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">logon_type, source_ip</text>

      {/* Table: ALERTS */}
      <rect x="515" y="215" width="210" height="95" fill="#fff" stroke="#c9ced2" />
      <text x="525" y="232" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">ALERTS (MergeTree)</text>
      <text x="525" y="247" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">ORDER BY: (time, severity, agent)</text>
      <text x="525" y="260" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">id (UUID string), rule_name</text>
      <text x="525" y="273" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">severity, agent_id, triggered_at</text>
      <text x="525" y="286" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">message, context (JSON string)</text>
      <text x="525" y="299" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">resolved (UInt8 default 0)</text>

      {/* Table: AGENT_HEALTH */}
      <rect x="735" y="215" width="210" height="95" fill="#fff" stroke="#c9ced2" />
      <text x="745" y="232" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">AGENT_HEALTH (MergeTree)</text>
      <text x="745" y="247" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">ORDER BY: (agent_id, timestamp)</text>
      <text x="745" y="260" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">agent_id, timestamp</text>
      <text x="745" y="273" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">cpu_percent, memory_rss_mb</text>
      <text x="745" y="286" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">queue_depth, dropped_count</text>
      <text x="745" y="299" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">buffer_bytes, uptime_seconds</text>

      {/* Note on isolation */}
      <rect x="515" y="320" width="430" height="85" fill="#fff" stroke="#c9ced2" />
      <text x="525" y="337" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">ClickHouse Multi-Tenancy Finding</text>
      <text x="525" y="354" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">CRITICAL AUDIT NOTE: No tenant_id column exists in any ClickHouse table.</text>
      <text x="525" y="369" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Dashboard queries currently read all fleet records without organization isolation.</text>
      <text x="525" y="384" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">Tenant isolation requires schema evolution + tenant query predicates (Roadmap Phase 1).</text>
    </svg>
  );
}

/** 7. Multi-Tenant Architecture & Current Isolation Reality */
export function MultiTenantArchitectureDiagram() {
  return (
    <svg viewBox="0 0 940 380" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="mt-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
        <marker id="mt-warn" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e18b7e" />
        </marker>
      </defs>

      <rect x="0" y="0" width="940" height="380" fill="#f8f6f0" rx="4" />

      {/* Top Banner */}
      <rect x="20" y="20" width="900" height="40" fill="#182d4d" rx="2" />
      <text x="35" y="45" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">Multi-Tenancy Architecture: Verified State vs Gaps</text>
      <text x="580" y="45" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">AUDIT VERDICT: IDENTITY METADATA ONLY</text>

      {/* Box 1: Enrollment */}
      <rect x="20" y="80" width="200" height="150" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="30" y="102" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 1: ENROLLMENT</text>
      <text x="30" y="122" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Default Tenant Binding</text>
      <text x="30" y="142" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Backend assigns DEFAULT_TENANT_ID</text>
      <text x="30" y="157" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Client tenant parameter is ignored</text>
      <text x="30" y="172" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Stored in SQLite agents table</text>
      <text x="30" y="187" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Bound to operational agent token</text>
      <text x="30" y="205" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">✓ Identity derived securely</text>

      {/* Arrow 1 to 2 */}
      <line x1="220" y1="155" x2="255" y2="155" stroke="#4778b8" strokeWidth="2" markerEnd="url(#mt-arr)" />

      {/* Box 2: Telemetry Ingestion */}
      <rect x="260" y="80" width="200" height="150" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="270" y="102" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 2: INGESTION</text>
      <text x="270" y="122" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Tenant Identity Match</text>
      <text x="270" y="142" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Envelope tenant_id parsed</text>
      <text x="270" y="157" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Compared to token-derived tenant</text>
      <text x="270" y="172" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Mismatch returns 403 Forbidden</text>
      <text x="270" y="187" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Serialized into Kafka JSON</text>
      <text x="270" y="205" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">✓ Envelope check enforced</text>

      {/* Arrow 2 to 3 */}
      <line x1="460" y1="155" x2="495" y2="155" stroke="#e18b7e" strokeWidth="2" markerEnd="url(#mt-warn)" />

      {/* Box 3: Storage Gap */}
      <rect x="500" y="80" width="200" height="150" fill="#fcf3f2" stroke="#e18b7e" strokeWidth="1.5" rx="2" />
      <text x="510" y="102" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 3: WORKER &amp; STORAGE</text>
      <text x="510" y="122" fill="#753027" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">No Tenant Column in DB</text>
      <text x="510" y="142" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ Worker maps omit tenant_id</text>
      <text x="510" y="157" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ ClickHouse schemas have no tenant</text>
      <text x="510" y="172" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ All devices in single table</text>
      <text x="510" y="187" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ All events in single table</text>
      <text x="510" y="205" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">⚠ Data shared globally in DB</text>

      {/* Arrow 3 to 4 */}
      <line x1="700" y1="155" x2="735" y2="155" stroke="#e18b7e" strokeWidth="2" markerEnd="url(#mt-warn)" />

      {/* Box 4: Query Gap */}
      <rect x="740" y="80" width="180" height="150" fill="#fcf3f2" stroke="#e18b7e" strokeWidth="1.5" rx="2" />
      <text x="750" y="102" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="9">STAGE 4: ADMIN QUERIES</text>
      <text x="750" y="122" fill="#753027" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">No Tenant Scoping</text>
      <text x="750" y="142" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ GET /api/v1/devices: all hosts</text>
      <text x="750" y="157" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ GET /api/v1/events: all auth</text>
      <text x="750" y="172" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ No tenant admin roles</text>
      <text x="750" y="187" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">✗ Single global administrator</text>
      <text x="750" y="205" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">⚠ No tenant isolation today</text>

      {/* Bottom Summary Table */}
      <rect x="20" y="250" width="900" height="110" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="35" y="272" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Transparent Multi-Tenancy Classification</text>
      <text x="35" y="292" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">What works: Tenant identity metadata assignment and telemetry request envelope matching are implemented.</text>
      <text x="35" y="310" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="9">What is missing: Tenant creation CRUD, tenant-scoped ClickHouse partition keys, tenant query filters, and per-tenant admin RBAC.</text>
      <text x="35" y="330" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Conclusion: SysMon should NOT be marketed as supporting production multi-tenancy. It currently operates as a single-organization platform.</text>
    </svg>
  );
}

/** 8. Detection Engine & Alert Pipeline */
export function DetectionAlertPipelineDiagram() {
  return (
    <svg viewBox="0 0 960 400" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="det-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
      </defs>

      <rect x="0" y="0" width="960" height="400" fill="#f8f6f0" rx="4" />

      {/* Top Banner */}
      <rect x="20" y="20" width="920" height="38" fill="#182d4d" rx="2" />
      <text x="35" y="44" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">Detection Engine &amp; Notification Workflow</text>
      <text x="560" y="44" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">YAML-DRIVEN RULES · 19 VERIFIED TESTS</text>

      {/* Step 1: Input source */}
      <rect x="20" y="80" width="180" height="290" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="30" y="105" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">1. INPUT DATA</text>
      <text x="30" y="125" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">security.auth Rows</text>
      <text x="30" y="150" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Parsed login events only:</text>
      <text x="30" y="170" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• timestamp (UTC)</text>
      <text x="30" y="185" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• event_id (4624 / 4625)</text>
      <text x="30" y="200" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• status (SUCCESS / FAILURE)</text>
      <text x="30" y="215" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• username &amp; domain</text>
      <text x="30" y="230" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• logon_type (e.g. SSH, Interactive)</text>
      <text x="30" y="245" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• source_ip</text>
      <text x="30" y="275" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">⚠ Process events are NOT</text>
      <text x="30" y="287" fill="#e18b7e" fontFamily="'JetBrains Mono', monospace" fontSize="8">evaluated by detection</text>

      {/* Arrow 1 to 2 */}
      <line x1="200" y1="210" x2="235" y2="210" stroke="#4778b8" strokeWidth="2" markerEnd="url(#det-arr)" />

      {/* Step 2: Evaluation Strategies */}
      <rect x="240" y="80" width="240" height="290" fill="#fff" stroke="#c9ced2" rx="2" />
      <text x="250" y="105" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">2. RULE EVALUATION</text>
      <text x="250" y="125" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">DetectionEngine</text>
      
      <rect x="250" y="145" width="220" height="60" fill="#e5eaf0" stroke="#c9ced2" />
      <text x="260" y="165" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Threshold Condition</text>
      <text x="260" y="180" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Sliding time window (in-memory deque)</text>
      <text x="260" y="193" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">E.g., ≥5 failures / 60s per source_ip</text>

      <rect x="250" y="215" width="220" height="60" fill="#e5eaf0" stroke="#c9ced2" />
      <text x="260" y="235" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Pattern Match Condition</text>
      <text x="260" y="250" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Case-insensitive watchlist</text>
      <text x="260" y="263" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">E.g., root, administrator, admin</text>

      <rect x="250" y="285" width="220" height="60" fill="#e5eaf0" stroke="#c9ced2" />
      <text x="260" y="305" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Time Window Condition</text>
      <text x="260" y="320" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">UTC hour boundaries (22:00–06:00)</text>
      <text x="260" y="333" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Evaluates after-hours activity</text>

      {/* Arrow 2 to 3 */}
      <line x1="480" y1="210" x2="515" y2="210" stroke="#4778b8" strokeWidth="2" markerEnd="url(#det-arr)" />

      {/* Step 3: Fired Alert Generation */}
      <rect x="520" y="80" width="200" height="290" fill="#fff" stroke="#4778b8" strokeWidth="1.5" rx="2" />
      <text x="530" y="105" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">3. ALERT CREATION</text>
      <text x="530" y="125" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">FiredAlert Schema</text>
      <text x="530" y="150" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• id: UUID string</text>
      <text x="530" y="165" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• rule_name: string</text>
      <text x="530" y="180" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• severity: CRITICAL | HIGH | MED</text>
      <text x="530" y="195" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• agent_id &amp; triggered_at</text>
      <text x="530" y="210" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• message: human description</text>
      <text x="530" y="225" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• context: JSON string</text>

      <rect x="530" y="250" width="180" height="100" fill="#e5eaf0" stroke="#c9ced2" />
      <text x="540" y="270" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="600">Storage Destination</text>
      <text x="540" y="286" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">ClickHouse ALERTS table</text>
      <text x="540" y="300" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">resolved=0 (Open)</text>
      <text x="540" y="316" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">PATCH /resolve updates to 1</text>
      <text x="540" y="332" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Queried via GET /api/v1/alerts</text>

      {/* Arrow 3 to 4 */}
      <line x1="720" y1="210" x2="755" y2="210" stroke="#4778b8" strokeWidth="2" markerEnd="url(#det-arr)" />

      {/* Step 4: Dispatcher */}
      <rect x="760" y="80" width="180" height="290" fill="#182d4d" stroke="#182d4d" rx="2" />
      <text x="770" y="105" fill="#8cb5e6" fontFamily="'JetBrains Mono', monospace" fontSize="9">4. ALERT DISPATCH</text>
      <text x="770" y="125" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Notification Adapters</text>

      <rect x="770" y="145" width="160" height="55" fill="#243f66" stroke="#4778b8" />
      <text x="780" y="167" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Slack Webhook</text>
      <text x="780" y="185" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">Rich message blocks</text>

      <rect x="770" y="210" width="160" height="55" fill="#243f66" stroke="#4778b8" />
      <text x="780" y="232" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Discord Webhook</text>
      <text x="780" y="250" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">Color-coded embed</text>

      <rect x="770" y="275" width="160" height="55" fill="#243f66" stroke="#4778b8" />
      <text x="780" y="297" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">SMTP Email</text>
      <text x="780" y="315" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">MIME text / HTML alert</text>

      <text x="770" y="355" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="8">Note: WhatsApp NOT in code</text>
    </svg>
  );
}

/** 9. Backend Architecture */
export function BackendArchitectureDiagram() {
  return (
    <svg viewBox="0 0 960 420" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="bk-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4778b8" />
        </marker>
      </defs>

      <rect x="0" y="0" width="960" height="420" fill="#f8f6f0" rx="4" />

      {/* Top Banner */}
      <rect x="20" y="20" width="920" height="38" fill="#182d4d" rx="2" />
      <text x="35" y="44" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">FastAPI Backend Service Topology</text>
      <text x="600" y="44" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">8 ROUTERS · 30 REGISTERED OPERATIONS</text>

      {/* Column 1: Entry & Middleware */}
      <rect x="20" y="75" width="200" height="325" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <text x="35" y="100" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">1. INGRESS &amp; MIDDLEWARE</text>
      
      <rect x="35" y="115" width="170" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="135" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Uvicorn Runner</text>
      <text x="45" y="152" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">PORT (8000), optional TLS</text>

      <rect x="35" y="177" width="170" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="197" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">CORS Middleware</text>
      <text x="45" y="214" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">ALLOWED_ORIGINS (prod check)</text>

      <rect x="35" y="239" width="170" height="65" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="259" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Lifespan Manager</text>
      <text x="45" y="276" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Starts Kafka Producer</text>
      <text x="45" y="291" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Connects ClickHouse client</text>

      <rect x="35" y="314" width="170" height="65" fill="#e5eaf0" stroke="#4778b8" />
      <text x="45" y="334" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Rate Limiter</text>
      <text x="45" y="351" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Telemetry: 10/10s; Login: 5/60s</text>
      <text x="45" y="365" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">Valkey / local-memory fallback</text>

      {/* Arrow 1 to 2 */}
      <line x1="220" y1="230" x2="250" y2="230" stroke="#4778b8" strokeWidth="2" markerEnd="url(#bk-arr)" />

      {/* Column 2: Routers */}
      <rect x="255" y="75" width="310" height="325" fill="#f4f1e9" stroke="#182d4d" strokeWidth="1.5" rx="2" />
      <text x="270" y="100" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">2. MOUNTED FASTAPI ROUTERS</text>

      <rect x="270" y="115" width="280" height="42" fill="#fff" stroke="#c9ced2" />
      <text x="280" y="132" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Health &amp; Root (/', '/health')</text>
      <text x="280" y="147" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Public: reports Kafka, ClickHouse, Valkey status</text>

      <rect x="270" y="163" width="280" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="280" y="180" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Auth Router ('/api/v1/auth')</text>
      <text x="280" y="195" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">setup (loopback), login, me, logout, password</text>
      <text x="280" y="207" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">HttpOnly SameSite Strict cookie + CSRF header</text>

      <rect x="270" y="221" width="280" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="280" y="238" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Telemetry Ingestion ('/api/v1/telemetry')</text>
      <text x="280" y="253" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Agent token auth, schema validation, deduplication</text>
      <text x="280" y="265" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">Returns 202 after Kafka send &amp; SQLite receipt</text>

      <rect x="270" y="279" width="280" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="280" y="296" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Agent Management ('/api/v1/agents')</text>
      <text x="280" y="311" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">tokens, token create, enroll, renew, revoke</text>
      <text x="280" y="323" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Bootstrap 30m / operational 1h lifecycle</text>

      <rect x="270" y="337" width="280" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="280" y="354" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Query Routers ('/alerts', '/devices', '/events', '/rules')</text>
      <text x="280" y="369" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">require_admin dependency; ClickHouse backed</text>
      <text x="280" y="381" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">stats, detail, history, rule toggles (in-memory)</text>

      {/* Arrow 2 to 3 */}
      <line x1="565" y1="230" x2="595" y2="230" stroke="#4778b8" strokeWidth="2" markerEnd="url(#bk-arr)" />

      {/* Column 3: Downstream Services */}
      <rect x="600" y="75" width="340" height="325" fill="#f4f1e9" stroke="#c9ced2" rx="2" />
      <text x="615" y="100" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">3. BACKEND SERVICES &amp; ADAPTERS</text>

      <rect x="615" y="115" width="310" height="75" fill="#fff" stroke="#c9ced2" />
      <text x="625" y="135" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">SQLite AuthService &amp; AgentService</text>
      <text x="625" y="152" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Argon2id password hashing</text>
      <text x="625" y="167" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Session verification &amp; CSRF rotation</text>
      <text x="625" y="181" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Agent token hashes &amp; renewal rotation</text>

      <rect x="615" y="200" width="310" height="85" fill="#e5eaf0" stroke="#4778b8" />
      <text x="625" y="220" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">TelemetryProducer (aiokafka)</text>
      <text x="625" y="238" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">• acks="all", idempotent=True</text>
      <text x="625" y="253" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• gzip compression</text>
      <text x="625" y="267" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• send_and_wait() awaits cluster acknowledgement</text>

      <rect x="615" y="295" width="310" height="90" fill="#fff" stroke="#c9ced2" />
      <text x="625" y="315" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">ClickHouseService (clickhouse-connect)</text>
      <text x="625" y="333" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• HTTP client on port 8123</text>
      <text x="625" y="348" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Parametrized read queries for devices, events, alerts</text>
      <text x="625" y="362" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Aggregation queries for fleet statistics</text>
      <text x="625" y="376" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Alert resolution mutation</text>
    </svg>
  );
}

/** 10. Deployment Topology: Separate Compose vs Unified Target */
export function DeploymentTopologyDiagram() {
  return (
    <svg viewBox="0 0 960 420" className="arch-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="960" height="420" fill="#f8f6f0" rx="4" />

      {/* Top Banner */}
      <rect x="20" y="20" width="920" height="38" fill="#182d4d" rx="2" />
      <text x="35" y="44" fill="#fff" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600">Infrastructure Deployment Reality: Current vs Planned Target</text>
      <text x="560" y="44" fill="#c9ced2" fontFamily="'JetBrains Mono', monospace" fontSize="10">SOURCE: INFRA/ DOCKER COMPOSE AUDIT</text>

      {/* LEFT: Current Separate Stacks */}
      <rect x="20" y="75" width="445" height="325" fill="#f4f1e9" stroke="#182d4d" strokeWidth="1.5" rx="2" />
      <text x="35" y="100" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Current Implemented State: 3 Separate Compose Files</text>
      <text x="35" y="117" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">NO ROOT APPLICATION ORCHESTRATION FILE EXISTS</text>

      <rect x="35" y="130" width="415" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="150" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">infra/kafka/docker-compose.yaml</text>
      <text x="45" y="168" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">3 KRaft controllers + 3 brokers (ports 29092, 39092, 49092) · Kafka UI :8080</text>

      <rect x="35" y="190" width="415" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="210" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">infra/clickhouse/docker-compose.yaml</text>
      <text x="45" y="228" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">ClickHouse server (HTTP :8123, native :9000) · persistent volumes</text>

      <rect x="35" y="250" width="415" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="45" y="270" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">infra/redis/docker-compose.yaml</text>
      <text x="45" y="288" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Valkey (Redis-compatible) on port 6379 for rate limiting</text>

      <rect x="35" y="310" width="415" height="75" fill="#fcf3f2" stroke="#e18b7e" />
      <text x="45" y="330" fill="#753027" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Operational Gaps Identified</text>
      <text x="45" y="347" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Backend &amp; worker run as separate python processes or unlinked Dockerfiles</text>
      <text x="45" y="360" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Default ClickHouse port mismatch: worker uses 8443, Compose/backend uses 8123</text>
      <text x="45" y="373" fill="#753027" fontFamily="'JetBrains Mono', monospace" fontSize="8">• No automated single-command deploy command</text>

      {/* RIGHT: Intended Target Architecture */}
      <rect x="495" y="75" width="445" height="325" fill="#f4f1e9" stroke="#4778b8" strokeWidth="1.5" rx="2" />
      <text x="510" y="100" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="12" fontWeight="600">Planned Target: Unified Self-Hosted Compose Stack</text>
      <text x="510" y="117" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="9">ROADMAP PHASE 6: PRODUCTION HARDENING</text>

      <rect x="510" y="130" width="415" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="520" y="150" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">Automated Reverse Proxy / Managed TLS Ingress</text>
      <text x="520" y="168" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Automated TLS certificate provisioning, trusted proxy headers, domain routing</text>

      <rect x="510" y="190" width="415" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="520" y="210" fill="#182d4d" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">Unified Docker Network &amp; Secret Injection</text>
      <text x="520" y="228" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Secure internal DNS (backend:8000, kafka:9092, clickhouse:8123)</text>

      <rect x="510" y="250" width="415" height="52" fill="#fff" stroke="#c9ced2" />
      <text x="520" y="270" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="600">Dedicated Tenant &amp; App Database (PostgreSQL)</text>
      <text x="520" y="288" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">Replacing file-based SQLite for cluster high-availability</text>

      <rect x="510" y="310" width="415" height="75" fill="#e5eaf0" stroke="#4778b8" />
      <text x="520" y="330" fill="#182d4d" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600">Durable Worker &amp; ClickHouse Integration</text>
      <text x="520" y="347" fill="#4778b8" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Manual Kafka offset commits after ClickHouse transaction success</text>
      <text x="520" y="360" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Process lifecycle schema mapping in ClickHouse</text>
      <text x="520" y="373" fill="#697787" fontFamily="'JetBrains Mono', monospace" fontSize="8">• Automated database schema migrations &amp; healthchecks</text>
    </svg>
  );
}

