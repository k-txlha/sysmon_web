# SysMon

## Open-Source Endpoint Detection & Response (EDR)
**Product Documentation & Technical Handbook**

Version: 0.1 — Development Documentation
Product name: SysMon (temporary name)
Deployment model: Self-hosted / On-premises
Product category: Endpoint Detection and Response (EDR)
Documentation status: Living document

---

# 1. Introduction

## 1.1 What is SysMon?
SysMon is an open-source, self-hosted Endpoint Detection and Response (EDR) platform designed to provide organizations with visibility into their endpoint devices, system activities, and potentially suspicious behavior.

It aims to make endpoint monitoring and security investigation accessible to startups and smaller organizations that cannot afford expensive enterprise security platforms.

SysMon collects endpoint telemetry through lightweight agents installed on monitored devices. The collected information is securely transmitted to a centralized backend, processed through an event pipeline, evaluated against detection rules, and made available to security analysts through a centralized dashboard.

Unlike a cloud-dependent security platform, SysMon is designed around a self-hosted deployment model. Organizations own their infrastructure and retain control over their collected security data.

## 1.2 Why SysMon?
Organizations need visibility into what happens across their computers and servers.

Without endpoint monitoring, it becomes difficult to answer questions such as:

- Which processes are currently running?
- Which user started a particular process?
- What parent process created it?
- When did a process start or terminate?
- Which authentication activities are occurring?
- Are there suspicious changes to system persistence mechanisms?
- Are unauthorized changes happening on monitored endpoints?
- Which devices are experiencing unusual activity?
- Which security events require investigation?
Traditional enterprise EDR platforms can be expensive and operationally complex.

SysMon aims to provide an accessible foundation for endpoint visibility, telemetry collection, centralized detection, and security investigation.

## 1.3 Product objectives
The primary objectives are:

1. Provide lightweight endpoint monitoring.
2. Collect structured telemetry from different operating systems.
3. Centralize endpoint data through a scalable backend.
4. Support multiple organizations through tenant isolation.
5. Detect suspicious activities through configurable rules.
6. Provide centralized alert management.
7. Enable analysts to investigate endpoint activities.
8. Support self-hosted deployments.
9. Minimize infrastructure and operational complexity.
10. Remain open-source and extensible.

## 1.4 Target audience
SysMon is primarily intended for:

- Startups.
- Small and medium-sized businesses.
- Organizations with limited security budgets.
- Infrastructure and IT administrators.
- Security operations teams.
- Independent security researchers.
- Developers building security monitoring infrastructure.

---

# 2. Core Concepts
Understanding these concepts is important before deploying or operating SysMon.

## 2.1 Endpoint
An endpoint is an individual device monitored by SysMon.

Examples include:

- Windows workstations.
- Linux servers.
- macOS computers.
Each enrolled endpoint is represented by a registered agent in the central platform.

## 2.2 Agent
The SysMon Agent is a lightweight background service installed on an endpoint.

Its responsibilities include:

- Identifying the operating system.
- Collecting system information.
- Collecting process telemetry.
- Collecting authentication-related telemetry.
- Tracking process lifecycle changes.
- Normalizing collected information.
- Creating structured telemetry events.
- Buffering events when the backend is unavailable.
- Transmitting telemetry to the backend.
- Maintaining its authentication credentials.
The agent is intended to operate without requiring users to manually start it every time they use their computers.

## 2.3 Tenant
A tenant represents an individual organization using SysMon.

Each tenant has its own logically isolated environment.

For example:

- Organization A has its own endpoints, alerts, and telemetry.
- Organization B has its own endpoints, alerts, and telemetry.
Both organizations may use the same SysMon backend deployment, but their data must remain logically separated.

## 2.4 Telemetry
Telemetry refers to structured information collected from monitored endpoints.

Examples include:

- Process creation.
- Process termination.
- System information.
- Authentication activity.
- Endpoint health information.
Telemetry provides the raw information required for detection and investigation.

## 2.5 Detection Rule
A detection rule defines conditions that identify potentially suspicious activities.

Rules are evaluated by the backend detection engine rather than being embedded in the endpoint agent.

This allows detection logic to be updated centrally without requiring every endpoint agent to receive new detection code.

## 2.6 Alert
An alert is a security finding generated when collected telemetry satisfies a detection rule.

Alerts are stored centrally and made available to analysts through the dashboard.

## 2.7 Event
An event is an individual structured record describing something that happened on an endpoint.

SysMon uses a common event envelope to maintain consistency between different telemetry sources.

---

# 3. System Architecture

## 3.1 High-level architecture
SysMon follows a distributed architecture consisting of endpoint agents, an ingestion backend, an event-processing pipeline, persistent storage, and a centralized dashboard.

The intended high-level data flow is:

