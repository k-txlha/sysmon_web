export interface DocsPage {
  slug: string;
  title: string;
  description: string;
  chapters?: number[];
  source?: "installation";
}

export interface DocsCategory {
  title: string;
  pages: DocsPage[];
}

export const docsCategories: DocsCategory[] = [
  {
    title: "Introduction",
    pages: [
      {
        slug: "introduction/overview",
        title: "Overview",
        description: "What SysMon is, the problem it addresses, and its product goals.",
        chapters: [1],
      },
      {
        slug: "introduction/core-concepts",
        title: "Core concepts",
        description: "Endpoints, agents, tenants, telemetry, events, rules, and alerts.",
        chapters: [2],
      },
    ],
  },
  {
    title: "Getting started",
    pages: [
      {
        slug: "getting-started/installation",
        title: "Installation & Deployment",
        description: "Verified prerequisites, Compose infrastructure, backend, worker, and agent setup.",
        source: "installation",
      },
    ],
  },
  {
    title: "Architecture",
    pages: [
      {
        slug: "architecture/overview",
        title: "System architecture",
        description: "Agent, API, Kafka, workers, storage, and the dashboard data flow.",
        chapters: [3],
      },
      {
        slug: "architecture/technology-stack",
        title: "Technology stack",
        description: "The current and intended roles of the platform technologies.",
        chapters: [14],
      },
    ],
  },
  {
    title: "Endpoint agent",
    pages: [
      {
        slug: "endpoint-agent/overview",
        title: "Agent and collectors",
        description: "Process, authentication, persistence, file, and network telemetry.",
        chapters: [4],
      },
      {
        slug: "endpoint-agent/offline-behavior",
        title: "Offline behavior",
        description: "Buffering, retries, acknowledgements, and delivery considerations.",
        chapters: [8],
      },
    ],
  },
  {
    title: "Event schema",
    pages: [
      {
        slug: "event-schema/overview",
        title: "Event architecture",
        description: "The canonical event envelope and schema evolution.",
        chapters: [5],
      },
    ],
  },
  {
    title: "Authentication",
    pages: [
      {
        slug: "authentication/overview",
        title: "Agent enrollment",
        description: "Bootstrap credentials, agent tokens, renewal, and revocation.",
        chapters: [6],
      },
    ],
  },
  {
    title: "Multi-tenancy",
    pages: [
      {
        slug: "multi-tenancy/overview",
        title: "Tenant architecture",
        description: "Tenant identification and logical data-isolation requirements.",
        chapters: [7],
      },
    ],
  },
  {
    title: "Detection",
    pages: [
      {
        slug: "detection/overview",
        title: "Detection engine",
        description: "Server-side rule evaluation, YAML rules, and limitations.",
        chapters: [9],
      },
    ],
  },
  {
    title: "Alerts",
    pages: [
      {
        slug: "alerts/overview",
        title: "Alert management",
        description: "Alert persistence, review, and notification direction.",
        chapters: [10],
      },
    ],
  },
  {
    title: "Dashboard",
    pages: [
      {
        slug: "dashboard/overview",
        title: "Dashboard",
        description: "Device, event, and alert views described by the handbook.",
        chapters: [11],
      },
    ],
  },
  {
    title: "Security",
    pages: [
      {
        slug: "security/overview",
        title: "Security architecture",
        description: "Authentication, transport, rate limits, and isolation goals.",
        chapters: [12],
      },
      {
        slug: "security/privacy",
        title: "Privacy and data handling",
        description: "Sensitive endpoint data, access, retention, and responsibilities.",
        chapters: [17],
      },
    ],
  },
  {
    title: "Deployment",
    pages: [
      {
        slug: "deployment/overview",
        title: "Deployment architecture",
        description: "Self-hosting, containers, and administrator responsibilities.",
        chapters: [13],
      },
    ],
  },
  {
    title: "API reference",
    pages: [
      {
        slug: "api-reference/overview",
        title: "API Reference (30 Routes)",
        description: "Complete inventory of all 30 active FastAPI endpoints across 8 routers with request/response schemas.",
        chapters: [15],
      },
    ],
  },
  {
    title: "Operations",
    pages: [
      {
        slug: "operations/overview",
        title: "Operational reliability",
        description: "Agent health, service management, collector errors, and backend health.",
        chapters: [16],
      },
    ],
  },
  {
    title: "Roadmap",
    pages: [
      {
        slug: "roadmap/current-status",
        title: "Current status",
        description: "Historical roadmap estimates and the documented foundation.",
        chapters: [18],
      },
      {
        slug: "roadmap/future-capabilities",
        title: "Future capabilities",
        description: "Planned visibility, detection, investigation, response, and scale work.",
        chapters: [19],
      },
    ],
  },
  {
    title: "Contributing",
    pages: [
      {
        slug: "contributing/principles",
        title: "Project principles",
        description: "Open-source, self-hosted, security-first, extensible design goals.",
        chapters: [20],
      },
      {
        slug: "contributing/development",
        title: "Development",
        description: "Contribution areas and what the current website checkout contains.",
        chapters: [23],
      },
      {
        slug: "contributing/documentation-status",
        title: "Documentation accuracy",
        description: "How to distinguish implemented, partial, planned, and future work.",
        chapters: [24],
      },
    ],
  },
  {
    title: "Glossary",
    pages: [
      {
        slug: "glossary",
        title: "Glossary and FAQ",
        description: "Searchable terminology and answers to common product questions.",
        chapters: [21, 22],
      },
    ],
  },
];

export const docsPages = docsCategories.flatMap((category) =>
  category.pages.map((page) => ({ ...page, category: category.title })),
);

export type FlatDocsPage = (typeof docsPages)[number];
