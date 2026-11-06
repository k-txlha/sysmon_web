# SysMon Installation & Deployment Guide

This guide covers the verified installation, infrastructure startup, backend configuration, and endpoint agent deployment workflow for SysMon.

> **System Maturity Notice:** SysMon is an open-source development prototype. While 118 unit and API tests pass across the repository, there is no single-command root Docker Compose stack. Infrastructure services, backend gateway, processing worker, and dashboard are started as individual components as documented below.

---

## 1. System Requirements & Prerequisites

### Server & Infrastructure Requirements

Monitored infrastructure nodes running the backend gateway and analytical pipeline require:

| Component | Minimum Specification | Recommended Specification | Notes |
| :--- | :--- | :--- | :--- |
| **Operating System** | Linux (Ubuntu 22.04/24.04, Debian 12) or Windows Server | Linux (Ubuntu 24.04 LTS x86_64) | Tested on Linux and Windows |
| **Python** | Python 3.10 or higher | Python 3.11 / 3.12 | Required for backend, worker, agent |
| **Container Engine** | Docker 24.0+ & Docker Compose v2 | Latest Docker Engine with Compose | For Kafka, ClickHouse, and Valkey |
| **Memory (RAM)** | 8 GB RAM | 16 GB RAM | Kafka KRaft (3 brokers) + ClickHouse |
| **Disk Space** | 20 GB available storage | 100+ GB SSD storage | ClickHouse MergeTree telemetry storage |

### Monitored Endpoint Prerequisites

Monitored client workstations and servers require:

- **Windows:** Windows 10 / 11 or Windows Server 2019+. Python 3.10+. Optional `pywin32` package for Security Event Log access (Event IDs 4624/4625).
- **Linux:** Ubuntu, Debian, RHEL, or Fedora with systemd. Read access to `/var/log/auth.log` or `journalctl` for PAM/SSH authentication records.
- **macOS:** macOS 12 (Monterey) or higher. Python 3.10+. (Note: macOS service installer is currently in development; execution runs via terminal process).

---

## 2. Infrastructure Setup (Docker Compose)

SysMon relies on three external infrastructure services configured in the `infra/` directory:

1. **Apache Kafka (KRaft Cluster):** 3 controllers and 3 brokers on ports `29092`, `39092`, `49092`, with Kafka UI on `8080`.
2. **ClickHouse:** Columnar analytical database on HTTP port `8123` and native port `9000`.
3. **Valkey:** High-performance Redis-compatible service on port `6379` for API rate-limiting.

Clone the repository and start each stack:

```bash
git clone https://github.com/k-txlha/sysmon.git
cd sysmon

# 1. Start Apache Kafka KRaft cluster
docker compose -f infra/kafka/docker-compose.yaml up -d

# 2. Start ClickHouse database
docker compose -f infra/clickhouse/docker-compose.yaml up -d

# 3. Start Valkey rate-limiting store
docker compose -f infra/redis/docker-compose.yaml up -d
```

Verify that all containers are healthy:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 3. Backend Gateway Setup

The backend is built with FastAPI and runs on Uvicorn. It handles administrator authentication, agent enrollment, telemetry validation, and Kafka event publishing.

### Step 1: Install Python Dependencies

```bash
# Recommended: Create a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install root dependencies (covers backend, worker, and agent)
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create `backend/.env` or export environment variables:

```bash
# Server configuration
PORT=8000
ENVIRONMENT=production  # Use 'development' only for local testing without TLS

# Kafka and ClickHouse settings
KAFKA_BOOTSTRAP_SERVERS=localhost:29092
KAFKA_TOPIC=telemetry_data
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USERNAME=backend
CLICKHOUSE_PASSWORD=YourSecureClickHousePassword
CLICKHOUSE_DB=metrics

# Rate limiting
REDIS_URL=redis://localhost:6379

# Security & CORS
AUTH_DB_PATH=../data/sysmon_auth.db
AUTH_SESSION_COOKIE_SECURE=true
ALLOWED_ORIGINS=https://dashboard.yourdomain.com
```

### Step 3: Start the Backend Server

```bash
python -m backend
```

The gateway starts on `http://0.0.0.0:8000` (or configured TLS ports).

---

## 4. Processing Worker Setup

The worker is a background Python process that consumes telemetry from Kafka, validates envelopes, persists supported records to ClickHouse, evaluates YAML detection rules, and dispatches alerts.

> **Configuration Warning:** ClickHouse Compose exposes HTTP port `8123`. The worker configuration defaults to `8443` unless explicitly overridden. Ensure `CLICKHOUSE_PORT=8123` is exported before launching the worker.

```bash
# Export worker environment overrides
export CLICKHOUSE_HOST=localhost
export CLICKHOUSE_PORT=8123
export CLICKHOUSE_USERNAME=backend
export CLICKHOUSE_PASSWORD=YourSecureClickHousePassword
export CLICKHOUSE_DB=metrics
export KAFKA_BOOTSTRAP_SERVERS=localhost:29092
export KAFKA_TOPIC=telemetry_data

# Optional alert notification webhooks
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Start the worker consumer
python -m worker.main
```

At startup, the worker connects to ClickHouse, initializes the `MergeTree` tables (`DEVICES`, `EVENTS`, `ALERTS`, `AGENT_HEALTH`), loads all enabled YAML rules from `worker/detection/rules/`, and joins the Kafka consumer group.