```
                MONITORED ENDPOINTS
              +----------------------+
              |                      |
              |   Windows Agent      |
              |   Linux Agent        |
              |   macOS Agent        |
              |                      |
              +----------+-----------+
                         |
                         |
                 Structured Telemetry
                         |
                         v
              +----------------------+
              |   FastAPI Gateway    |
              |                      |
              | Authentication       |
              | Validation           |
              | Enrollment           |
              | Ingestion            |
              +----------+-----------+
                         |
                         v
              +----------------------+
              |        Kafka         |
              |                      |
              | Telemetry Transport  |
              | Buffering            |
              | Event Distribution   |
              +----------+-----------+
                         |
                         v
              +----------------------+
              | Processing Workers   |
              |                      |
              | Event Processing     |
              | Normalization        |
              | Detection Rules      |
              | Correlation          |
              +----------+-----------+
                         |
                 +-------+-------+
                 |               |
                 v               v
          +-------------+  +-------------+
          | ClickHouse  |  | Alert Store |
          |             |  |             |
          | Telemetry   |  | Alerts      |
          | Events      |  | Findings    |
          +-------------+  +-------------+
                 |               |
                 +-------+-------+
                         |
                         v
              +----------------------+
              |   SysMon Dashboard   |
              |                      |
              | Devices              |
              | Events               |
              | Alerts               |
              | Investigation        |
              +----------------------+
```
This diagram represents the intended architecture. Not every component or data flow is fully operational yet.

## 3.2 Endpoint agent layer
The endpoint agent is responsible for collecting information directly from monitored devices.

The agent:

1. Detects the host operating system.
2. Selects the appropriate platform-specific collectors.
3. Collects endpoint information.
4. Tracks changes between collection cycles where applicable.
5. Converts platform-specific information into structured events.
6. Adds event metadata.
7. Buffers events when transmission is unavailable.
8. Sends telemetry to the backend.
The architecture separates platform-specific collection from platform-independent event representation.

This allows different operating systems to produce a common event structure.

## 3.3 API gateway
The backend gateway is built using Python and FastAPI.

Its responsibilities include:

- Agent authentication.
- Agent enrollment.
- Token validation.
- Request validation.
- Telemetry ingestion.
- Agent health communication.
- Forwarding accepted telemetry into the event pipeline.
The gateway provides the communication boundary between endpoint agents and the centralized backend.

## 3.4 Message broker
SysMon uses Apache Kafka as its event transport layer.

Kafka separates telemetry ingestion from downstream processing.

Instead of requiring the API gateway to perform all processing synchronously, accepted events can be published to Kafka for asynchronous consumption.

Benefits include:

- Decoupled services.
- Asynchronous event processing.
- Independent scaling of consumers.
- Buffering during temporary processing interruptions.
- Improved throughput handling.
- Reduced coupling between ingestion and detection services.
The existing project has used the Kafka topic:

`normalized.connector_data_1`

The final production topic structure and partition strategy remain subject to implementation.

## 3.5 Processing workers
Processing workers consume telemetry from Kafka.

The intended responsibilities include:

- Reading telemetry messages.
- Validating event structure.
- Processing normalized events.
- Evaluating YAML-based detection rules.
- Maintaining detection state where necessary.
- Deduplicating repeated findings.
- Correlating related events.
- Generating alerts.
- Persisting alerts.
- Triggering notification workflows.
Detection logic is maintained centrally in the worker layer.

The endpoint agent is responsible for collecting telemetry, not independently deciding whether an event is malicious.

## 3.6 Storage architecture
SysMon uses different storage technologies for different workloads.

### ClickHouse
ClickHouse is intended for high-volume telemetry and analytical queries.

Its responsibilities include:

- Storing endpoint events.
- Supporting time-based queries.
- Retrieving historical telemetry.
- Supporting event investigation.
- Enabling analytical queries across large event datasets.
ClickHouse is selected because it is designed for analytical workloads and large volumes of structured event data.

### PostgreSQL
PostgreSQL is part of the broader product-state architecture.

It is intended for structured application data and operational records that are not best suited to analytical event storage.

The exact final ownership of product-state tables and migration from earlier storage decisions should be documented alongside the implementation.

### SQLite
SQLite was selected in the earlier architecture decisions for administrative storage.

Its exact role in the final deployment must remain consistent with the actual repository implementation.

### Redis / Valkey
Redis-compatible storage has been used in the project for token-related state and related operational functionality.

Valkey has also been considered for rate limiting and backpressure management.

Do not assume that every proposed storage responsibility is active in the current deployment.

---

# 4. Endpoint Agent

## 4.1 Overview
The SysMon Agent is the component installed on each monitored endpoint.

It runs as a background service and collects information about the host and its activities.

The design aims to keep the agent lightweight and independent of the backend's detection logic.

## 4.2 Operating system support
The architecture is designed for:

- Windows.
- Linux.
- macOS.
Platform-specific collectors are selected based on operating system detection.

Each platform may require different collection mechanisms because operating systems expose system activity through different APIs and filesystem structures.

The common event format allows the backend to process telemetry without depending on the operating system that generated it.

Platform support and collector completeness should be verified individually before claiming production support.

## 4.3 System information collection
The agent collects basic information about the host.

This provides the backend with context about the device producing telemetry.

System and host information is part of the implemented collection foundation.

The exact inventory fields should be taken from the current collector implementation rather than assumed.

## 4.4 Process monitoring
Process monitoring is one of the core capabilities of SysMon.

