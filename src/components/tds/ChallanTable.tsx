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
import { ChallanDrawer, type Challan } from "@/components/tds/ChallanDrawer";
import { ChevronRight } from "lucide-react";

type ChallanTableProps = {
  challans: Challan[];
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const MINOR_HEAD_LABELS: Record<string, string> = {
  "200": "TDS Payable (200)",
  "400": "Regular Assessment (400)",
};

export function ChallanTable({ challans }: ChallanTableProps) {
  const [selected, setSelected] = useState<Challan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(ch: Challan) {
    setSelected(ch);
    setDrawerOpen(true);
  }

  const total = challans.reduce((sum, c) => sum + c.tds_amount, 0);

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">BSR Code</TableHead>
              <TableHead className="text-xs">Challan Serial</TableHead>
              <TableHead className="text-xs">Paid Date</TableHead>
              <TableHead className="text-xs">Minor Head</TableHead>
              <TableHead className="text-xs text-right">TDS Amount</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {challans.map((ch) => (
              <TableRow
                key={ch.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => openDrawer(ch)}
              >
                <TableCell className="font-mono text-xs">{ch.bsr_code}</TableCell>
                <TableCell className="font-mono text-xs">{ch.challan_serial}</TableCell>
                <TableCell className="text-xs">{ch.paid_date}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {MINOR_HEAD_LABELS[ch.minor_head] ?? ch.minor_head}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-right font-medium">
                  ₹{fmt(ch.tds_amount)}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30 border-t-2">
              <TableCell colSpan={4} className="text-xs font-semibold">
                Total Deposited
              </TableCell>
              <TableCell className="text-xs text-right font-bold">₹{fmt(total)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ChallanDrawer
        challan={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
