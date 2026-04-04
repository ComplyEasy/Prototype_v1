import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, User, Building2 } from "lucide-react";

type Chip = {
  label: string;
  value: string | number;
  color: "red" | "orange" | "yellow" | "green" | "default";
  icon: React.ReactNode;
};

type ROCSummaryBarProps = {
  overdueForms: number;
  dueSoon: number;
  kycPending: number;
  companyStatus: string;
  className?: string;
};

const colorMap: Record<Chip["color"], string> = {
  red:     "bg-red-50 border-red-200 text-red-700",
  orange:  "bg-orange-50 border-orange-200 text-orange-700",
  yellow:  "bg-amber-50 border-amber-200 text-amber-700",
  green:   "bg-green-50 border-green-200 text-green-700",
  default: "bg-muted/40 border text-foreground",
};

export function ROCSummaryBar({
  overdueForms,
  dueSoon,
  kycPending,
  companyStatus,
  className,
}: ROCSummaryBarProps) {
  const chips: Chip[] = [
    {
      label: "Overdue Forms",
      value: overdueForms,
      color: overdueForms > 0 ? "red" : "green",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    {
      label: "Due This Month",
      value: dueSoon,
      color: dueSoon > 0 ? "orange" : "green",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    {
      label: "KYC Pending",
      value: kycPending,
      color: kycPending > 0 ? "yellow" : "green",
      icon: <User className="h-3.5 w-3.5" />,
    },
    {
      label: "Company Status",
      value: companyStatus,
      color: companyStatus === "Active" ? "green" : "red",
      icon: <Building2 className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {chips.map((chip) => (
        <div
          key={chip.label}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium",
            colorMap[chip.color]
          )}
        >
          {chip.icon}
          <span className="text-muted-foreground font-normal">{chip.label}:</span>
          <span className="font-semibold">{chip.value}</span>
        </div>
      ))}
    </div>
  );
}
