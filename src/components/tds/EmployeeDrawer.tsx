"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type Employee = {
  id: string;
  pan: string;
  name: string;
  employee_category: string;
  opting_new_regime: boolean;
  is_pan_operative: boolean;
  monthly_salary: number;
  annual_tds: number;
  q4_tds: number;
};

type EmployeeDrawerProps = {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  women: "Women",
  senior_citizen: "Senior Citizen",
  super_senior_citizen: "Super Senior Citizen",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function EmployeeDrawer({ employee, open, onOpenChange }: EmployeeDrawerProps) {
  if (!employee) return null;

  const categoryLabel = CATEGORY_LABELS[employee.employee_category] ?? employee.employee_category;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">{employee.name}</SheetTitle>
          <p className="text-sm text-muted-foreground font-mono">{employee.pan}</p>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={employee.is_pan_operative ? "secondary" : "destructive"}
              className="text-xs"
            >
              PAN {employee.is_pan_operative ? "Operative" : "Inoperative"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {employee.opting_new_regime ? "New Tax Regime" : "Old Tax Regime"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {categoryLabel}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <Row label="Monthly Salary" value={`₹${fmt(employee.monthly_salary)}`} />
            <Row label="Quarterly Salary (×3)" value={`₹${fmt(employee.monthly_salary * 3)}`} />
            <Row label="Annual TDS (§192)" value={`₹${fmt(employee.annual_tds)}`} />
            <Row label="Q4 TDS" value={`₹${fmt(employee.q4_tds)}`} />
          </div>

          <Separator />

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Employee ID: <span className="font-mono text-foreground">{employee.id}</span></p>
            <p>Section: <span className="font-mono text-foreground">192</span> — Salary</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