The agent uses Python's `psutil` library for process-related information.

The current process telemetry includes:

FieldDescription`pid`Process ID`ppid`Parent process ID`username`User associated with the process`executable_path`Path to the executable`command_line`Command used to launch the process`process_start_time`Process start timestamp`cpu`CPU usage information`memory`Memory usage information`status`Current process status
### Process lifecycle tracking
SysMon maintains information about previously observed processes to identify lifecycle changes.

The agent maintains a previous-process state using `previous_processes`.

By comparing current process observations against previously observed processes, it can identify:

- Newly observed processes.
- Previously observed processes that are no longer running.
This allows the agent to track process lifecycle changes instead of reporting only an isolated process snapshot.

### Parent-child process relationships
Process IDs and parent process IDs provide the foundation for reconstructing process relationships.

For example:

```
explorer.exe
    |
    +---- browser.exe
    |         |
    |         +---- browser_helper.exe
    |
    +---- terminal.exe
              |
              +---- python.exe
```
These relationships are useful for security investigation because a suspicious process may be launched by another process.

Full process-tree investigation and visualization remain part of the broader investigation roadmap.

### Process command-line visibility
Command-line information provides additional context about how a process was launched.

For example, two instances of the same executable may perform very different activities depending on their arguments.

The command line can therefore provide useful investigation context.

### Process hashing
SHA-256 executable hashing has been included in the process telemetry design.

Hashing provides a way to identify executable files independently of their filenames.

The current implementation coverage should be verified before presenting hashing as a fully operational collector feature.

## 4.5 Authentication monitoring
Authentication telemetry is part of the current agent collection foundation.

The objective is to capture authentication-related activities from supported operating systems.

Authentication information can help identify:

- Login activity.
- Failed authentication attempts.
- Unusual authentication behavior.
- Potential unauthorized access.
Different operating systems expose authentication information through different mechanisms.

The exact authentication event types and available fields depend on the platform-specific collectors.

## 4.6 Persistence monitoring
Persistence monitoring is a planned telemetry capability.

Persistence mechanisms allow applications or attackers to maintain execution across system restarts, user logins, or other lifecycle events.

SysMon's persistence-monitoring design includes inspecting relevant operating-system locations.

### Linux persistence locations
The current design includes:

- `/etc/crontab`
- `/etc/cron.*`
- `/etc/systemd/system/`
- `~/.bashrc`
- `~/.ssh/authorized_keys`
These locations are relevant because they can contain scheduled execution instructions, service definitions, shell initialization commands, or SSH access configuration.

### Windows persistence locations
The planned Windows collection areas include:

- Registry Run Keys.
- Scheduled Tasks.
- Startup folders.
- Windows services.

### Why persistence monitoring matters
Unexpected modifications to persistence mechanisms may indicate:

- Unauthorized startup programs.
- Suspicious scheduled execution.
- Unauthorized service creation.
- Attempts to maintain access to a device.
Persistence monitoring is not yet a capability that should be advertised as fully operational across all platforms.

## 4.7 File integrity monitoring
File integrity monitoring is another planned telemetry capability.

Its purpose is to detect relevant changes to monitored files and directories.

The design includes monitoring sensitive locations, including temporary directories such as:

- `/tmp`
- `/var/tmp`
The broader implementation should support identifying relevant file changes and generating structured telemetry.

Potential file events include:

- File creation.
- File modification.
- File deletion.
- Relevant metadata changes.
The final monitored paths, hashing strategy, permissions, and event coverage must be defined by the actual collector implementation.

## 4.8 Network activity monitoring
Network context is part of the planned telemetry expansion.

The objective is to provide additional context about network-related endpoint activity.

Potential investigation information includes:

- Local addresses.
- Remote addresses.
- Connection details.
- Associated processes.
These are intended capabilities, not a declaration that comprehensive network telemetry is currently implemented.

---

# 5. Event Architecture and Canonical Schema

## 5.1 Why a common schema?
SysMon is designed to support multiple operating systems.

Windows, Linux, and macOS expose system information differently.

If every platform sends completely different event structures, the backend would need separate processing logic for every operating system.

To avoid this, SysMon uses a common event envelope.

This provides a consistent structure for transmitting telemetry.

## 5.2 Event envelope
The current event envelope includes:

FieldDescription`schema_version`Version of the event schema`tenant_id`Organization associated with the event`host_id`Identity of the monitored host`agent_id`Identity of the reporting agent`event_type`Category of the event`sequence`Event sequence informationThe event also carries event-specific telemetry information.

An example of the current envelope structure:

```
{
  "schema_version": 1,
  "tenant_id": "default",
  "host_id": "local-windows-host",
  "agent_id": "registered-agent-id",
  "event_type": "telemetry.snapshot",
  "sequence": 1
}
```
This is an illustrative example of the current envelope fields, not a complete production event payload.

## 5.3 Schema versioning
The `schema_version` field allows the event structure to evolve over time.

For example:

- Version 1 may contain basic process information.
- Version 2 may introduce additional process metadata.
- Future versions may add new telemetry categories.
Versioning helps maintain compatibility between agents and backend services.

