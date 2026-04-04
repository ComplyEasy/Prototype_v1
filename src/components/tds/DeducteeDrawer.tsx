"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

export type DeducteePayment = {
  id: string;
  challan_serial: string;
  bsr_code: string;
  section: string;
  code: string;
  nature: string;
  payment_amount: number;
  tds_amount: number;
  tds_rate: number;
  payment_date: string;
  deduction_date: string;
  deposit_due: string;
};

export type Deductee = {
  id: string;
  pan: string;
  name: string;
  is_206ab_applicable: boolean;
  is_pan_operative: boolean;
  payments: DeducteePayment[];
};

type DeducteeDrawerProps = {
  deductee: Deductee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function DeducteeDrawer({ deductee, open, onOpenChange }: DeducteeDrawerProps) {
  if (!deductee) return null;

  const totalPayment = deductee.payments.reduce((s, p) => s + p.payment_amount, 0);
  const totalTDS = deductee.payments.reduce((s, p) => s + p.tds_amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">{deductee.name}</SheetTitle>
          <p className="text-sm text-muted-foreground font-mono">{deductee.pan}</p>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={deductee.is_pan_operative ? "secondary" : "destructive"}
              className="text-xs"
            >
              PAN {deductee.is_pan_operative ? "Operative" : "Inoperative"}
            </Badge>
            {deductee.is_206ab_applicable && (
              <Badge className="text-xs gap-1 bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="h-3 w-3" />
                §206AB Applicable — Higher TDS Rate
              </Badge>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-0.5">
              {deductee.payments.length} Payment{deductee.payments.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Total TDS: ₹{fmt(totalTDS)} · Total Payment: ₹{fmt(totalPayment)}
            </p>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">Section</TableHead>
                  <TableHead className="text-xs">Nature</TableHead>
                  <TableHead className="text-xs text-right">Payment</TableHead>
                  <TableHead className="text-xs text-right">TDS</TableHead>
                  <TableHead className="text-xs text-right w-14">Rate</TableHead>
                  <TableHead className="text-xs">Deposit By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductee.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.section}</TableCell>
                    <TableCell className="text-xs">{p.nature}</TableCell>
                    <TableCell className="text-xs text-right">₹{fmt(p.payment_amount)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      ₹{fmt(p.tds_amount)}
                    </TableCell>
                    <TableCell className="text-xs text-right">{p.tds_rate}%</TableCell>
                    <TableCell className="text-xs">{p.deposit_due}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 bg-muted/30">
                  <TableCell colSpan={2} className="text-xs font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    ₹{fmt(totalPayment)}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    ₹{fmt(totalTDS)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
