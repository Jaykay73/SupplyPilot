import React from "react";
import { Badge } from "./Badge";

interface StatusChipProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusChip({ status, className }: StatusChipProps) {
  const normalized = (status || "").toUpperCase();

  switch (normalized) {
    case "APPROVED":
    case "COMPLETED":
    case "CONFIRMED":
    case "QUALIFIED":
    case "ACTIVE":
      return (
        <Badge variant="emerald" beacon={normalized === "ACTIVE"} className={className}>
          {normalized === "CONFIRMED" ? "Confirmed" : normalized}
        </Badge>
      );

    case "PENDING":
    case "PENDING_APPROVAL":
    case "WAITING_APPROVAL":
    case "PROCESSING":
    case "SCHEDULED":
      return (
        <Badge variant="amber" beacon className={className}>
          {normalized === "PENDING_APPROVAL" ? "Pending Approval" : normalized}
        </Badge>
      );

    case "CRITICAL":
    case "HIGH":
    case "REJECTED":
    case "STALLED_SHORTAGE":
    case "CANCELLED":
    case "RESTRICTED":
      return (
        <Badge variant="red" beacon={normalized === "CRITICAL" || normalized === "STALLED_SHORTAGE"} className={className}>
          {normalized === "STALLED_SHORTAGE" ? "Stalled (Shortage)" : normalized}
        </Badge>
      );

    case "MEDIUM":
      return (
        <Badge variant="amber" className={className}>
          Medium Risk
        </Badge>
      );

    case "LOW":
      return (
        <Badge variant="slate" className={className}>
          Low Risk
        </Badge>
      );

    case "RUNNING":
      return (
        <Badge variant="cyan" beacon className={className}>
          Running
        </Badge>
      );

    default:
      return (
        <Badge variant="slate" className={className}>
          {status}
        </Badge>
      );
  }
}
