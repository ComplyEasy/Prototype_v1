"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TDSResult = {
  section: string;
  sectionName: string;
  rate: number;
  paymentAmount: number;
  tdsAmount: number;
  netPayable: number;
  depositDue: string;
  is206ab?: boolean;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function TDSResultCard({ result }: { result: TDSResult }) {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span>TDS Calculation Result</span>
          {result.is206ab ? (
            <Badge className="font-normal text-xs gap-1 bg-red-100 text-red-700 border-red-300 shrink-0">
              <AlertTriangle className="h-3 w-3" />
              §206AB / §206AA
            </Badge>
          ) : (
            <Badge className="font-normal text-xs gap-1 bg-green-100 text-green-700 border-green-300 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              Normal Rate
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Section</p>
            <p className="font-mono font-semibold text-foreground">{result.section}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{result.sectionName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">TDS Rate</p>
            <p
              className={cn(
                "text-2xl font-bold",
                result.is206ab ? "text-red-600" : "text-primary"
              )}
            >
              {result.rate}%
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 border p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Amount</span>
            <span className="font-medium">₹{fmt(result.paymentAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TDS Deducted</span>
            <span
              className={cn(
                "font-semibold",
                result.is206ab ? "text-red-600" : "text-foreground"
              )}
            >
              − ₹{fmt(result.tdsAmount)}
            </span>
          </div>
          <div className="border-t pt-2.5 flex justify-between">
            <span className="text-sm font-medium">Net Payable</span>
            <span className="text-base font-bold text-primary">₹{fmt(result.netPayable)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border rounded-md px-3 py-2.5 bg-background">
          <span className="text-muted-foreground">Deposit Due</span>
          <span className="font-medium text-foreground">{result.depositDue}</span>
        </div>

        {result.is206ab && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Higher rate applied: deductee has not filed ITR for 2+ years or PAN is inoperative. Normal rate would apply
            once compliance is restored.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
