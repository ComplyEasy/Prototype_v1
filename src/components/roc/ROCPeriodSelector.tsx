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

const FINANCIAL_YEARS = ["FY 2025-26", "FY 2024-25", "FY 2023-24"];

type ROCPeriodSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ROCPeriodSelector({ value, onChange }: ROCPeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">Financial Year</SelectLabel>
          {FINANCIAL_YEARS.map((fy) => (
            <SelectItem key={fy} value={fy}>
              {fy}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