## 5.4 Event types
The current event naming includes:

`telemetry.snapshot`

Additional event types should be introduced as collectors and event processing capabilities mature.

The event taxonomy should remain consistent across operating systems.

## 5.5 Event sequencing
The `sequence` field provides event-ordering information within the agent's event stream.

A production implementation should define its behavior across agent restarts, buffering, retransmission, and token renewal.

## 5.6 Empty telemetry arrays
An empty process array can be a valid collection result.

For example:

```
{
  "processes": []
}
```
This means the collector returned no process records for that particular collection.

It should not automatically be interpreted as a backend failure.

Collection errors and genuinely empty results should be represented separately.

---

# 6. Agent Enrollment and Authentication

## 6.1 Overview
SysMon uses a two-stage token architecture for agent registration and ongoing authentication.

The two token types serve different purposes:

1. Bootstrap token.
2. Permanent agent token.
This separation prevents the initial enrollment credential from becoming the long-term authentication credential.

## 6.2 Bootstrap enrollment
A bootstrap token is used during the initial registration of an agent.

The enrollment process follows this general flow:

```
Administrator
     |
     v
Generate Bootstrap Token
     |
     v
Provide Token to Agent
     |
     v
Run Enrollment Process
     |
     v
Agent Sends Token to Backend
     |
     v
Backend Validates Bootstrap Token
     |
     v
Create Agent Registration
     |
     v
Issue Permanent Agent Token
     |
     v
Agent Stores Permanent Token
```
The administrator initiates enrollment, and the agent exchanges the bootstrap credential for its own permanent credential.

The enrollment endpoint currently discussed in the project is:

`POST /api/v1/agents/token`

The endpoint is used in the bootstrap-token registration flow.

## 6.3 Permanent agent tokens
After successful enrollment, the agent receives a permanent agent token.

This token is used for subsequent backend communication.

Each agent should have its own identity and credentials.

The backend can therefore associate telemetry with the registered agent rather than relying only on an untrusted host identifier supplied by the request.

## 6.4 Token renewal
Long-lived credentials should not remain valid indefinitely.

SysMon includes background token-renewal logic.

The current implementation checks whether a token is approaching expiration.

The renewal logic uses a five-minute renewal threshold.

Conceptually:

```
if token_expiration <= current_time + five_minutes:
    renew_token()
```
The renewal process is designed to:

1. Check the current token expiration.
2. Generate a replacement token.
3. Revoke the previous token.
4. Update the agent's credential state.
5. Continue backend communication without requiring manual agent restart.
The exact renewal API contract and failure-handling guarantees should follow the current implementation.

## 6.5 Token revocation
Revocation prevents a previously issued credential from continuing to authenticate.

The bootstrap-token design also includes revocation state.

A previously issued or consumed bootstrap credential should not be accepted again once invalidated.

## 6.6 Authentication security principles
The authentication architecture should follow these principles:

- Separate enrollment credentials from permanent credentials.
- Assign unique credentials to agents.
- Validate credentials on protected requests.
- Support credential expiration.
- Revoke replaced or compromised credentials.
- Avoid logging raw authentication tokens.
- Protect token storage on the endpoint.
- Use encrypted communication in production.

---

# 7. Multi-Tenant Architecture

## 7.1 What is multi-tenancy?
Multi-tenancy allows one SysMon deployment to serve multiple organizations while maintaining logical separation between their data.

For example:

```
              SysMon Deployment
                     |
             Central Backend
                     |
           +---------+---------+
           |                   |
           v                   v
      Organization A      Organization B
           |                   |
      Agent A1             Agent B1
      Agent A2             Agent B2
      Agent A3             Agent B3
           |                   |
           v                   v
      Tenant A Data       Tenant B Data
```
Both organizations use the same deployment, but they must not be able to access each other's information.

## 7.2 Why tenant IDs are necessary
The `tenant_id` field identifies which organization owns a particular event.

Without tenant identification, the backend cannot reliably distinguish between telemetry belonging to different organizations.

For example:

```
{
  "tenant_id": "organization-a",
  "agent_id": "agent-001",
  "event_type": "telemetry.snapshot"
}
```
This event belongs to Organization A.

Another organization's event would have a different tenant identifier.

## 7.3 Tenant isolation
Tenant isolation must be enforced throughout the application.

It includes:

- Agent registration.
- Agent authentication.
- Telemetry ingestion.
- Database queries.
- Alert generation.
- Dashboard access.
- Investigation workflows.
- Administrative operations.
The backend must not trust a client-provided `tenant_id` without verifying the authenticated agent's registered tenant association.

The authenticated agent identity should determine the authorized tenant context.

## 7.4 SaaS readiness
Multi-tenancy makes it possible to evolve the platform toward a managed SaaS model in the future.

However, the current product deployment model remains self-hosted/on-premises.

Multi-tenancy is an architectural capability, not proof that a public multi-customer SaaS service is already available.

---

# 8. Offline Agent Behavior and Reliability

## 8.1 Why offline support matters
Endpoint devices may temporarily lose connectivity because of:

