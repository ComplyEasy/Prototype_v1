"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

type HistoryRow = {
  id: string;
  form: string;
  plain_label: string;
  financial_year: string;
  filed_on: string;
  srn: string;
  filed_by: string;
  mode: string;
  status: "Successful" | "Processing" | "Failed";
};

const STATUS_COLORS: Record<string, string> = {
  Successful: "bg-green-100 text-green-800 border-green-200",
  Processing: "bg-blue-100 text-blue-800 border-blue-200",
  Failed:     "bg-red-100 text-red-800 border-red-200",
};

const FORM_COLORS: Record<string, string> = {
  "MGT-7":    "bg-violet-50 text-violet-700 border-violet-200",
  "AOC-4":    "bg-indigo-50 text-indigo-700 border-indigo-200",
  "ADT-1":    "bg-sky-50 text-sky-700 border-sky-200",
  "DIR-3 KYC":"bg-teal-50 text-teal-700 border-teal-200",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type ROCFilingHistoryTableProps = {
  rows: HistoryRow[];
};

const FY_OPTIONS = ["All", "FY 2024-25", "FY 2023-24"];
const FORM_OPTIONS = ["All", "MGT-7", "AOC-4", "ADT-1", "DIR-3 KYC"];

export function ROCFilingHistoryTable({ rows }: ROCFilingHistoryTableProps) {
  const [fyFilter, setFyFilter] = useState("All");
  const [formFilter, setFormFilter] = useState("All");

  const filtered = rows.filter((r) => {
    const fyMatch = fyFilter === "All" || r.financial_year === fyFilter;
    const formMatch = formFilter === "All" || r.form === formFilter;
    return fyMatch && formMatch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={fyFilter} onValueChange={(v) => { if (v) setFyFilter(v); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FY_OPTIONS.map((fy) => (
              <SelectItem key={fy} value={fy}>
                {fy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={formFilter} onValueChange={(v) => { if (v) setFormFilter(v); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORM_OPTIONS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs">Form</TableHead>
              <TableHead className="font-semibold text-xs">Financial Year</TableHead>
              <TableHead className="font-semibold text-xs">Filed On</TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">SRN</TableHead>
              <TableHead className="font-semibold text-xs hidden lg:table-cell">Filed By</TableHead>
              <TableHead className="font-semibold text-xs hidden lg:table-cell">Mode</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8 text-sm"
                >
                  No filing history found for the selected filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs ${FORM_COLORS[row.form] ?? ""}`}
                  >
                    {row.form}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{row.plain_label}</p>
                </TableCell>
                <TableCell className="text-sm font-medium">{row.financial_year}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtDate(row.filed_on)}
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                  {row.srn}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {row.filed_by}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {row.mode}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_COLORS[row.status] ?? ""}`}
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {row.status === "Successful" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                      <Download className="h-3 w-3" />
                      Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
