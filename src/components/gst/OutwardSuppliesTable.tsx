"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type SupRow = {
  key: string;
  label: string;
  hasCGST: boolean;
};

const ROWS: SupRow[] = [
  { key: "osup_det",     label: "(a) Outward taxable supplies (other than zero-rated, nil & exempt)", hasCGST: true },
  { key: "osup_zero",    label: "(b) Outward taxable supplies (zero-rated)", hasCGST: false },
  { key: "osup_nil_exmp", label: "(c) Other outward supplies (nil-rated / exempt)", hasCGST: false },
  { key: "isup_rev",     label: "(d) Inward supplies (reverse charge)", hasCGST: true },
  { key: "osup_nongst",  label: "(e) Non-GST outward supplies", hasCGST: false },
];

type SupValues = Record<string, { txval: number; iamt: number; camt: number; samt: number; csamt: number }>;

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export function OutwardSuppliesTable({ initialData }: { initialData: SupValues }) {
  const [data, setData] = useState(initialData);

  function update(key: string, field: string, value: number) {
    setData((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-2 font-semibold min-w-80">Nature of Supplies</th>
              <th className="text-right px-3 py-2 font-semibold w-32">Taxable Value</th>
              <th className="text-right px-3 py-2 font-semibold w-28">IGST</th>
              <th className="text-right px-3 py-2 font-semibold w-28">CGST</th>
              <th className="text-right px-3 py-2 font-semibold w-28">SGST</th>
              <th className="text-right px-3 py-2 font-semibold w-24">Cess</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ROWS.map((row) => {
              const d = data[row.key] ?? { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
              return (
                <tr key={row.key}>
                  <td className="px-4 py-2 text-muted-foreground leading-snug">{row.label}</td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      className="text-right h-8 w-full"
                      value={d.txval || ""}
                      onChange={(e) => update(row.key, "txval", Number(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      className="text-right h-8 w-full"
                      value={d.iamt || ""}
                      onChange={(e) => update(row.key, "iamt", Number(e.target.value))}
                      disabled={row.key === "osup_nil_exmp" || row.key === "osup_nongst"}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      className="text-right h-8 w-full"
                      value={d.camt || ""}
                      onChange={(e) => update(row.key, "camt", Number(e.target.value))}
                      disabled={!row.hasCGST}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      className="text-right h-8 w-full"
                      value={d.samt || ""}
                      onChange={(e) => update(row.key, "samt", Number(e.target.value))}
                      disabled={!row.hasCGST}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      className="text-right h-8 w-full"
                      value={d.csamt || ""}
                      onChange={(e) => update(row.key, "csamt", Number(e.target.value))}
                      disabled={row.key === "osup_nil_exmp" || row.key === "osup_nongst"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t bg-muted/20">
            <tr>
              <td className="px-4 py-2 font-semibold">Total Outward Tax Liability</td>
              <td className="px-3 py-2 text-right font-semibold">
                {fmt(Object.values(data).reduce((s, d) => s + (d.txval ?? 0), 0))}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {fmt(Object.values(data).reduce((s, d) => s + (d.iamt ?? 0), 0))}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {fmt(Object.values(data).reduce((s, d) => s + (d.camt ?? 0), 0))}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {fmt(Object.values(data).reduce((s, d) => s + (d.samt ?? 0), 0))}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {fmt(Object.values(data).reduce((s, d) => s + (d.csamt ?? 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