- Network outages.
- Server maintenance.
- Firewall restrictions.
- VPN disconnections.
- Temporary backend unavailability.
The agent should not immediately discard collected telemetry whenever communication fails.

## 8.2 Collect-and-buffer strategy
The selected offline behavior is to continue collecting telemetry and buffer it locally.

The intended flow is:

```
Telemetry Collection
        |
        v
   Send to Backend
        |
        v
  Is Backend Available?
       / \
     Yes  No
      |    |
      v    v
   Accept  Buffer Locally
      |    |
      v    v
   Acknowledge
           |
           v
     Retry Later
           |
           v
     Send Buffered Data
           |
           v
       Acknowledge
```

## 8.3 Bounded buffering
The agent uses bounded buffering rather than allowing unlimited local accumulation.

This prevents offline collection from consuming unlimited disk or memory resources.

## 8.4 Retry mechanism
When communication fails, the agent retries transmission.

Retry handling should avoid unnecessary repeated requests and should recover when the backend becomes available again.

## 8.5 Acknowledgements
The agent-side reliability implementation includes acknowledgement handling.

Acknowledgements are important because they allow the agent to distinguish accepted events from events that still require retransmission.

The complete production delivery guarantees, including duplicate handling and persistence across machine restarts, must be validated against the current implementation.

## 8.6 Delivery considerations
A reliable production system should address:

- Duplicate events.
- Out-of-order delivery.
- Sequence continuity.
- Buffer limits.
- Retry limits.
- Disk exhaustion.
- Corrupted buffered data.
- Server acknowledgement behavior.
These are reliability requirements, not claims that every edge case is already fully handled.

---

# 9. Detection Engine

## 9.1 Overview
The SysMon detection engine evaluates collected telemetry against centrally maintained detection rules.

The detection engine is part of the backend processing layer.

It is not intended to run the complete detection rule system inside every endpoint agent.

## 9.2 Server-side detection
The selected architecture keeps detection rules on the backend.

The endpoint agent collects and reports information.

The worker evaluates that information.

This separation provides several advantages:

- Centralized rule management.
- Consistent detection behavior.
- Easier rule updates.
- Less detection logic on endpoints.
- Reduced need to redeploy agents for every rule change.

## 9.3 YAML-based rules
SysMon uses YAML-based detection rules.

YAML provides a human-readable format for defining detection conditions and associated metadata.

The rule implementation should document the actual supported fields, operators, matching semantics, and severity values from the worker code.

## 9.4 Detection workflow

```
Telemetry Event
      |
      v
Kafka Consumer
      |
      v
Event Processing
      |
      v
Detection Engine
      |
      v
Evaluate YAML Rules
      |
      v
Conditions Satisfied?
      |
   +--+--+
   |     |
  No    Yes
   |     |
   v     v
Ignore  Generate Finding
         |
         v
    Persist Alert
         |
         v
    Notify Analysts
```

## 9.5 Detection hardening
The broader detection roadmap includes improving:

- Rule versioning.
- Idempotency.
- Alert deduplication.
- Event correlation.
- Detection reliability.
- Rule execution consistency.
These capabilities help prevent repeated or inconsistent findings.

## 9.6 Important limitation
SysMon should not currently be described as providing a complete antivirus engine, malware sandbox, behavioral AI detection system, or comprehensive threat intelligence platform.

Its current direction is structured endpoint telemetry combined with centrally evaluated detection rules.

---

# 10. Alert Management

## 10.1 Overview
Alerts represent findings generated by the detection engine.

They provide analysts with a centralized place to review potentially suspicious activity.

## 10.2 Alert persistence
The current project includes alert persistence functionality.

This allows findings to remain available rather than existing only temporarily during rule evaluation.

## 10.3 Alert management
The existing dashboard includes alert views and alert-management functionality.

Alert toggling is part of the implemented functionality.

The exact meaning of each alert state, including whether an alert is open, resolved, acknowledged, or suppressed, must be taken from the current application implementation.

## 10.4 Notifications
The project includes notification functionality.

The broader notification design includes delivery through channels such as:

- Slack.
- Discord.
- WhatsApp.
- Email.
The availability and configuration of each channel should be documented according to its actual implementation.

## 10.5 Future alert improvements
The roadmap includes improving:

- Deduplication.
- Correlation.
- Durable alert state.
- Alert investigation context.
- Notification reliability.
- Analyst workflows.

---

# 11. SysMon Dashboard

## 11.1 Overview
The SysMon dashboard provides a centralized interface for viewing endpoint information and security telemetry.

It is intended to help administrators and security analysts understand the status of their monitored infrastructure.

## 11.2 Device view
The current dashboard includes device-related views.

These provide visibility into registered or monitored endpoints.

The dashboard is intended to make it easier to understand the state of the endpoint fleet.

## 11.3 Event view
The dashboard includes event-related views.

These provide access to collected endpoint telemetry.

The longer-term objective is to support filtering and investigation across different event categories and time ranges.

## 11.4 Alert view
The dashboard includes alert-related views.

Analysts can review generated findings and use the existing alert-management functionality.

