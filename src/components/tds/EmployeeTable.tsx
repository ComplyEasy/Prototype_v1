"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmployeeDrawer, type Employee } from "@/components/tds/EmployeeDrawer";
import { ChevronRight } from "lucide-react";

type EmployeeTableProps = {
  employees: Employee[];
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  women: "Women",
  senior_citizen: "Senior Citizen",
  super_senior_citizen: "Super Sr. Citizen",
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [selected, setSelected] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(emp: Employee) {
    setSelected(emp);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-32">PAN</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Regime</TableHead>
              <TableHead className="text-xs text-right">Monthly Salary</TableHead>
              <TableHead className="text-xs text-right">Q4 TDS</TableHead>
              <TableHead className="text-xs">PAN Status</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow
                key={emp.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => openDrawer(emp)}
              >
                <TableCell className="font-mono text-xs">{emp.pan}</TableCell>
                <TableCell className="text-sm font-medium">{emp.name}</TableCell>
                <TableCell className="text-xs">
                  {CATEGORY_LABELS[emp.employee_category] ?? emp.employee_category}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="font-normal text-xs">
                    {emp.opting_new_regime ? "New" : "Old"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-right">₹{fmt(emp.monthly_salary)}</TableCell>
                <TableCell className="text-xs text-right font-medium">
                  ₹{fmt(emp.q4_tds)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={emp.is_pan_operative ? "secondary" : "destructive"}
                    className="text-xs font-normal"
                  >
                    {emp.is_pan_operative ? "Operative" : "Inoperative"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmployeeDrawer
        employee={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
