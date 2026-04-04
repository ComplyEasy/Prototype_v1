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
import { DeducteeDrawer, type Deductee } from "@/components/tds/DeducteeDrawer";
import { AlertTriangle, ChevronRight } from "lucide-react";

type DeducteeTableProps = {
  deductees: Deductee[];
};

export function DeducteeTable({ deductees }: DeducteeTableProps) {
  const [selected, setSelected] = useState<Deductee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(d: Deductee) {
    setSelected(d);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-32">PAN</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Payments</TableHead>
              <TableHead className="text-xs">PAN Status</TableHead>
              <TableHead className="text-xs">206AB</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductees.map((ded) => (
              <TableRow
                key={ded.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => openDrawer(ded)}
              >
                <TableCell className="font-mono text-xs">{ded.pan}</TableCell>
                <TableCell className="text-sm font-medium">{ded.name}</TableCell>
                <TableCell className="text-xs">{ded.payments.length}</TableCell>
                <TableCell>
                  <Badge
                    variant={ded.is_pan_operative ? "secondary" : "destructive"}
                    className="text-xs font-normal"
                  >
                    {ded.is_pan_operative ? "Operative" : "Inoperative"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ded.is_206ab_applicable ? (
                    <Badge className="text-xs gap-1 bg-amber-100 text-amber-800 border border-amber-300 font-normal">
                      <AlertTriangle className="h-3 w-3" />
                      Applicable
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeducteeDrawer
        deductee={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
