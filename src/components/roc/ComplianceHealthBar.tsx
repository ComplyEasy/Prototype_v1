import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarCheck, FileText, UserCheck } from "lucide-react";

type HealthItem = {
  label: string;
  sublabel: string;
  value: string;
  status: "green" | "yellow" | "red";
  icon: React.ReactNode;
};

type ComplianceHealthBarProps = {
  dateOfLastAgm: string | null;
  dateOfBalanceSheet: string | null;
  kycFiled: number;
  kycTotal: number;
};

function getAgmStatus(dateOfLastAgm: string | null): "green" | "yellow" | "red" {
  if (!dateOfLastAgm) return "red";
  const agm = new Date(dateOfLastAgm);
  const agmYear = agm.getFullYear();
  const deadline = new Date(`${agmYear}-09-30`);
  const diff = (agm.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 0) return "green";
  if (diff <= 30) return "yellow";
  return "red";
}

function getAoc4Status(dateOfBalanceSheet: string | null): "green" | "yellow" | "red" {
  if (!dateOfBalanceSheet) return "red";
  return "green"; // if we have a date, assume timely for prototype
}

function getKycStatus(filed: number, total: number): "green" | "yellow" | "red" {
  if (filed === total) return "green";
  if (filed > 0) return "yellow";
  return "red";
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const colorMap = {
  green:  { card: "border-green-200 bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  yellow: { card: "border-amber-200 bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  red:    { card: "border-red-200   bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
};

export function ComplianceHealthBar({
  dateOfLastAgm,
  dateOfBalanceSheet,
  kycFiled,
  kycTotal,
}: ComplianceHealthBarProps) {
  const items: HealthItem[] = [
    {
      label: "Last AGM",
      sublabel: "Annual General Meeting",
      value: dateOfLastAgm ? fmt(dateOfLastAgm) : "Not held",
      status: getAgmStatus(dateOfLastAgm),
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      label: "Balance Sheet (AOC-4)",
      sublabel: "Financial Statements",
      value: dateOfBalanceSheet ? `FY ending ${fmt(dateOfBalanceSheet)}` : "Not filed",
      status: getAoc4Status(dateOfBalanceSheet),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Director KYC (DIR-3)",
      sublabel: "Annual KYC status",
      value: `${kycFiled} of ${kycTotal} filed`,
      status: getKycStatus(kycFiled, kycTotal),
      icon: <UserCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((item) => {
        const c = colorMap[item.status];
        return (
          <Card key={item.label} className={cn("border", c.card)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={cn("flex items-center gap-2 text-sm font-medium", c.text)}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span className={cn("h-2 w-2 rounded-full mt-1", c.dot)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.sublabel}</p>
              <p className={cn("text-sm font-semibold mt-2", c.text)}>{item.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
