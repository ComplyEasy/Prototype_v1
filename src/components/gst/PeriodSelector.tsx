"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReturnStatusBadge, type ReturnStatus } from "@/components/gst/ReturnStatusBadge";

export type GstPeriod = {
  year: number;
  month: number;
  label: string;
  gstr1: { status: ReturnStatus };
  gstr3b: { status: ReturnStatus };
};

type PeriodSelectorProps = {
  periods: GstPeriod[];
  value: string; // "YYYY-M"
  onChange: (value: string) => void;
};

export function PeriodSelector({ periods, value, onChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((p) => (
          <SelectItem key={`${p.year}-${p.month}`} value={`${p.year}-${p.month}`}>
            <div className="flex items-center gap-2">
              <span>{p.label}</span>
              <ReturnStatusBadge status={p.gstr1.status} />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
