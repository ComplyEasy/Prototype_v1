import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, AlertTriangle } from "lucide-react";

type Charge = {
  charge_id: string;
  charge_amount: number;
  date_of_creation: string;
  status: "Active" | "Satisfied";
};

type ChargesPanelProps = {
  charges: Charge[];
};

function fmtInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ChargesPanel({ charges }: ChargesPanelProps) {
  const active = charges.filter((c) => c.status === "Active");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {active.length === 0 ? (
            <ShieldCheck className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          Charges on Company
        </CardTitle>
      </CardHeader>
      <CardContent>
        {charges.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            No active charges on this company — clear!
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Charge ID</TableHead>
                  <TableHead className="text-xs font-semibold">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Created</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.charge_id}>
                    <TableCell className="font-mono text-xs">{c.charge_id}</TableCell>
                    <TableCell className="text-sm font-medium">{fmtInr(c.charge_amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(c.date_of_creation)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          c.status === "Active"
                            ? "bg-red-50 text-red-700 border-red-200 text-xs"
                            : "bg-green-50 text-green-700 border-green-200 text-xs"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
