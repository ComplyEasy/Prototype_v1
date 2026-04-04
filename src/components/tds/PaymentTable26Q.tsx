"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { Deductee } from "@/components/tds/DeducteeDrawer";

type PaymentTable26QProps = {
  deductees: Deductee[];
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function PaymentTable26Q({ deductees }: PaymentTable26QProps) {
  // Flatten all payments from all deductees
  const rows = deductees.flatMap((ded) =>
    ded.payments.map((p) => ({
      ...p,
      ded_name: ded.name,
      ded_pan: ded.pan,
      is_206ab: ded.is_206ab_applicable,
      is_pan_operative: ded.is_pan_operative,
    }))
  );

  const totalPayment = rows.reduce((s, r) => s + r.payment_amount, 0);
  const totalTDS = rows.reduce((s, r) => s + r.tds_amount, 0);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs w-32">Deductee PAN</TableHead>
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Section</TableHead>
            <TableHead className="text-xs">Nature</TableHead>
            <TableHead className="text-xs text-right">Payment (₹)</TableHead>
            <TableHead className="text-xs text-right">TDS (₹)</TableHead>
            <TableHead className="text-xs text-right w-14">Rate</TableHead>
            <TableHead className="text-xs">Deposit By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isOverdue = row.deposit_due < today;
            return (
              <TableRow key={row.id} className={row.is_206ab ? "bg-amber-50/40" : ""}>
                <TableCell className="font-mono text-xs">{row.ded_pan}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>{row.ded_name}</span>
                    {row.is_206ab && (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{row.section}</TableCell>
                <TableCell className="text-xs">{row.nature}</TableCell>
                <TableCell className="text-xs text-right">₹{fmt(row.payment_amount)}</TableCell>
                <TableCell className="text-xs text-right font-medium">
                  ₹{fmt(row.tds_amount)}
                </TableCell>
                <TableCell className="text-xs text-right">
                  <span className={row.is_206ab ? "font-semibold text-red-600" : ""}>
                    {row.tds_rate}%
                  </span>
                </TableCell>
                <TableCell className="text-xs">
                  {isOverdue ? (
                    <Badge className="text-xs bg-red-100 text-red-700 border-red-300 font-normal">
                      {row.deposit_due}
                    </Badge>
                  ) : (
                    row.deposit_due
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-muted/30 border-t-2">
            <TableCell colSpan={4} className="text-xs font-semibold">
              Total
            </TableCell>
            <TableCell className="text-xs text-right font-semibold">
              ₹{fmt(totalPayment)}
            </TableCell>
            <TableCell className="text-xs text-right font-bold">₹{fmt(totalTDS)}</TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
