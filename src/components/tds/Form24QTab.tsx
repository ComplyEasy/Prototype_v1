"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TDSSummaryBar } from "@/components/tds/TDSSummaryBar";
import { TDSStatusBadge, type TDSReturnStatus } from "@/components/tds/TDSStatusBadge";
import { EmployeeTable } from "@/components/tds/EmployeeTable";
import { ChallanTable } from "@/components/tds/ChallanTable";
import { PaymentTable24Q } from "@/components/tds/PaymentTable24Q";
import { FilingWizard24Q } from "@/components/tds/FilingWizard24Q";
import type { Employee } from "@/components/tds/EmployeeDrawer";
import type { Challan } from "@/components/tds/ChallanDrawer";
import { FileText, CalendarCheck } from "lucide-react";
import { useState } from "react";

type Form24QTabProps = {
  status: TDSReturnStatus;
  dueDate: string;
  filedDate: string | null;
  receiptNumber: string | null;
  totalEmployees: number;
  totalTDS: number;
  totalChallans: number;
  challansDeposited: number;
  employees: Employee[];
  challans: Challan[];
  tan: string;
  period: string;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function Form24QTab({
  status,
  dueDate,
  filedDate,
  receiptNumber,
  totalEmployees,
  totalTDS,
  totalChallans,
  challansDeposited,
  employees,
  challans,
  tan,
  period,
}: Form24QTabProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  const isFiled = status === "filed";
  const quarter = period.split("|")[1] ?? "";

  const stats = [
    { label: "Employees", value: String(totalEmployees) },
    { label: "Total TDS", value: `₹${fmt(totalTDS)}` },
    { label: "Challans", value: String(totalChallans) },
    { label: "Deposited", value: `₹${fmt(challansDeposited)}`, highlight: true },
    { label: "Due Date", value: dueDate },
  ];

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-foreground">Form 24Q — Salary TDS</h2>
            <TDSStatusBadge status={status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {isFiled
              ? `Filed on ${filedDate} · Receipt No. ${receiptNumber}`
              : `Due by ${dueDate} · ${totalEmployees} employees · §192`}
          </p>
        </div>
        {!isFiled && (
          <Button
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setWizardOpen(true)}
          >
            <FileText className="h-4 w-4" />
            File 24Q
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
      <Tabs defaultValue="employees">
        <TabsList className="h-9 bg-muted/50">
          <TabsTrigger value="employees" className="text-xs px-4">
            Employees
          </TabsTrigger>
          <TabsTrigger value="challans" className="text-xs px-4">
            Challans
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs px-4">
            Payment Entries
          </TabsTrigger>
          {quarter === "Q4" && (
            <TabsTrigger value="salary-detail" className="text-xs px-4">
              Salary Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="employees" className="mt-4">
          <EmployeeTable employees={employees} />
        </TabsContent>

        <TabsContent value="challans" className="mt-4">
          <ChallanTable challans={challans} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentTable24Q employees={employees} challans={challans} />
        </TabsContent>

        {quarter === "Q4" && (
          <TabsContent value="salary-detail" className="mt-4">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Annex II / Part C salary details (total income, deductions, net taxable) are
                available in Q4 only. In a production build this pulls from payroll or the
                salary-details API.
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <FilingWizard24Q
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        tan={tan}
        period={period.replace("|", " ")}
        onComplete={() => {}}
      />
    </div>
  );
}
