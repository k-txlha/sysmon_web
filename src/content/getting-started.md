# Installation and first run

This guide separates steps that are runnable in this website checkout from the EDR deployment workflow described in the supplied project handbook. The current workspace contains the Vite website and its assets; it does not contain a SysMon backend, endpoint agent, worker, Docker Compose file, or service configuration.

> **Important:** Do not use this page as a production deployment recipe. The EDR installation commands, service names, environment variables, enrollment script location, and agent service definitions cannot be verified from this checkout.

## What you can run from this checkout

The following commands run the documentation website only. They do not start an EDR backend, Kafka, a worker, or an endpoint agent.

```bash
npm install
npm run dev
```

Open the local address printed by Vite (by default, `http://localhost:5173`). The package manifest does not declare a minimum Node.js version.

## EDR prerequisites

The handbook describes a self-hosted architecture using Python services and endpoint agents, Docker and Docker Compose, Kafka, ClickHouse, PostgreSQL, SQLite, Redis/Valkey, and a web dashboard. Caddy is described as the intended TLS reverse proxy.

Exact supported versions, minimum hardware requirements, operating-system coverage, and the required Compose profiles are not present in this website checkout. Confirm them against the EDR repository before preparing a host.

## Repository setup

The canonical EDR repository URL is not included in this workspace, so a clone command cannot be provided safely. The checked-out project here is the website: its Vite scripts are in `package.json`, page code is in `src/`, source exports are in `assets/`, and website SVGs are served from `public/assets/`.

The website's `npm install` and `npm run dev` commands are not substitutes for EDR dependency installation or backend startup instructions.

For the website only, `VITE_PRODUCT_NAME` changes the displayed product name and `VITE_REPOSITORY_URL` supplies the project link in the documentation portal. These are website build-time settings, not SysMon EDR configuration variables. No canonical repository URL was available when this guide was written.

## Environment configuration and infrastructure

No EDR `.env.example`, Docker Compose configuration, backend settings, database migrations, or service manifests are present in this checkout. Consequently, this guide cannot reliably name EDR environment variables, defaults, secrets, container names, ports, health checks, startup commands, or log commands. Do not copy credentials from examples into a deployment.

The intended architecture assigns telemetry transport to Kafka, analytical events to ClickHouse, structured application state to PostgreSQL, and an earlier administrative-storage role to SQLite. The final ownership and active services must be checked against the deployment files for the exact release being installed.

## Backend, workers, and dashboard

The supplied handbook describes a FastAPI ingestion gateway and Kafka-processing workers. It identifies `POST /api/v1/agents/token` as an enrollment endpoint previously discussed, but the application source, route models, worker entry point, API schema, and authentication contract are not present here. The dashboard shown on the website is a design preview, not a live security console.

Before starting these services, obtain the EDR repository and verify its documented entry points, configuration examples, health checks, and logs. No backend or worker start command is published here because none can be verified.

## Agent installation by operating system

The project handbook describes a Python agent architecture intended for Windows, Linux, and macOS. It does not establish that all collectors or service installers are complete on all platforms.

| Platform | Documentation status |
| --- | --- |
| Windows | Agent package, configuration keys, enrollment invocation, Windows service name, and log location require verification against the agent source. |
| Linux | Package layout, configuration keys, enrollment invocation, systemd unit, and log location require verification against the agent source. |
| macOS | Collector coverage and launch-service configuration require verification; complete support is not established by this website checkout. |

Do not install an example service unit or run an enrollment command copied from a different release.

## Agent enrollment

The supplied handbook describes a two-stage flow: an administrator creates a short-lived bootstrap credential, the agent exchanges it during enrollment, and the backend issues an agent-specific credential. The route previously documented for this flow is `POST /api/v1/agents/token`.

The token-generation procedure, `enroll.py` location and arguments, request and response fields, token storage path, and registration verification method are not available in this checkout. Treat the flow as design documentation until those details are confirmed in the EDR implementation. Never publish or commit real bootstrap or agent tokens.

## Verification checklist

Use the release's deployment instructions to verify each item. This website checkout cannot perform these EDR checks:

- [ ] Required infrastructure services report healthy.
- [ ] The FastAPI route is reachable and its OpenAPI schema matches the release.
- [ ] Kafka accepts telemetry and the intended consumer group is active.
- [ ] ClickHouse and application-state stores are reachable.
- [ ] The actual security dashboard is available and connected to its backend.
- [ ] An agent is enrolled and its service is running.
- [ ] Telemetry is acknowledged, processed, stored, and visible in the dashboard.
- [ ] Detection evaluation is enabled and verified where configured.

## Troubleshooting approach

Start with the exact service status and logs for the installed release. Check configuration names against that release's example files, verify network reachability between dependent services, and confirm the agent identity and credential state without printing token values. For an empty event view, distinguish a healthy collector returning no events from a collector error and check ingestion, worker consumption, storage, and dashboard filters in order.

This checkout does not define EDR service names or log commands, so it cannot provide release-specific diagnostics or resolutions. Use the project's deployment and agent sources rather than guessing container names, error messages, or command-line options.
