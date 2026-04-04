import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TDSStatusBadge, type TDSReturnStatus } from "@/components/tds/TDSStatusBadge";
import { Download, ArrowRight } from "lucide-react";

type HistoryRow = {
  form: "24Q" | "26Q" | "27Q";
  quarter: string;
  financial_year: string;
  filedDate: string | null;
  status: TDSReturnStatus;
  receiptNumber: string | null;
  onFileClick?: () => void;
};

const FORM_COLORS: Record<string, string> = {
  "24Q": "border-violet-300 text-violet-700 bg-violet-50",
  "26Q": "border-sky-300 text-sky-700 bg-sky-50",
  "27Q": "border-teal-300 text-teal-700 bg-teal-50",
};

type TDSFilingHistoryTableProps = {
  rows: HistoryRow[];
};

export function TDSFilingHistoryTable({ rows }: TDSFilingHistoryTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold">Form</TableHead>
            <TableHead className="font-semibold">Period</TableHead>
            <TableHead className="font-semibold">Filed On</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Receipt No.</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                <Badge
                  variant="outline"
                  className={FORM_COLORS[row.form] ?? ""}
                >
                  Form {row.form}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {row.quarter} {row.financial_year}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.filedDate
                  ? new Date(row.filedDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </TableCell>
              <TableCell>
                <TDSStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {row.receiptNumber ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                {row.status === "filed" && row.receiptNumber ? (
                  <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Receipt
                  </Button>
                ) : row.status !== "filed" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-7 text-xs text-primary"
                    onClick={row.onFileClick}
                  >
                    File
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
