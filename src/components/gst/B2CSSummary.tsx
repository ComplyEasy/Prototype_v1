"use client";

type B2CSRow = {
  rate: number;
  placeOfSupply: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  cess: number;
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

const STATE_NAMES: Record<string, string> = {
  "27": "Maharashtra", "07": "Delhi", "19": "West Bengal",
  "29": "Karnataka", "33": "Tamil Nadu", "06": "Haryana",
};

export function B2CSSummary({ rows }: { rows: B2CSRow[] }) {
  const total = rows.reduce((s, r) => s + r.taxableValue, 0);
  const totalTax = rows.reduce((s, r) => s + r.cgst + r.sgst + r.cess, 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        B2C Small supplies are consolidated by rate—no individual invoices required.
      </p>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Place of Supply</th>
              <th className="text-left px-4 py-2 font-semibold">Rate</th>
              <th className="text-right px-4 py-2 font-semibold">Taxable Value</th>
              <th className="text-right px-4 py-2 font-semibold">CGST</th>
              <th className="text-right px-4 py-2 font-semibold">SGST</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-muted-foreground">
                  {row.placeOfSupply} – {STATE_NAMES[row.placeOfSupply] ?? "Other"}
                </td>
                <td className="px-4 py-2">{row.rate}%</td>
                <td className="px-4 py-2 text-right">{fmt(row.taxableValue)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.cgst)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.sgst)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-muted/20">
            <tr>
              <td colSpan={2} className="px-4 py-2 font-semibold">Total</td>
              <td className="px-4 py-2 text-right font-semibold">{fmt(total)}</td>
              <td colSpan={2} className="px-4 py-2 text-right font-semibold text-green-700">
                {fmt(totalTax)} (GST)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
