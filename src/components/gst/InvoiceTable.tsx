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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Pencil, Trash2 } from "lucide-react";

export type B2BInvoice = {
  id: string;
  receiverGstin: string;
  receiverName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: boolean;
  invoiceType: string;
  rate: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

type InvoiceTableProps = {
  invoices: B2BInvoice[];
  onAddClick: () => void;
  onEditClick: (invoice: B2BInvoice) => void;
};

export function InvoiceTable({ invoices, onAddClick, onEditClick }: InvoiceTableProps) {
  const [search, setSearch] = useState("");

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      inv.receiverGstin.toLowerCase().includes(search.toLowerCase())
  );

  const totalTax = invoices.reduce(
    (sum, inv) => sum + inv.igst + inv.cgst + inv.sgst + inv.cess,
    0
  );

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={onAddClick} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          Add Invoice
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Receiver</TableHead>
              <TableHead className="font-semibold">Invoice No.</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Value</TableHead>
              <TableHead className="font-semibold">Rate</TableHead>
              <TableHead className="font-semibold text-right">Taxable</TableHead>
              <TableHead className="font-semibold text-right">Tax</TableHead>
              <TableHead className="font-semibold text-right">Type</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => {
                const tax = inv.igst + inv.cgst + inv.sgst + inv.cess;
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{inv.receiverName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{inv.receiverGstin}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">{fmt(inv.invoiceValue)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{inv.rate}%</Badge>
                    </TableCell>
                    <TableCell className="text-right">{fmt(inv.taxableValue)}</TableCell>
                    <TableCell className="text-right font-medium text-green-700">{fmt(tax)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={inv.reverseCharge ? "border-amber-300 text-amber-700" : "text-muted-foreground"}
                      >
                        {inv.invoiceType === "Regular" ? "B2B" : inv.invoiceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditClick(inv)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} invoice{filtered.length !== 1 ? "s" : ""} · Total tax:{" "}
          <span className="font-semibold text-foreground">{fmt(totalTax)}</span>
        </p>
      )}
    </div>
  );
}
