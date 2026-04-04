"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TDSSummaryBar } from "@/components/tds/TDSSummaryBar";
import { TDSStatusBadge, type TDSReturnStatus } from "@/components/tds/TDSStatusBadge";
import { DeducteeTable } from "@/components/tds/DeducteeTable";
import { ChallanTable } from "@/components/tds/ChallanTable";
import { PaymentTable26Q } from "@/components/tds/PaymentTable26Q";
import { FilingWizard26Q } from "@/components/tds/FilingWizard26Q";
import type { Deductee } from "@/components/tds/DeducteeDrawer";
import type { Challan } from "@/components/tds/ChallanDrawer";
import { FileText, CalendarCheck, AlertTriangle } from "lucide-react";

type Form26QTabProps = {
  status: TDSReturnStatus;
  dueDate: string;
  filedDate: string | null;
  receiptNumber: string | null;
  totalDeductees: number;
  totalTDS: number;
  totalChallans: number;
  challansDeposited: number;
  deductees: Deductee[];
  challans: Challan[];
  tan: string;
  period: string;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function Form26QTab({
  status,
  dueDate,
  filedDate,
  receiptNumber,
  totalDeductees,
  totalTDS,
  totalChallans,
  challansDeposited,
  deductees,
  challans,
  tan,
  period,
}: Form26QTabProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  const isFiled = status === "filed";
  const notices206ab = deductees.filter((d) => d.is_206ab_applicable).length;

  const stats = [
    { label: "Deductees", value: String(totalDeductees) },
    { label: "Total TDS", value: `₹${fmt(totalTDS)}` },
    { label: "Challans", value: String(totalChallans) },
    { label: "Deposited", value: `₹${fmt(challansDeposited)}`, highlight: true },
    ...(notices206ab > 0
      ? [{ label: "§206AB Notices", value: String(notices206ab), warning: true }]
      : []),
    { label: "Due Date", value: dueDate },
  ];

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-foreground">Form 26Q — Non-Salary TDS</h2>
            <TDSStatusBadge status={status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {isFiled
              ? `Filed on ${filedDate} · Receipt No. ${receiptNumber}`
              : `Due by ${dueDate} · ${totalDeductees} deductees · §194 series`}
          </p>
          {notices206ab > 0 && (
            <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              {notices206ab} deductee{notices206ab > 1 ? "s" : ""} flagged under §206AB — higher TDS rate
              applied
            </p>
          )}
        </div>
        {!isFiled && (
          <Button
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setWizardOpen(true)}
          >
            <FileText className="h-4 w-4" />
            File 26Q
          </Button>
        )}
        {isFiled && receiptNumber && (
          <Button size="sm" variant="outline" className="gap-2 shrink-0">
            <CalendarCheck className="h-4 w-4" />
            Download Receipt
          </Button>
        )}
      </div>

      <TDSSummaryBar stats={stats} />

      {/* Sub-tabs */}
      <Tabs defaultValue="deductees">
        <TabsList className="h-9 bg-muted/50">
          <TabsTrigger value="deductees" className="text-xs px-4">
            Deductees
          </TabsTrigger>
          <TabsTrigger value="challans" className="text-xs px-4">
            Challans
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs px-4">
            Payment Entries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deductees" className="mt-4">
          <DeducteeTable deductees={deductees} />
        </TabsContent>

        <TabsContent value="challans" className="mt-4">
          <ChallanTable challans={challans} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentTable26Q deductees={deductees} />
        </TabsContent>
      </Tabs>

      <FilingWizard26Q
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        tan={tan}
        period={period.replace("|", " ")}
        onComplete={() => {}}
      />
    </div>
  );
}
