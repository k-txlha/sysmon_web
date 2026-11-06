export type FeatureStatus = "available" | "in-development" | "planned" | "partially-implemented" | "caveat" | "not-implemented";

interface StatusBadgeProps {
  status: FeatureStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");

  let label = status.toUpperCase();
  let statusClass = "badge-neutral";

  switch (normalized) {
    case "available":
    case "implemented":
    case "implemented-and-verified":
      label = "AVAILABLE";
      statusClass = "badge-available";
      break;
    case "in-development":
    case "in-progress":
      label = "IN DEVELOPMENT";
      statusClass = "badge-dev";
      break;
    case "partially-implemented":
    case "partial":
      label = "PARTIALLY IMPLEMENTED";
      statusClass = "badge-partial";
      break;
    case "planned":
    case "planned-scope":
      label = "PLANNED SCOPE";
      statusClass = "badge-planned";
      break;
    case "caveat":
    case "qualify":
      label = "LOGIC CAVEAT";
      statusClass = "badge-caveat";
      break;
    case "not-implemented":
      label = "NOT IMPLEMENTED";
      statusClass = "badge-not-implemented";
      break;
    default:
      label = status.toUpperCase();
      statusClass = "badge-neutral";
  }

  return (
    <span className={`status-badge ${statusClass} ${className}`}>
      <span className="badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

