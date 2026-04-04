"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Employee } from "@/components/tds/EmployeeDrawer";
import type { Challan } from "@/components/tds/ChallanDrawer";

type PaymentTable24QProps = {
  employees: Employee[];
  challans: Challan[];
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function PaymentTable24Q({ employees, challans }: PaymentTable24QProps) {
  // Assign each employee round-robin to challans for demo
  function getChallan(index: number): Challan | undefined {
    return challans[index % challans.length];
  }

  const totalSalary = employees.reduce((s, e) => s + e.monthly_salary * 3, 0);
  const totalTDS = employees.reduce((s, e) => s + e.q4_tds, 0);

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs w-32">Employee PAN</TableHead>
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Section</TableHead>
            <TableHead className="text-xs">Challan Serial</TableHead>
            <TableHead className="text-xs text-right">Salary (Q4)</TableHead>
            <TableHead className="text-xs text-right">TDS</TableHead>
            <TableHead className="text-xs">Deduction Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp, i) => {
            const ch = getChallan(i);
            return (
              <TableRow key={emp.id}>
                <TableCell className="font-mono text-xs">{emp.pan}</TableCell>
                <TableCell className="text-sm">{emp.name}</TableCell>
                <TableCell className="font-mono text-xs">192</TableCell>
                <TableCell className="font-mono text-xs">{ch?.challan_serial ?? "—"}</TableCell>
                <TableCell className="text-xs text-right">
                  ₹{fmt(emp.monthly_salary * 3)}
                </TableCell>
                <TableCell className="text-xs text-right font-medium">
                  ₹{fmt(emp.q4_tds)}
                </TableCell>
                <TableCell className="text-xs">{ch?.paid_date ?? "—"}</TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-muted/30 border-t-2">
            <TableCell colSpan={4} className="text-xs font-semibold">
              Total
            </TableCell>
            <TableCell className="text-xs text-right font-semibold">
              ₹{fmt(totalSalary)}
            </TableCell>
            <TableCell className="text-xs text-right font-bold">₹{fmt(totalTDS)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
