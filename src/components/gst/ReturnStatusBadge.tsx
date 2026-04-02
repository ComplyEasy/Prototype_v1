import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ReturnStatus = "filed" | "draft" | "pending" | "blocked" | "overdue" | "processing";

const config: Record<ReturnStatus, { label: string; className: string }> = {
  filed:      { label: "Filed",      className: "bg-green-100 text-green-800 border-green-200" },
  draft:      { label: "Draft",      className: "bg-blue-100 text-blue-800 border-blue-200" },
  pending:    { label: "Pending",    className: "bg-amber-100 text-amber-800 border-amber-200" },
  blocked:    { label: "Blocked",    className: "bg-muted text-muted-foreground border-border" },
  overdue:    { label: "Overdue",    className: "bg-red-100 text-red-800 border-red-200" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-800 border-purple-200" },
};

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium capitalize", className)}>
      {label}
    </Badge>
  );
}
