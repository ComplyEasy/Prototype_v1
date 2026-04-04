"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TDSPeriodSelector, type TdsPeriod } from "@/components/tds/TDSPeriodSelector";
import { TDSStatusBadge, type TDSReturnStatus } from "@/components/tds/TDSStatusBadge";
import { TDSFilingHistoryTable } from "@/components/tds/TDSFilingHistoryTable";
import { TDSCalculatorTab } from "@/components/tds/TDSCalculatorTab";
import { Form24QTab } from "@/components/tds/Form24QTab";
import { Form26QTab } from "@/components/tds/Form26QTab";
import { CertificatesTab } from "@/components/tds/CertificatesTab";
import tdsData from "@/data/tds.json";
import type { Employee } from "@/components/tds/EmployeeDrawer";
import type { Challan } from "@/components/tds/ChallanDrawer";
import type { Deductee } from "@/components/tds/DeducteeDrawer";

type RawPeriod = {
  financial_year: string;
  quarter: string;
  label: string;
  form24q: {
    status: string;
    dueDate: string;
    filedDate: string | null;
    receiptNumber: string | null;
    totalEmployees: number;
    totalTDS: number;
    totalChallans: number;
    challansDeposited: number;
  };
  form26q: {
    status: string;
    dueDate: string;
    filedDate: string | null;
    receiptNumber: string | null;
    totalDeductees: number;
    totalTDS: number;
    totalChallans: number;
    challansDeposited: number;
  };
};

const rawPeriods = tdsData.periods as RawPeriod[];

const periods: TdsPeriod[] = rawPeriods.map((p) => ({
  financial_year: p.financial_year,
  quarter: p.quarter,
  label: p.label,
  form24q: {
    ...p.form24q,
    status: p.form24q.status as TdsPeriod["form24q"]["status"],
  },
  form26q: {
    ...p.form26q,
    status: p.form26q.status as TdsPeriod["form26q"]["status"],
  },
}));

const DEFAULT_PERIOD = `${periods[0].financial_year}|${periods[0].quarter}`;

export default function TDSDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);

  const period = useMemo(() => {
    const [fy, q] = selectedPeriod.split("|");
    return (
      rawPeriods.find((p) => p.financial_year === fy && p.quarter === q) ?? rawPeriods[0]
    );
  }, [selectedPeriod]);

  const employees = tdsData.employees as Employee[];
  const challans24Q = tdsData.challans24Q as Challan[];
  const challans26Q = tdsData.challans26Q as Challan[];
  const deductees = tdsData.deductees as Deductee[];

  const historyRows = useMemo(() => {
    const rows: React.ComponentProps<typeof TDSFilingHistoryTable>["rows"] = [];
    for (const p of [...rawPeriods].reverse()) {
      rows.push({
        form: "24Q",
        quarter: p.quarter,
        financial_year: p.financial_year,
        filedDate: p.form24q.filedDate,
        status: p.form24q.status as TdsPeriod["form24q"]["status"],
        receiptNumber: p.form24q.receiptNumber,
      });
      rows.push({
        form: "26Q",
        quarter: p.quarter,
        financial_year: p.financial_year,
        filedDate: p.form26q.filedDate,
        status: p.form26q.status as TdsPeriod["form26q"]["status"],
        receiptNumber: p.form26q.receiptNumber,
      });
    }
    return rows;
  }, []);

  const form24qFiled = (period.form24q.status as string) === "filed";
  const form26qFiled = (period.form26q.status as string) === "filed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">TDS Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            TAN{" "}
            <span className="font-mono font-medium text-foreground">
              {tdsData.deductor.tan}
            </span>{" "}
            · {tdsData.deductor.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Responsible Person:{" "}
            <span className="text-foreground">{tdsData.deductor.responsible_person.name}</span>
            {" "}({tdsData.deductor.responsible_person.designation})
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <TDSPeriodSelector
            periods={periods}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
      </div>

      {/* Period status summary */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Form 24Q:</span>
          <TDSStatusBadge status={period.form24q.status as TDSReturnStatus} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Form 26Q:</span>
          <TDSStatusBadge status={period.form26q.status as TDSReturnStatus} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{period.label}</span>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="form24q">
        <TabsList
          variant="line"
          className="w-full justify-start gap-0 border-b rounded-none h-auto pb-0 mb-4"
        >
          <TabsTrigger value="calculator" className="rounded-none px-5 pb-2.5 text-sm">
            Calculator
          </TabsTrigger>
          <TabsTrigger value="form24q" className="rounded-none px-5 pb-2.5 text-sm">
            Form 24Q
          </TabsTrigger>
          <TabsTrigger value="form26q" className="rounded-none px-5 pb-2.5 text-sm">
            Form 26Q
          </TabsTrigger>
          <TabsTrigger value="certificates" className="rounded-none px-5 pb-2.5 text-sm">
            Certificates
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-none px-5 pb-2.5 text-sm">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <TDSCalculatorTab />
        </TabsContent>

        <TabsContent value="form24q">
          <Form24QTab
            status={period.form24q.status as TDSReturnStatus}
            dueDate={period.form24q.dueDate}
            filedDate={period.form24q.filedDate}
            receiptNumber={period.form24q.receiptNumber}
            totalEmployees={period.form24q.totalEmployees}
            totalTDS={period.form24q.totalTDS}
            totalChallans={period.form24q.totalChallans}
            challansDeposited={period.form24q.challansDeposited}
            employees={employees}
            challans={challans24Q}
            tan={tdsData.deductor.tan}
            period={selectedPeriod}
          />
        </TabsContent>

        <TabsContent value="form26q">
          <Form26QTab
            status={period.form26q.status as TDSReturnStatus}
            dueDate={period.form26q.dueDate}
            filedDate={period.form26q.filedDate}
            receiptNumber={period.form26q.receiptNumber}
            totalDeductees={period.form26q.totalDeductees}
            totalTDS={period.form26q.totalTDS}
            totalChallans={period.form26q.totalChallans}
            challansDeposited={period.form26q.challansDeposited}
            deductees={deductees}
            challans={challans26Q}
            tan={tdsData.deductor.tan}
            period={selectedPeriod}
          />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificatesTab
            form24qFiled={form24qFiled}
            form26qFiled={form26qFiled}
            selectedPeriod={selectedPeriod}
          />
        </TabsContent>

        <TabsContent value="history">
          <TDSFilingHistoryTable rows={historyRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
