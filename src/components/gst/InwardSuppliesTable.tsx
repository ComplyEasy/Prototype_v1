type InwardRow = { ty: string; txval: number; iamt: number; camt: number; samt: number; csamt: number };

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

const LABELS: Record<string, string> = {
  GST: "From registered suppliers (RCM)",
  NONGST: "From unregistered suppliers",
};

export function InwardSuppliesTable({ rows }: { rows: InwardRow[] }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left px-4 py-2 font-semibold">Supply Type</th>
            <th className="text-right px-3 py-2 font-semibold">Taxable Value</th>
            <th className="text-right px-3 py-2 font-semibold">IGST</th>
            <th className="text-right px-3 py-2 font-semibold">CGST</th>
            <th className="text-right px-3 py-2 font-semibold">SGST</th>
            <th className="text-right px-3 py-2 font-semibold">Cess</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.ty}>
              <td className="px-4 py-2 text-muted-foreground">{LABELS[row.ty] ?? row.ty}</td>
              <td className="px-3 py-2 text-right">{row.txval ? fmt(row.txval) : "—"}</td>
              <td className="px-3 py-2 text-right">{row.iamt ? fmt(row.iamt) : "—"}</td>
              <td className="px-3 py-2 text-right">{row.camt ? fmt(row.camt) : "—"}</td>
              <td className="px-3 py-2 text-right">{row.samt ? fmt(row.samt) : "—"}</td>
              <td className="px-3 py-2 text-right">{row.csamt ? fmt(row.csamt) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
