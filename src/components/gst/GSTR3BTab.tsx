"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReturnStatusBadge, type ReturnStatus } from "@/components/gst/ReturnStatusBadge";
import { OutwardSuppliesTable } from "@/components/gst/OutwardSuppliesTable";
import { ITCEligibilityTable } from "@/components/gst/ITCEligibilityTable";
import { InwardSuppliesTable } from "@/components/gst/InwardSuppliesTable";
import { CalendarDays, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import invoicesData from "@/data/invoices.json";
import gstData from "@/data/gst.json";

type GSTR3BTabProps = {
  status: ReturnStatus;
  dueDate: string;
  onFileClick: () => void;
};

function SectionAccordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="text-left">
          <p className="font-semibold text-sm">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      <div className={cn("border-t", !open && "hidden")}>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export function GSTR3BTab({ status, dueDate, onFileClick }: GSTR3BTabProps) {
  const { ledger } = gstData;
  const { gstr3b } = invoicesData;

  const isBlocked = status === "blocked";
  const isFiled = status === "filed";

  const totalITC = ledger.itc.igst + ledger.itc.cgst + ledger.itc.sgst;
  const totalCash = ledger.cash.igst + ledger.cash.cgst + ledger.cash.sgst;
  const totalLiability = ledger.liability.igst + ledger.liability.cgst + ledger.liability.sgst;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <ReturnStatusBadge status={status} />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Due{" "}
            <span className="font-medium text-foreground">
              {new Date(dueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </span>
        </div>
        <Button
          onClick={onFileClick}
          disabled={isBlocked || isFiled}
          className="gap-2 w-full sm:w-auto"
        >
          <FileText className="h-4 w-4" />
          {isFiled ? "Filed" : isBlocked ? "File GSTR-1 first" : "File GSTR-3B"}
        </Button>
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">GSTR-3B is locked.</span> You must file GSTR-1 for this period before filing GSTR-3B.
        </div>
      )}

      {/* Ledger summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-0.5">ITC Available</p>
          <p className="text-lg font-semibold text-green-700">{fmt(totalITC)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            IGST {fmt(ledger.itc.igst)} · CGST {fmt(ledger.itc.cgst)} · SGST {fmt(ledger.itc.sgst)}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-0.5">Cash Balance</p>
          <p className="text-lg font-semibold">{fmt(totalCash)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            IGST {fmt(ledger.cash.igst)} · CGST {fmt(ledger.cash.cgst)} · SGST {fmt(ledger.cash.sgst)}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-0.5">Tax Liability</p>
          <p className="text-lg font-semibold text-red-700">{fmt(totalLiability)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            IGST {fmt(ledger.liability.igst)} · CGST {fmt(ledger.liability.cgst)} · SGST {fmt(ledger.liability.sgst)}
          </p>
        </div>
      </div>

      {/* Sections */}
      <SectionAccordion
        title="3.1  Outward and Inward Supplies"
        subtitle="Summary of all supply categories"
        defaultOpen={true}
      >
        <OutwardSuppliesTable initialData={gstr3b.sup_details} />
      </SectionAccordion>

      <SectionAccordion
        title="4  ITC Eligibility"
        subtitle="Input Tax Credit available, reversed, and ineligible"
        defaultOpen={true}
      >
        <ITCEligibilityTable data={gstr3b.itc_elg} />
      </SectionAccordion>

      <SectionAccordion
        title="5  Inward Supplies (Reverse Charge)"
        subtitle="Supplies attracting reverse charge mechanism"
      >
        <InwardSuppliesTable rows={gstr3b.inward_sup.isup_details} />
      </SectionAccordion>

      <SectionAccordion
        title="5.1  Interest and Late Fee"
        subtitle="System computed — populated after filing"
      >
        <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Interest and late fee are computed by the GST portal after filing. No manual entry required.
        </div>
      </SectionAccordion>
    </div>
  );
}