## 11.5 Future dashboard capabilities
The investigation roadmap includes:

- Endpoint timelines.
- Process-tree visualization.
- Persistence investigation.
- Improved event search.
- Alert-to-event relationships.
- Investigation cases.
- More comprehensive filtering.
These should be treated as future enhancements unless verified in the current dashboard.

---

# 12. Security Architecture

## 12.1 Security objectives
SysMon is itself a security product. Its own architecture must therefore be designed to protect collected telemetry, endpoint credentials, and organizational information.

The main security objectives are:

- Authentication.
- Authorization.
- Tenant isolation.
- Secure communication.
- Credential protection.
- Controlled access to telemetry.
- Reliable auditability.

## 12.2 Agent authentication
Agents authenticate using their assigned credentials.

Bootstrap credentials are used for enrollment, while permanent credentials are used for regular communication.

Credentials should be validated by the backend before accepting protected operations.

## 12.3 TLS communication
TLS is part of the planned production security architecture.

Caddy has been considered as the TLS termination and reverse-proxy component.

The intended communication path is:

```
Endpoint Agent
      |
      | HTTPS
      v
     Caddy
      |
      | Internal proxy
      v
 FastAPI Gateway
```
Caddy can manage HTTPS certificates and forward requests to the internal application.

TLS should be configured before exposing the deployment to untrusted networks.

Do not advertise production TLS protection until the configuration has been implemented and verified.

## 12.4 Rate limiting and backpressure
Rate limiting and backpressure are important for protecting the ingestion pipeline.

Valkey has been considered for managing rate-limiting state and controlling traffic pressure.

The goal is to prevent excessive incoming traffic from overwhelming backend services.

## 12.5 Data isolation
Every authenticated request must be associated with an authorized tenant.

A tenant must not be able to retrieve another tenant's devices, events, or alerts.

## 12.6 Administrative access
Administrative functionality must be protected separately from ordinary agent communication.

Administrative operations should not be exposed simply because a caller possesses an agent token.

## 12.7 Security roadmap
Further security work includes:

- TLS verification.
- Collector failure reporting.
- Authorization hardening.
- Deployment security assessment.
- Pilot testing.
- Credential and data-handling review.

---

# 13. Deployment Architecture

## 13.1 Deployment model
SysMon is designed as a self-hosted/on-premises product.

The organization deploying SysMon owns its infrastructure and collected data.

A mandatory external cloud service is not part of the selected deployment model.

## 13.2 Containerization
Dockerfiles and Docker Compose infrastructure have been added to the project.

Containerization is intended to simplify the deployment of backend services and their dependencies.

## 13.3 Deployment components
The broader deployment architecture includes:

- FastAPI gateway.
- Kafka.
- Processing workers.
- ClickHouse.
- Product-state storage.
- Redis-compatible operational storage where required.
- Dashboard frontend.
- Caddy for production TLS termination.
The exact service list and dependency configuration should be verified against the current Docker Compose files.

## 13.4 Administrator responsibilities
A self-hosted installation requires administrators to manage:

- Server infrastructure.
- Network access.
- Storage capacity.
- Service availability.
- Credentials.
- Backups.
- Software upgrades.
- Data retention.

## 13.5 Future deployment improvements
The deployment roadmap includes:

- Complete installation documentation.
- Production configuration.
- Backup and restore procedures.
- Upgrade and migration procedures.
- Retention configuration.
- Monitoring and operational health checks.

---

# 14. Technology Stack
The following technologies are part of the current or intended SysMon architecture.

| Technology | Responsibility |
| --- | --- |
| Python | Agent and backend development |
| FastAPI | Backend API and ingestion gateway |
| psutil | Process and system telemetry collection |
| Apache Kafka | Event transport and asynchronous processing |
| ClickHouse | High-volume telemetry storage and analytics |
| PostgreSQL | Structured application-state storage |
| SQLite | Earlier administrative storage decision |
| Redis / Valkey | Token-related and operational state |
| YAML | Detection rule definitions |
| Docker | Containerization |
| Docker Compose | Multi-service deployment |
| Caddy | Planned TLS termination and reverse proxy |

Not every technology listed above is necessarily active in every deployment configuration.

---

# 15. API and Communication

## 15.1 API architecture
The backend exposes API functionality through FastAPI.

The API is responsible for communication between the endpoint agents and the backend.

The current documented enrollment endpoint is:

**POST **`/api/v1/agents/token`

Purpose:

Exchange a valid bootstrap credential for an agent-specific permanent credential during enrollment.

The complete API contract should be maintained alongside the implemented route definitions.

## 15.2 API documentation requirements
The finished API reference should document:

- Endpoint paths.
- HTTP methods.
- Authentication requirements.
- Request bodies.
- Response bodies.
- Validation rules.
- Error responses.
- Rate limits.
- Versioning.
- Tenant authorization behavior.
Additional route paths and payloads should be extracted from the actual FastAPI application rather than invented in this documentation.

---

# 16. Operational Reliability

## 16.1 Agent health
The project includes agent health functionality.

The purpose is to provide visibility into whether registered agents are communicating and operating.

