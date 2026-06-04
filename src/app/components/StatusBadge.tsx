import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";

type StatusType = "pending" | "approved" | "rejected" | "info";

const statusConfig = {
  pending: {
    label: "대기",
    className: "bg-[var(--status-pending)] text-white border-transparent",
  },
  approved: {
    label: "승인",
    className: "bg-[var(--status-approved)] text-white border-transparent",
  },
  rejected: {
    label: "반려",
    className: "bg-[var(--status-rejected)] text-white border-transparent",
  },
  info: {
    label: "정보",
    className: "bg-[var(--status-info)] text-white border-transparent",
  },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status];
  return (
    <Badge className={cn("rounded-full px-3 py-1", config.className)}>
      {config.label}
    </Badge>
  );
}
