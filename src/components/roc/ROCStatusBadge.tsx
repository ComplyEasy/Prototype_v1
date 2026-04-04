import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ROCFilingStatus = "Filed" | "Upcoming" | "Pending" | "Overdue" | "CA Pending";

const config: Record<ROCFilingStatus, { label: string; className: string }> = {
  Filed:       { label: "Filed",      className: "bg-green-100 text-green-800 border-green-200" },
  Upcoming:    { label: "Upcoming",   className: "bg-blue-100 text-blue-800 border-blue-200" },
  Pending:     { label: "Pending",    className: "bg-amber-100 text-amber-800 border-amber-200" },
  Overdue:     { label: "Overdue",    className: "bg-red-100 text-red-800 border-red-200" },
  "CA Pending":{ label: "CA Pending", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

export function ROCStatusBadge({ status }: { status: ROCFilingStatus }) {
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", className)}>
      {label}
    </Badge>
  );
}