## 16.2 Service management
Agent service management is part of the implemented foundation.

The intended experience is that an installed agent runs as a background service without requiring manual startup by the end user.

## 16.3 Collector failure reporting
Collector-failure reporting remains an area of planned improvement.

A collector failing to retrieve telemetry should be distinguishable from a collector successfully returning no records.

## 16.4 Backend health
The backend should expose operational health information so administrators can identify failures in ingestion, processing, storage, and dependent services.

The complete production monitoring and health-check strategy remains part of deployment hardening.

---

# 17. Privacy and Data Handling
SysMon collects information from endpoint devices.

Some telemetry may contain sensitive operational information, including usernames, executable paths, command-line arguments, and authentication-related records.

Therefore, deployments should:

- Collect only the telemetry required for the intended security purpose.
- Restrict access to collected data.
- Protect stored credentials.
- Encrypt communication.
- Define data-retention policies.
- Protect backups.
- Avoid exposing sensitive command-line information unnecessarily.
- Provide appropriate access controls to analysts.
- Keep tenant data logically isolated.
Organizations deploying SysMon are responsible for ensuring their collection and retention practices comply with applicable legal and organizational requirements.

---

# 18. Current Development Status
SysMon is under active development.

The following values are a historical planning snapshot supplied for this documentation portal. They are not live repository-derived measurements, measurements of engineering effort, or evidence of production readiness.

| Phase | Area | Historical estimate |
| --- | --- | ---: |
| Phase 0 | Foundation | 100% |
| Phase 1 | Enrollment and Health | 100% |
| Phase 2 | Core Telemetry | 40% |
| Phase 3 | Detection | 40% |
| Phase 4 | Investigation | 25% |
| Phase 5 | Response | 0% |
| Phase 6 | Deployment | 20% |
| Phase 7 | Security and Pilots | 0% |
| Phase 8 | Sustainability | 20% |
## 18.1 Implemented foundation
The current implementation includes:

- Event envelope structure.
- Agent enrollment foundation.
- Agent health functionality.
- Agent service-management foundation.
- Bounded telemetry buffering.
- Retry and acknowledgement handling.
- Background token renewal.
- Separate bootstrap and permanent agent tokens.
- System and host information collection.
- Process telemetry collection.
- Process lifecycle tracking.
- Authentication telemetry collection.
- YAML-based detection rules.
- Alert persistence.
- Alert toggling.
- Notification functionality.
- Dashboard device views.
- Dashboard event views.
- Dashboard alert views.
- Dockerfiles.
- Docker Compose infrastructure.
- Initial license and README documentation.

## 18.2 Remaining and planned work

### Foundation

- Complete infrastructure and application foundation.
- Verify complete ingestion and storage paths.

### Enrollment and health

- Improve health reporting.
- Add more complete collector-failure visibility.
- Validate credential renewal and recovery scenarios.

### Core telemetry

- Complete persistence monitoring.
- Complete file integrity monitoring.
- Expand network context.
- Improve collector coverage across operating systems.
- Verify process hashing and lifecycle completeness.

### Detection

- Improve detection reliability.
- Add rule versioning.
- Improve deduplication.
- Improve idempotency.
- Improve event correlation.
- Harden notification processing.

### Investigation

- Add endpoint timelines.
- Add process-tree visualization.
- Improve event search.
- Improve persistence investigation.
- Add investigation cases.

### Response

- Develop response capabilities.
- Define authorized endpoint response workflows.
- Introduce safeguards and auditing before enabling response actions.

### Deployment

- Complete production installation workflows.
- Add backup and restore procedures.
- Improve upgrade and migration processes.
- Define retention configuration.
- Improve operational monitoring.

### Security and pilots

- Complete TLS implementation.
- Conduct security assessments.
- Harden access control.
- Perform pilot deployments.
- Validate real-world reliability.

### Sustainability

- Complete documentation.
- Improve contribution guidelines.
- Establish release and maintenance processes.
- Improve project onboarding.

---

# 19. Roadmap: Future Capabilities
The long-term direction is to evolve SysMon from an endpoint telemetry collection platform into a more complete EDR solution.

Potential future development areas include:

## 19.1 Advanced endpoint visibility

- More comprehensive process tracking.
- Improved process lineage.
- File activity monitoring.
- Persistence monitoring.
- Network activity context.
- Additional operating-system collectors.

## 19.2 Advanced detection

- More extensive detection rules.
- Cross-event correlation.
- Behavioral detection.
- Detection tuning.
- Improved false-positive management.
These are possible extensions, not existing product guarantees.

## 19.3 Security investigation

- Endpoint activity timelines.
- Process relationship graphs.
- Alert investigation workflows.
- Search across historical telemetry.
- Investigation cases.

## 19.4 Endpoint response
Phase 5 is currently at 0%.

Possible future response capabilities may include controlled endpoint actions, but their scope, authorization model, safety controls, and audit requirements have not yet been finalized.

No active containment or remediation capability should be assumed.

## 19.5 Scalability
Potential future improvements include:

- Kafka partition optimization.
- Independent worker scaling.
- Database query optimization.
- Retention and archival strategies.
- Multi-tenant operational scaling.
- More comprehensive ingestion backpressure.

