"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import tdsData from "@/data/tds.json";
import type { Employee } from "@/components/tds/EmployeeDrawer";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm font-medium" : "text-sm font-medium"}>
        {value}
      </span>
    </div>
  );
}

export function SalaryCalculator() {
  const employees = tdsData.employees as Employee[];
  const [selectedId, setSelectedId] = useState<string>("");

  const employee = useMemo(
    () => employees.find((e) => e.id === selectedId) ?? null,
    [selectedId, employees]
  );

  const categoryLabel =
    employee?.employee_category === "women"
      ? "Women"
      : employee?.employee_category === "senior_citizen"
      ? "Senior Citizen"
      : "General";

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="sal-employee">Select Employee</Label>
        <Select value={selectedId} onValueChange={(v) => v && setSelectedId(v)}>
          <SelectTrigger id="sal-employee">
            <SelectValue placeholder="Choose an employee…" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name} — <span className="font-mono text-xs">{e.pan}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {employee ? (
        <Card className="max-w-lg">
          <CardContent className="pt-5 pb-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">{employee.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{employee.pan}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge
                  variant={employee.is_pan_operative ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  PAN {employee.is_pan_operative ? "Operative" : "Inoperative"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {employee.opting_new_regime ? "New Regime" : "Old Regime"}
                </Badge>
              </div>
            </div>

            <div className="space-y-0">
              <Row label="Category" value={categoryLabel} />
              <Row label="Monthly Salary" value={`₹${fmt(employee.monthly_salary)}`} />
              <Row label="Quarterly Salary (Q4 × 3 months)" value={`₹${fmt(employee.monthly_salary * 3)}`} />
              <Row label="Annual TDS — Sec 192" value={`₹${fmt(employee.annual_tds)}`} />
              <Row label="Q4 TDS (Jan–Mar)" value={`₹${fmt(employee.q4_tds)}`} />
              <Row
                label="Effective Annual Rate"
                value={`${((employee.annual_tds / (employee.monthly_salary * 12)) * 100).toFixed(2)}%`}
              />
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2.5">
              §192 TDS is computed on estimated annual income at the start of FY and deducted
              proportionally each month. Actual deduction may vary based on declarations, HRA, 80C, etc.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">Select an employee to view salary TDS details.</p>
        </div>
      )}
    </div>
  );
}
