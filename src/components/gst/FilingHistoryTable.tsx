import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReturnStatusBadge, type ReturnStatus } from "@/components/gst/ReturnStatusBadge";
import { Badge } from "@/components/ui/badge";

type HistoryRow = {
  returnType: "GSTR-1" | "GSTR-3B";
  period: string;
  filedDate: string | null;
  status: ReturnStatus;
  arn: string | null;
};

type FilingHistoryTableProps = {
  rows: HistoryRow[];
};

export function FilingHistoryTable({ rows }: FilingHistoryTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold">Return</TableHead>
            <TableHead className="font-semibold">Period</TableHead>
            <TableHead className="font-semibold">Filed On</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">ARN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    row.returnType === "GSTR-1"
                      ? "border-violet-300 text-violet-700 bg-violet-50"
                      : "border-sky-300 text-sky-700 bg-sky-50"
                  }
                >
                  {row.returnType}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{row.period}</TableCell>
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
                <ReturnStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="font-mono text-muted-foreground text-xs">
                {row.arn ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
