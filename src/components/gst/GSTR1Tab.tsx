"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GSTR1Summary } from "@/components/gst/GSTR1Summary";
import { InvoiceTable, type B2BInvoice } from "@/components/gst/InvoiceTable";
import { InvoiceDrawer } from "@/components/gst/InvoiceDrawer";
import { B2CSSummary } from "@/components/gst/B2CSSummary";
import { HSNSummaryTable } from "@/components/gst/HSNSummaryTable";
import { ReturnStatusBadge, type ReturnStatus } from "@/components/gst/ReturnStatusBadge";
import { CalendarDays, FileText } from "lucide-react";
import invoicesData from "@/data/invoices.json";

type GSTR1TabProps = {
  status: ReturnStatus;
  dueDate: string;
  totals: {
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
  onFileClick: () => void;
};

export function GSTR1Tab({ status, dueDate, totals, onFileClick }: GSTR1TabProps) {
  const [b2bInvoices, setB2bInvoices] = useState<B2BInvoice[]>(invoicesData.b2b as B2BInvoice[]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<B2BInvoice | null>(null);

  function handleAddClick() {
    setEditingInvoice(null);
    setDrawerOpen(true);
  }

  function handleEditClick(invoice: B2BInvoice) {
    setEditingInvoice(invoice);
    setDrawerOpen(true);
  }

  function handleSave(data: Omit<B2BInvoice, "id"> & { id?: string }) {
    if (data.id) {
      setB2bInvoices((prev) => prev.map((inv) => (inv.id === data.id ? { ...inv, ...data } as B2BInvoice : inv)));
    } else {
      const newInvoice: B2BInvoice = {
        ...data,
        id: `inv_${Date.now()}`,
      };
      setB2bInvoices((prev) => [...prev, newInvoice]);
    }
  }

  const isBlocked = status === "blocked";
  const isFiled = status === "filed";

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
          {isFiled ? "Filed" : "File GSTR-1"}
        </Button>
      </div>

      {/* Summary */}
      <GSTR1Summary totals={totals} />

      {/* Sub-tabs */}
      <Tabs defaultValue="b2b">
        <TabsList variant="line" className="w-full justify-start gap-0 border-b rounded-none h-auto pb-0">
          {["b2b", "b2cl", "b2cs", "exports", "cdn", "hsn"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-none px-4 pb-2 uppercase text-xs tracking-wide">
              {tab === "cdn" ? "CDN" : tab.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="b2b" className="pt-4">
          <InvoiceTable
            invoices={b2bInvoices}
            onAddClick={handleAddClick}
            onEditClick={handleEditClick}
          />
        </TabsContent>

        <TabsContent value="b2cl" className="pt-4">
          <InvoiceTable
            invoices={(invoicesData.b2cl as unknown as B2BInvoice[]).map((inv) => ({
              ...inv,
              receiverGstin: "—",
              receiverName: "Unregistered",
              reverseCharge: false,
              invoiceType: "B2CL",
              cgst: 0,
              sgst: 0,
            }))}
            onAddClick={() => {}}
            onEditClick={() => {}}
          />
        </TabsContent>

        <TabsContent value="b2cs" className="pt-4">
          <B2CSSummary rows={invoicesData.b2cs} />
        </TabsContent>

        <TabsContent value="exports" className="pt-4">
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <FileText className="h-8 w-8 opacity-40" />
            <p className="text-sm">No export invoices for this period.</p>
          </div>
        </TabsContent>

        <TabsContent value="cdn" className="pt-4">
          <InvoiceTable
            invoices={(invoicesData.cdnr as unknown as B2BInvoice[]).map((inv: Record<string, unknown>) => ({
              id: inv.id as string,
              receiverGstin: inv.receiverGstin as string,
              receiverName: inv.receiverName as string,
              invoiceNumber: inv.noteNumber as string,
              invoiceDate: inv.noteDate as string,
              invoiceValue: inv.noteValue as number,
              placeOfSupply: inv.placeOfSupply as string,
              reverseCharge: false,
              invoiceType: `${inv.noteType} Note`,
              rate: inv.rate as number,
              taxableValue: inv.taxableValue as number,
              igst: inv.igst as number,
              cgst: inv.cgst as number,
              sgst: inv.sgst as number,
              cess: inv.cess as number,
            }))}
            onAddClick={() => {}}
            onEditClick={() => {}}
          />
        </TabsContent>

        <TabsContent value="hsn" className="pt-4">
          <HSNSummaryTable rows={invoicesData.hsn} />
        </TabsContent>
      </Tabs>

      <InvoiceDrawer
        key={editingInvoice?.id ?? "new"}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        invoice={editingInvoice}
        onSave={handleSave}
      />
    </div>
  );
}
