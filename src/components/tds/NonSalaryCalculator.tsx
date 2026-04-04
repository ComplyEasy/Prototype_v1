"use client";

import { useState } from "react";
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
import { TDSResultCard, type TDSResult } from "@/components/tds/TDSResultCard";
import { Calculator } from "lucide-react";

type SectionDef = {
  value: string;
  label: string;
  sectionCode: string;
  sectionName: string;
  rate: number;
};

const SECTIONS: SectionDef[] = [
  { value: "194A_bank", label: "194A — Bank / FD Interest", sectionCode: "194A", sectionName: "Bank / FD Interest", rate: 10 },
  { value: "194A_other", label: "194A — Other Interest", sectionCode: "194A", sectionName: "Other Interest Income", rate: 10 },
  { value: "194C_individual", label: "194C — Contractor (Individual/HUF)", sectionCode: "194C", sectionName: "Payment to Contractor (Individual/HUF)", rate: 1 },
  { value: "194C_company", label: "194C — Contractor (Company)", sectionCode: "194C", sectionName: "Payment to Contractor (Company)", rate: 2 },
  { value: "194D", label: "194D — Insurance Commission", sectionCode: "194D", sectionName: "Insurance Commission", rate: 5 },
  { value: "194H", label: "194H — Commission / Brokerage", sectionCode: "194H", sectionName: "Commission or Brokerage", rate: 5 },
  { value: "194IA", label: "194IA — Plant & Machinery Rent", sectionCode: "194IA", sectionName: "Rent — Plant & Machinery", rate: 2 },
  { value: "194IB", label: "194IB — Land / Building Rent", sectionCode: "194IB", sectionName: "Rent — Land / Building / Furniture", rate: 10 },
  { value: "194J_tech", label: "194J — Technical Services", sectionCode: "194J", sectionName: "Technical Services Fee", rate: 2 },
  { value: "194J_prof", label: "194J — Professional Services", sectionCode: "194J", sectionName: "Professional Services Fee", rate: 10 },
  { value: "194Q", label: "194Q — Purchase of Goods", sectionCode: "194Q", sectionName: "Purchase of Goods (>₹50L threshold)", rate: 0.1 },
];

function getDepositDue(paymentDate: string): string {
  if (!paymentDate) return "—";
  const d = new Date(paymentDate);
  if (isNaN(d.getTime())) return "—";
  const month = d.getMonth();
  const year = d.getFullYear();
  if (month === 2) {
    // March: deposit by 30 April
    return `${year}-04-30`;
  }
  const next = new Date(year, month + 1, 7);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-07`;
}

export function NonSalaryCalculator() {
  const [sectionValue, setSectionValue] = useState("");
  const [pan, setPan] = useState("");
  const [is206ab, setIs206ab] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [result, setResult] = useState<TDSResult | null>(null);

  const selectedSection = SECTIONS.find((s) => s.value === sectionValue);

  function calculate() {
    if (!selectedSection || !paymentAmount) return;
    const payment = parseFloat(paymentAmount.replace(/,/g, ""));
    if (isNaN(payment) || payment <= 0) return;

    let rate = selectedSection.rate;
    if (is206ab && rate < 20) {
      rate = 20;
    }
    const tds = Math.round(payment * rate) / 100;
    const depositDue = getDepositDue(paymentDate);

    setResult({
      section: selectedSection.sectionCode,
      sectionName: selectedSection.sectionName,
      rate,
      paymentAmount: payment,
      tdsAmount: tds,
      netPayable: payment - tds,
      depositDue,
      is206ab,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input panel */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ns-section">TDS Section</Label>
          <Select value={sectionValue} onValueChange={(v) => v && setSectionValue(v)}>
            <SelectTrigger id="ns-section" className="w-full">
              <SelectValue placeholder="Select section…" />
            </SelectTrigger>
            <SelectContent className="min-w-96">
              {SECTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSection && (
            <p className="text-xs text-muted-foreground">
              Standard rate: <span className="font-medium text-foreground">{selectedSection.rate}%</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ns-pan">Deductee PAN (optional)</Label>
          <Input
            id="ns-pan"
            placeholder="e.g. ABCDE1234F"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            className="font-mono uppercase"
            maxLength={10}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <input
            id="ns-206ab"
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={is206ab}
            onChange={(e) => setIs206ab(e.target.checked)}
          />
          <label htmlFor="ns-206ab" className="text-sm cursor-pointer flex-1">
            Apply §206AB / §206AA (higher rate — 20% or 2× normal, whichever is higher)
          </label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ns-amount">Payment Amount (₹)</Label>
          <Input
            id="ns-amount"
            placeholder="e.g. 500000"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            type="number"
            min={0}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ns-date">Payment Date</Label>
          <Input
            id="ns-date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        <Button
          onClick={calculate}
          disabled={!sectionValue || !paymentAmount}
          className="w-full gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculate TDS
        </Button>
      </div>

      {/* Result panel */}
      <div>
        {result ? (
          <TDSResultCard result={result} />
        ) : (
          <div className="h-full min-h-70 flex flex-col items-center justify-center rounded-lg border border-dashed text-center p-8">
            <Calculator className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Fill in the form and click <span className="font-medium text-foreground">Calculate TDS</span> to see the
              result.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
