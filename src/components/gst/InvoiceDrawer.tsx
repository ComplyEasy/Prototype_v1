"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { B2BInvoice } from "@/components/gst/InvoiceTable";

const STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "36", name: "Telangana" },
];

const RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 9, 12, 18, 28];

type InvoiceDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: B2BInvoice | null;
  onSave: (invoice: Omit<B2BInvoice, "id"> & { id?: string }) => void;
};

export function InvoiceDrawer({ open, onOpenChange, invoice, onSave }: InvoiceDrawerProps) {
  const isEdit = !!invoice;

  // State is initialized from invoice prop; parent uses key={invoice?.id ?? "new"}
  // to re-mount this component when switching between add/edit.
  const [receiverGstin, setReceiverGstin] = useState(invoice?.receiverGstin ?? "");
  const [receiverName, setReceiverName] = useState(invoice?.receiverName ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoiceNumber ?? "");
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate ?? "");
  const [placeOfSupply, setPlaceOfSupply] = useState(invoice?.placeOfSupply ?? "");
  const [invoiceType, setInvoiceType] = useState(invoice?.invoiceType ?? "Regular");
  const [reverseCharge, setReverseCharge] = useState(invoice?.reverseCharge ?? false);
  const [rate, setRate] = useState<number>(invoice?.rate ?? 18);
  const [taxableValue, setTaxableValue] = useState<number>(invoice?.taxableValue ?? 0);

  // Derived tax fields
  const homeState = "27"; // Maharashtra
  const isInterState = placeOfSupply && placeOfSupply !== homeState;
  const igst = isInterState ? Math.round((taxableValue * rate) / 100) : 0;
  const cgst = !isInterState ? Math.round((taxableValue * rate) / 100 / 2) : 0;
  const sgst = cgst;
  const invoiceValue = taxableValue + igst + cgst + sgst;

  function handleSave() {
    onSave({
      id: invoice?.id,
      receiverGstin,
      receiverName,
      invoiceNumber,
      invoiceDate,
      invoiceValue,
      placeOfSupply,
      reverseCharge,
      invoiceType,
      rate,
      taxableValue,
      igst,
      cgst,
      sgst,
      cess: 0,
    });
    onOpenChange(false);
  }

  function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit B2B Invoice" : "Add B2B Invoice"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Row 1: Receiver */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Receiver GSTIN</Label>
              <Input
                placeholder="07AAGCM8702N1Z3"
                value={receiverGstin}
                onChange={(e) => setReceiverGstin(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Receiver Name</Label>
              <Input
                placeholder="Company name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Invoice number + date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Invoice Number</Label>
              <Input
                placeholder="INV-2025-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Place of supply + invoice type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Place of Supply</Label>
              <Select value={placeOfSupply} onValueChange={(v) => { if (v) setPlaceOfSupply(v); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code} – {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Type</Label>
              <Select value={invoiceType} onValueChange={(v) => { if (v) setInvoiceType(v); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="SEZ with payment">SEZ with payment</SelectItem>
                  <SelectItem value="SEZ without payment">SEZ without payment</SelectItem>
                  <SelectItem value="Deemed Export">Deemed Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Rate + taxable value + reverse charge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>GST Rate (%)</Label>
              <Select
                value={String(rate)}
                onValueChange={(v) => { if (v) setRate(Number(v)); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATES.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Taxable Value (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={taxableValue || ""}
                onChange={(e) => setTaxableValue(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Reverse charge */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rc"
              checked={reverseCharge}
              onChange={(e) => setReverseCharge(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="rc" className="cursor-pointer font-normal">
              Reverse Charge Applicable
            </Label>
          </div>

          {/* Tax preview */}
          {taxableValue > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm">
                <p className="col-span-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Tax Breakup
                </p>
                {isInterState ? (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">IGST ({rate}%)</p>
                      <p className="font-semibold">{fmt(igst)}</p>
                    </div>
                    <div /> {/* spacer */}
                  </>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">CGST ({rate / 2}%)</p>
                      <p className="font-semibold">{fmt(cgst)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">SGST ({rate / 2}%)</p>
                      <p className="font-semibold">{fmt(sgst)}</p>
                    </div>
                  </>
                )}
                <div className="space-y-0.5 text-right col-start-3">
                  <p className="text-xs text-muted-foreground">Invoice Value</p>
                  <p className="font-bold text-base">{fmt(invoiceValue)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleSave}>
            {isEdit ? "Update Invoice" : "Add Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
