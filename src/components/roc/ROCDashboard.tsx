"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROCSummaryBar } from "./ROCSummaryBar";
import { CompanyIdentityCard } from "./CompanyIdentityCard";
import { ComplianceHealthBar } from "./ComplianceHealthBar";
import { CapitalStructurePanel } from "./CapitalStructurePanel";
import { ChargesPanel } from "./ChargesPanel";
import { FilingTrackerTable } from "./FilingTrackerTable";
import { DirectorTable } from "./DirectorTable";
import { DocumentsTab } from "./DocumentsTab";
import { ROCFilingHistoryTable } from "./ROCFilingHistoryTable";
import type { ROCFiling } from "./FilingDetailDrawer";
import type { Director } from "./DirectorProfileDrawer";
import rocData from "@/data/roc.json";

const company = rocData.company as {
  cin: string;
  company_name: string;
  company_status: string;
  company_category: string;
  company_subcategory: string;
  class_of_company: string;
  roc_code: string;
  date_of_incorporation: string;
  date_of_last_agm: string;
  date_of_balance_sheet: string;
  active_compliance: string;
  authorized_capital: number;
  paidup_capital: number;
  shares_issued: number;
  face_value_per_share: number;
  registered_address: string;
  email: string;
  charges: { charge_id: string; charge_amount: number; charge_holder: string; date_of_creation: string; status: "Active" | "Satisfied" }[];
};

const directors = rocData.directors as Director[];
const filings = rocData.filings as ROCFiling[];

function deriveStats() {
  const today = new Date();
  const in30 = new Date();
  in30.setDate(today.getDate() + 30);

  const overdueForms = filings.filter((f) => f.status === "Overdue").length;
  const dueSoon = filings.filter((f) => {
    if (f.status === "Filed") return false;
    const due = new Date(f.due_date);
    return due >= today && due <= in30;
  }).length;
  const kycPending = directors.filter((d) => d.dir3_kyc_status !== "Filed").length;

  return { overdueForms, dueSoon, kycPending };
}

export function ROCDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const stats = deriveStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">ROC / MCA21</h1>
        <p className="text-sm text-muted-foreground font-mono">{company.cin}</p>
      </div>

      {/* Summary bar */}
      <ROCSummaryBar
        overdueForms={stats.overdueForms}
        dueSoon={stats.dueSoon}
        kycPending={stats.kycPending}
        companyStatus={company.company_status}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-10">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="filings" className="text-xs sm:text-sm">Filing Tracker</TabsTrigger>
          <TabsTrigger value="directors" className="text-xs sm:text-sm">Directors</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Filing History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <CompanyIdentityCard company={company} />
          <ComplianceHealthBar
            dateOfLastAgm={company.date_of_last_agm}
            dateOfBalanceSheet={company.date_of_balance_sheet}
            kycFiled={directors.filter((d) => d.dir3_kyc_status === "Filed").length}
            kycTotal={directors.length}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CapitalStructurePanel
              authorizedCapital={company.authorized_capital}
              paidupCapital={company.paidup_capital}
              sharesIssued={company.shares_issued}
              faceValuePerShare={company.face_value_per_share}
            />
            <ChargesPanel charges={company.charges} />
          </div>
        </TabsContent>

        {/* Filing Tracker Tab */}
        <TabsContent value="filings" className="mt-6">
          <FilingTrackerTable filings={filings} />
        </TabsContent>

        {/* Directors Tab */}
        <TabsContent value="directors" className="mt-6">
          <DirectorTable directors={directors} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <DocumentsTab
            documents={rocData.documents as Parameters<typeof DocumentsTab>[0]["documents"]}
            boardResolutionTemplates={rocData.boardResolutionTemplates as Parameters<typeof DocumentsTab>[0]["boardResolutionTemplates"]}
          />
        </TabsContent>

        {/* Filing History Tab */}
        <TabsContent value="history" className="mt-6">
          <ROCFilingHistoryTable rows={rocData.filingHistory as Parameters<typeof ROCFilingHistoryTable>[0]["rows"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
