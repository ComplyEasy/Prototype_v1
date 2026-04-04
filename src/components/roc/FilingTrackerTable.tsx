"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROCStatusBadge, type ROCFilingStatus } from "@/components/roc/ROCStatusBadge";
import { ROCPeriodSelector } from "@/components/roc/ROCPeriodSelector";
import { FilingDetailDrawer, type ROCFiling } from "@/components/roc/FilingDetailDrawer";
import { AlertTriangle, Plus, UserCheck } from "lucide-react";

const STATUS_FILTERS: { label: string; value: ROCFilingStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Pending", value: "Pending" },
  { label: "Filed", value: "Filed" },
  { label: "Overdue", value: "Overdue" },
];

type FilingTrackerTableProps = {
  filings: ROCFiling[];
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function countdown(dueDate: string): { label: string; overdue: boolean } {
  const diff = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff > 0) return { label: `Due in ${diff}d`, overdue: false };
  if (diff === 0) return { label: "Due today", overdue: false };
  return { label: `${Math.abs(diff)}d overdue`, overdue: true };
}

export function FilingTrackerTable({ filings }: FilingTrackerTableProps) {
  const [selectedFY, setSelectedFY] = useState("FY 2025-26");
  const [statusFilter, setStatusFilter] = useState<ROCFilingStatus | "All">("All");
  const [drawerFiling, setDrawerFiling] = useState<ROCFiling | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = filings.filter((f) => {
    const fyMatch = f.financial_year === selectedFY || selectedFY === "All";
    const statusMatch = statusFilter === "All" || f.status === statusFilter;
    return fyMatch && statusMatch;
  });

  function openDrawer(filing: ROCFiling) {
    setDrawerFiling(filing);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ROCPeriodSelector value={selectedFY} onChange={setSelectedFY} />
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  statusFilter === f.value
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-background text-muted-foreground border-border hover:border-violet-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3 w-3" />
          Add Custom Reminder
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs">Form</TableHead>
              <TableHead className="font-semibold text-xs">Due Date</TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">Filed On</TableHead>
              <TableHead className="font-semibold text-xs hidden lg:table-cell">SRN</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                  No filings found for the selected filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((filing) => {
              const { label: ctLabel, overdue } = countdown(filing.due_date);
              return (
                <TableRow
                  key={filing.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => openDrawer(filing)}
                >
                  <TableCell>
                    <div className="space-y-0.5">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs bg-violet-50 text-violet-700 border-violet-200"
                      >
                        {filing.form}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{filing.plain_label}</p>
                      {filing.requires_ca && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-violet-600">
                          <UserCheck className="h-2.5 w-2.5" /> CA required
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{fmtDate(filing.due_date)}</p>
                    <p
                      className={`text-xs mt-0.5 ${
                        overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {overdue && <AlertTriangle className="inline h-3 w-3 mr-0.5" />}
                      {ctLabel}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {filing.filed_on ? fmtDate(filing.filed_on) : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                    {filing.srn ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ROCStatusBadge status={filing.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {filing.status === "Overdue" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-red-600 hover:bg-red-700 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(filing);
                        }}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Urgent
                      </Button>
                    )}
                    {(filing.status === "Pending" || filing.status === "Upcoming") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(filing);
                        }}
                      >
                        Send to CA
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <FilingDetailDrawer
        filing={drawerFiling}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
