"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROCStatusBadge, type ROCFilingStatus } from "@/components/roc/ROCStatusBadge";
import {
  AlertTriangle,
  CheckSquare,
  Square,
  Info,
  UserCheck,
  ExternalLink,
  Download,
} from "lucide-react";

export type ROCFiling = {
  id: string;
  form: string;
  plain_label: string;
  description: string;
  section: string;
  financial_year: string;
  due_date: string;
  status: ROCFilingStatus;
  filed_on: string | null;
  srn: string | null;
  filed_by: string | null;
  requires_ca: boolean;
  late_fee_per_day: number;
  documents_required: string[];
};

type FilingDetailDrawerProps = {
  filing: ROCFiling | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function countdown(dueDate: string): { label: string; overdue: boolean } {
  const diff = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff > 0) return { label: `Due in ${diff} days`, overdue: false };
  if (diff === 0) return { label: "Due today", overdue: false };
  return { label: `${Math.abs(diff)} days overdue`, overdue: true };
}

export function FilingDetailDrawer({ filing, open, onOpenChange }: FilingDetailDrawerProps) {
  if (!filing) return null;

  const { label: countdownLabel, overdue } = countdown(filing.due_date);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-base">
                <span className="font-mono text-violet-700 mr-2">{filing.form}</span>
                {filing.plain_label}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{filing.section}</p>
            </div>
            <ROCStatusBadge status={filing.status} />
          </div>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          {/* Description */}
          <div className="flex gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-violet-500" />
            <p>{filing.description}</p>
          </div>

          {/* Due date + countdown */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
              <p className="font-semibold">{fmtDate(filing.due_date)}</p>
            </div>
            <Badge
              variant="outline"
              className={
                overdue
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }
            >
              {countdownLabel}
            </Badge>
          </div>

          {/* Late fee warning */}
          {filing.status === "Overdue" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                ₹{filing.late_fee_per_day.toLocaleString("en-IN")}/day late fee is accruing
                — act now to stop the penalty.
              </p>
            </div>
          )}

          {/* CA required notice */}
          {filing.requires_ca && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 text-xs text-violet-700 font-medium">
              <UserCheck className="h-3.5 w-3.5" />
              Requires CA Certification before filing
            </div>
          )}

          <Separator />

          {/* Filed details */}
          {filing.filed_on && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Filed On</p>
                  <p className="font-medium">{fmtDate(filing.filed_on)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Filed By</p>
                  <p className="font-medium">{filing.filed_by ?? "—"}</p>
                </div>
                {filing.srn && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">SRN (Acknowledgement)</p>
                    <p className="font-mono text-sm font-medium text-violet-700">{filing.srn}</p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Document checklist */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Documents Required
            </p>
            <ul className="space-y-2">
              {filing.documents_required.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {filing.status === "Filed" ? (
                    <CheckSquare className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Primary CTA */}
          <div className="flex flex-col gap-2">
            {filing.status === "Filed" && filing.srn && (
              <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
                <ExternalLink className="h-4 w-4" />
                View Receipt (SRN {filing.srn})
              </Button>
            )}
            {(filing.status === "Pending" || filing.status === "Upcoming") && (
              <>
                <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
                  Send to CA
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Document Checklist
                </Button>
              </>
            )}
            {filing.status === "Overdue" && (
              <Button className="w-full gap-2 bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4" />
                File Now — Urgent
              </Button>
            )}
            {filing.status === "CA Pending" && (
              <Button variant="outline" className="w-full gap-2">
                Track CA Request
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
