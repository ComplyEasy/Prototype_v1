"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PeriodSelector, type GstPeriod } from "@/components/gst/PeriodSelector";
import { ReturnStatusBadge } from "@/components/gst/ReturnStatusBadge";
import { GSTR1Tab } from "@/components/gst/GSTR1Tab";
import { GSTR3BTab } from "@/components/gst/GSTR3BTab";
import { FilingHistoryTable } from "@/components/gst/FilingHistoryTable";
import { FilingWizardGSTR1 } from "@/components/gst/FilingWizardGSTR1";
import { FilingWizardGSTR3B } from "@/components/gst/FilingWizardGSTR3B";
import gstData from "@/data/gst.json";
import company from "@/data/company.json";

type GstJsonPeriod = {
  year: number;
  month: number;
  label: string;
  gstr1: {
    status: string;
    dueDate: string;
    filedDate: string | null;
    arn: string | null;
    totals?: {
      taxableValue: number;
      igst: number;
      cgst: number;
      sgst: number;
      cess: number;
    };
  };
  gstr3b: {
    status: string;
    dueDate: string;
    filedDate: string | null;
    arn: string | null;
  };
};

const periods = (gstData.periods as GstJsonPeriod[]).map((p) => ({
  ...p,
  gstr1: { ...p.gstr1, status: p.gstr1.status as GstPeriod["gstr1"]["status"] },
  gstr3b: { ...p.gstr3b, status: p.gstr3b.status as GstPeriod["gstr3b"]["status"] },
})) as GstPeriod[];

const DEFAULT_PERIOD = `${periods[0].year}-${periods[0].month}`;

export default function GSTDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const [gstr1WizardOpen, setGstr1WizardOpen] = useState(false);
  const [gstr3bWizardOpen, setGstr3bWizardOpen] = useState(false);

  const period = useMemo(() => {
    const [y, m] = selectedPeriod.split("-").map(Number);
    return periods.find((p) => p.year === y && p.month === m) ?? periods[0];
  }, [selectedPeriod]);

  const historyRows = useMemo(() => {
    const rows: {
      returnType: "GSTR-1" | "GSTR-3B";
      period: string;
      filedDate: string | null;
      status: GstPeriod["gstr1"]["status"];
      arn: string | null;
    }[] = [];
    for (const p of [...periods].reverse()) {
      rows.push({
        returnType: "GSTR-1",
        period: p.label,
        filedDate: (p.gstr1 as GstJsonPeriod["gstr1"]).filedDate,
        status: p.gstr1.status,
        arn: (p.gstr1 as GstJsonPeriod["gstr1"]).arn,
      });
      rows.push({
        returnType: "GSTR-3B",
        period: p.label,
        filedDate: (p.gstr3b as GstJsonPeriod["gstr3b"]).filedDate,
        status: p.gstr3b.status,
        arn: (p.gstr3b as GstJsonPeriod["gstr3b"]).arn,
      });
    }
    return rows;
  }, []);

  const totals = (period.gstr1 as GstJsonPeriod["gstr1"]).totals ?? {
    taxableValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GST Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            GSTIN{" "}
            <span className="font-mono font-medium text-foreground">
              {company.gstin.number}
            </span>{" "}
            · {company.gstin.businessName}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <PeriodSelector
            periods={periods}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
      </div>

      {/* Period status summary */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">GSTR-1:</span>
          <ReturnStatusBadge status={period.gstr1.status} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">GSTR-3B:</span>
          <ReturnStatusBadge status={period.gstr3b.status} />
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="gstr1">
        <TabsList variant="line" className="w-full justify-start gap-0 border-b rounded-none h-auto pb-0 mb-4">
          <TabsTrigger value="gstr1" className="rounded-none px-5 pb-2.5 text-sm">
            GSTR-1
          </TabsTrigger>
          <TabsTrigger value="gstr3b" className="rounded-none px-5 pb-2.5 text-sm">
            GSTR-3B
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-none px-5 pb-2.5 text-sm">
            Filing History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gstr1">
          <GSTR1Tab
            status={period.gstr1.status}
            dueDate={(period.gstr1 as GstJsonPeriod["gstr1"]).dueDate}
            totals={totals}
            onFileClick={() => setGstr1WizardOpen(true)}
          />
        </TabsContent>

        <TabsContent value="gstr3b">
          <GSTR3BTab
            status={period.gstr3b.status}
            dueDate={(period.gstr3b as GstJsonPeriod["gstr3b"]).dueDate}
            onFileClick={() => setGstr3bWizardOpen(true)}
          />
        </TabsContent>

        <TabsContent value="history">
          <FilingHistoryTable rows={historyRows} />
        </TabsContent>
      </Tabs>

      {/* Filing wizards */}
      <FilingWizardGSTR1
        open={gstr1WizardOpen}
        onOpenChange={setGstr1WizardOpen}
        pan={company.pan}
        period={period.label}
        onComplete={() => {}}
      />
      <FilingWizardGSTR3B
        open={gstr3bWizardOpen}
        onOpenChange={setGstr3bWizardOpen}
        pan={company.pan}
        period={period.label}
        onComplete={() => {}}
      />
    </div>
  );
}
