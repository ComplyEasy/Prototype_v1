type HSNRow = {
  hsnCode: string;
  description: string;
  uqc: string;
  quantity: number;
  totalValue: number;
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

export function HSNSummaryTable({ rows }: { rows: HSNRow[] }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">HSN Code</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
              <th className="text-center px-3 py-2 font-semibold">UQC</th>
              <th className="text-right px-3 py-2 font-semibold">Qty</th>
              <th className="text-right px-4 py-2 font-semibold">Taxable Value</th>
              <th className="text-right px-3 py-2 font-semibold">Rate</th>
              <th className="text-right px-3 py-2 font-semibold">IGST</th>
              <th className="text-right px-3 py-2 font-semibold">CGST</th>
              <th className="text-right px-3 py-2 font-semibold">SGST</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-2 font-mono text-muted-foreground">{row.hsnCode}</td>
                <td className="px-4 py-2">{row.description}</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{row.uqc}</td>
                <td className="px-3 py-2 text-right">{row.quantity}</td>
                <td className="px-4 py-2 text-right font-medium">{fmt(row.taxableValue)}</td>
                <td className="px-3 py-2 text-right">{row.rate}%</td>
                <td className="px-3 py-2 text-right">{fmt(row.igst)}</td>
                <td className="px-3 py-2 text-right">{fmt(row.cgst)}</td>
                <td className="px-3 py-2 text-right">{fmt(row.sgst)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
