"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type Challan = {
  id: string;
  challan_serial: string;
  bsr_code: string;
  paid_date: string;
  minor_head: string;
  tds_amount: number;
  surcharge: number;
  health_and_education_cess: number;
  interest: number;
  late_filing_fees: number;
  other_penalty: number;
};

type ChallanDrawerProps = {
  challan: Challan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const MINOR_HEAD_LABELS: Record<string, string> = {
  "200": "TDS / TCS Payable (200)",
  "400": "TDS on Regular Assessment (400)",
};

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-foreground" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}

export function ChallanDrawer({ challan, open, onOpenChange }: ChallanDrawerProps) {
  if (!challan) return null;

  const total =
    challan.tds_amount +
    challan.surcharge +
    challan.health_and_education_cess +
    challan.interest +
    challan.late_filing_fees +
    challan.other_penalty;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">Challan #{challan.challan_serial}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            BSR Code: <span className="font-mono">{challan.bsr_code}</span>
          </p>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {MINOR_HEAD_LABELS[challan.minor_head] ?? `Minor Head ${challan.minor_head}`}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <Row label="Paid Date" value={challan.paid_date} />
            <Row label="TDS Amount" value={`₹${fmt(challan.tds_amount)}`} />
            {challan.surcharge > 0 && (
              <Row label="Surcharge" value={`₹${fmt(challan.surcharge)}`} />
            )}
            {challan.health_and_education_cess > 0 && (
              <Row
                label="Health & Education Cess"
                value={`₹${fmt(challan.health_and_education_cess)}`}
              />
            )}
            {challan.interest > 0 && (
              <Row label="Interest (§201)" value={`₹${fmt(challan.interest)}`} />
            )}
            {challan.late_filing_fees > 0 && (
              <Row label="Late Filing Fee (§234E)" value={`₹${fmt(challan.late_filing_fees)}`} />
            )}
            {challan.other_penalty > 0 && (
              <Row label="Other Penalty" value={`₹${fmt(challan.other_penalty)}`} />
            )}
          </div>

          <Separator />

          <Row label="Total Deposited" value={`₹${fmt(total)}`} highlight />
        </div>
      </SheetContent>
    </Sheet>
  );
}