---

## 5. Administrative Account Setup

Before accessing the dashboard or generating agent tokens, you must create the primary administrator account.

### Option A: Local Loopback REST Setup

The setup endpoint `POST /api/v1/auth/setup` is restricted to local loopback clients (`127.0.0.1` or `::1`) and rejects forwarded proxy headers:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "YourStrongPassword123!"}'
```

### Option B: Interactive CLI Recovery Tool

If deploying remotely without local browser access, use the included administrator recovery CLI:

```bash
python -m backend.auth_recovery
```

Follow the interactive prompts to initialize or reset administrator credentials. The tool hashes passwords with Argon2id and revokes any existing active sessions.

---

## 6. Dashboard Frontend Setup

The dashboard is a React 19 single-page application built with Vite.

```bash
cd dashboard

# Install dependencies (requires Node.js 20.19.0+ or >=22.12.0)
npm install

# For local development:
npm run dev

# For production build:
npm run build
```

The production build generates static assets in `dashboard/dist/`. A production Dockerfile and Nginx reverse proxy configuration are included in `dashboard/Dockerfile` and `dashboard/nginx.conf`.

---

## 7. Endpoint Agent Setup & Enrollment

Endpoints are enrolled using a two-stage credential exchange. Agents never receive hardcoded permanent credentials.

### Step 1: Generate a Bootstrap Token

From the dashboard or using your administrator session cookie:

```bash
curl -X POST http://localhost:8000/api/v1/agents/token \
  -H "Cookie: sysmon_admin_session=<YOUR_ADMIN_SESSION>" \
  -H "X-CSRF-Token: <YOUR_CSRF_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"description": "Enrollment for WORKSTATION-01"}'
```

The server returns a one-time bootstrap token valid for 30 minutes.

### Step 2: Enroll the Endpoint Agent

On the target endpoint machine, run the enrollment CLI:

```bash
# Run enrollment handshake
python -m agent.enroll \
  --token <BOOTSTRAP_TOKEN> \
  --backend https://backend.yourdomain.com:8000
```

The CLI contacts the backend, exchanges the bootstrap token, receives a server-assigned `agent_id` and a 1-hour operational bearer token, and writes the configuration atomically to `agent/.env` with `0600` file permissions.

### Step 3: Run the Agent

To test the agent in interactive mode:

```bash
python -m agent.main
```

### Step 4: Install as an Operating System Service

SysMon includes service helpers in `agent/service.py`:

- **Linux (systemd):**
  ```bash
  sudo python -m agent.service install
  sudo systemctl start sysmon-agent
  sudo systemctl status sysmon-agent
  ```
- **Windows (Task Scheduler):**
  ```powershell
  python -m agent.service install
  ```
- **macOS:**
  Configure a standard launchd daemon plist pointing to `python -m agent.main` with working directory set to the agent installation path.

---

## 8. Post-Installation Verification Checklist

Verify your end-to-end installation using the following checks:

- [ ] **Health Endpoint:** Query `GET http://localhost:8000/health`. Verify that `status` is `healthy` or `degraded` and Kafka/ClickHouse report connected.
- [ ] **Test Suite:** Execute `python run_tests.py` from repository root. Verify all 118 unit tests pass (54 agent, 45 backend, 19 worker).
- [ ] **ClickHouse Device Record:** Query ClickHouse to verify the enrolled agent appears in the `DEVICES` table:
  ```bash
  docker exec -it clickhouse-server clickhouse-client --query "SELECT agent_id, hostname, ip_address, updated_at FROM metrics.DEVICES FORMAT Pretty;"
  ```
- [ ] **Agent Log Verification:** Inspect `agent.log` to confirm telemetry envelopes are being sent and returning HTTP `202 Accepted`.
- [ ] **Detection Rule Test:** Generate 5 consecutive failed SSH/logon attempts on an enrolled host within 60 seconds. Verify an alert is created in `metrics.ALERTS` and appears in the dashboard threat view.

---

## 9. Troubleshooting & Common Issues

| Symptom | Probable Cause | Recommended Resolution |
| :--- | :--- | :--- |
| **Agent returns HTTP 426 Upgrade Required** | Plain HTTP transport was used in production mode. | Configure valid TLS certificates on the backend or set `TLS_TERMINATED=true` if behind a trusted TLS reverse proxy. |
| **Worker logs ClickHouse Connection Refused** | Default port mismatch between Compose (8123) and worker (8443). | Export `CLICKHOUSE_PORT=8123` before starting `worker.main`. |
| **Admin setup returns HTTP 403 Forbidden** | Setup request originated from a remote non-loopback IP. | Run setup directly from the server host on `127.0.0.1` or execute `python -m backend.auth_recovery`. |
| **Kafka broker connection timeout** | Kafka KRaft brokers still completing quorum election. | Allow 15–30 seconds after `docker compose up` before starting backend or worker processes. |
| **Agent logs "Event dropped: buffer full"** | Endpoint was offline longer than buffer capacity. | Increase `SIEM_BUFFER_MAX_EVENTS` (default 25,000) or `SIEM_BUFFER_MAX_BYTES` (default 50 MiB) in `agent/.env`. |
