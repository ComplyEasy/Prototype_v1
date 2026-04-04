"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TDSStatusBadge, type TDSReturnStatus } from "@/components/tds/TDSStatusBadge";

export type TdsPeriod = {
  financial_year: string;
  quarter: string;
  label: string;
  form24q: { status: TDSReturnStatus };
  form26q: { status: TDSReturnStatus };
};

type TDSPeriodSelectorProps = {
  periods: TdsPeriod[];
  value: string; // "FY 2025-26|Q4"
  onChange: (value: string) => void;
};

export function TDSPeriodSelector({ periods, value, onChange }: TDSPeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">Financial Year / Quarter</SelectLabel>
          {periods.map((p) => {
            const key = `${p.financial_year}|${p.quarter}`;
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{p.label}</span>
                  <TDSStatusBadge status={p.form24q.status} />
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