---

# 20. Project Principles
SysMon is guided by the following principles.

### Open-source first
The project is intended to remain accessible to developers and organizations through an open-source-first approach.

### Self-hosted by design
Organizations should control their infrastructure and security telemetry without depending on a mandatory cloud platform.

### Lightweight endpoint collection
The agent should collect useful security information while minimizing unnecessary endpoint overhead.

### Centralized detection
Detection rules should be managed centrally rather than duplicated across endpoint agents.

### Platform-independent telemetry
Different operating systems should produce consistent event structures.

### Security by design
Authentication, tenant isolation, credential management, and secure communication must be considered throughout the architecture.

### Extensibility
The architecture should allow new collectors, event types, detection rules, storage capabilities, and integrations to be introduced without requiring a complete redesign.

---

# 21. Glossary
| Term | Meaning |
| --- | --- |
| EDR | Endpoint Detection and Response |
| Endpoint | A monitored computer or server |
| Agent | Software installed on an endpoint |
| Telemetry | Information collected about system activities |
| Event | A structured record of an activity |
| Tenant | An organization using SysMon |
| Tenant ID | Identifier associated with an organization |
| Bootstrap Token | Temporary credential used during enrollment |
| Agent Token | Credential used by an enrolled agent |
| Token Renewal | Replacement of an expiring credential |
| Kafka | Distributed event-streaming platform |
| ClickHouse | Analytical database for large event datasets |
| FastAPI | Python backend framework |
| Persistence | Mechanisms that allow execution or access to survive system lifecycle events |
| Process Lineage | Relationships between parent and child processes |
| Detection Rule | Logic used to identify potentially suspicious events |
| Alert | A finding generated by detection logic |
| TLS | Encryption protocol used to protect network communication |
| Backpressure | Controlling incoming data when downstream services cannot keep up |
| Idempotency | Ensuring repeated processing does not create unintended duplicate effects |
| Deduplication | Identifying and suppressing duplicate records or findings |
| Correlation | Connecting related events to provide additional security context |
---

# 22. Frequently Asked Questions

### Is SysMon cloud-based?
No. SysMon is designed as a self-hosted/on-premises platform. Organizations own their infrastructure and data.

### Does SysMon support multiple organizations?
The architecture includes tenant identification and logical tenant isolation. Full production multi-tenant readiness remains subject to implementation and security validation.

### Does the agent perform detection?
The selected architecture places detection rules in backend processing workers. The agent primarily collects and transmits telemetry.

### What information does the agent collect?
The current foundation includes system and host information, process telemetry, process lifecycle information, and authentication-related telemetry. Additional collectors are under development.

### What happens when an endpoint loses internet connectivity?
The selected offline strategy is to continue collecting telemetry, buffer it within configured limits, retry transmission, and process acknowledgements.

### Does SysMon support Windows and Linux?
The architecture is designed for Windows, Linux, and macOS. Actual feature coverage must be verified against the available platform-specific collectors.

### Does SysMon detect malware?
SysMon includes a rule-based detection architecture. It should not currently be represented as a complete antivirus or malware sandbox solution.

### Can administrators enroll agents?
Yes. The project includes a bootstrap-token enrollment flow that exchanges an initial credential for a permanent agent credential.

### Do agents need to restart when tokens expire?
The implemented background renewal mechanism is designed to replace expiring credentials without requiring a manual agent restart.

### Where is telemetry stored?
ClickHouse is the intended analytical telemetry store. Other databases are used or planned for operational and application state.

### Is endpoint isolation supported?
No active endpoint isolation or response capability should be assumed. Response is a future roadmap phase.

### Is SysMon production-ready?
SysMon is actively under development. Its core architecture and several foundational capabilities exist, but additional telemetry, detection, investigation, security, and deployment work remains.

---

# 23. Contributing and Project Development
SysMon is intended to be an extensible open-source project.

Contributors should be able to extend its functionality without tightly coupling every component.

Potential contribution areas include:

- Platform-specific collectors.
- Event schema improvements.
- Agent reliability.
- Backend ingestion.
- Detection rules.
- Dashboard improvements.
- Storage optimization.
- Documentation.
- Deployment automation.
- Security testing.
Contribution instructions, development setup, coding standards, and release procedures should be maintained in the project repository as they are finalized.

---

# 24. Documentation Status and Accuracy
This handbook describes the intended architecture, current functionality, and planned direction of SysMon.

It is a living document.

The following distinctions must be maintained whenever documentation is updated:

- **Implemented:** Functionality verified in the current codebase.
- **Partially implemented:** The foundation exists, but important functionality or validation remains incomplete.
- **Planned:** Approved or discussed development work that is not yet fully implemented.
- **Future consideration:** Potential capabilities that have not yet been finalized.
The roadmap should be updated whenever significant functionality is completed.

The implementation in the repository takes precedence over illustrative diagrams, examples, and architectural intentions in this document.

---

**SysMon — Endpoint visibility, centralized detection, and security telemetry.**

*Open-source first. Self-hosted by design.*