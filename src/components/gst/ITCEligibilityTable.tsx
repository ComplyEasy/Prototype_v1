type ITCRow = { ty: string; iamt: number; camt: number; samt: number; csamt: number };

const ITC_TYPE_LABELS: Record<string, string> = {
  IMPG: "Import of goods",
  IMPS: "Import of services",
  ISRC: "Inward supplies from ISD",
  ISD: "ISD",
  OTH: "All other ITC",
  RUL42: "As per Rule 42 & 43",
  RUL43: "As per Rule 43(1)",
  "RUL17-5": "Section 17(5) – Blocked credits",
};

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

function TaxRow({ label, row }: { label: string; row: ITCRow }) {
  return (
    <tr>
      <td className="px-4 py-2 text-muted-foreground text-sm">{label}</td>
      <td className="px-3 py-2 text-right">{row.iamt ? fmt(row.iamt) : "—"}</td>
      <td className="px-3 py-2 text-right">{row.camt ? fmt(row.camt) : "—"}</td>
      <td className="px-3 py-2 text-right">{row.samt ? fmt(row.samt) : "—"}</td>
      <td className="px-3 py-2 text-right">{row.csamt ? fmt(row.csamt) : "—"}</td>
    </tr>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr className="bg-muted/40">
      <td colSpan={5} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </td>
    </tr>
  );
}

type ITCData = {
  itc_avl: ITCRow[];
  itc_rev: ITCRow[];
  itc_net: { iamt: number; camt: number; samt: number; csamt: number };
  itc_inelg: ITCRow[];
};

export function ITCEligibilityTable({ data }: { data: ITCData }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">ITC Details</th>
              <th className="text-right px-3 py-2 font-semibold w-28">IGST</th>
              <th className="text-right px-3 py-2 font-semibold w-28">CGST</th>
              <th className="text-right px-3 py-2 font-semibold w-28">SGST</th>
              <th className="text-right px-3 py-2 font-semibold w-24">Cess</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <SectionHeader label="4A — ITC Available" />
            {data.itc_avl.map((row) => (
              <TaxRow key={row.ty} label={ITC_TYPE_LABELS[row.ty] ?? row.ty} row={row} />
            ))}

            <SectionHeader label="4B — ITC Reversed" />
            {data.itc_rev.map((row) => (
              <TaxRow key={row.ty} label={ITC_TYPE_LABELS[row.ty] ?? row.ty} row={row} />
            ))}

            <tr className="bg-green-50 border-t-2 border-green-200">
              <td className="px-4 py-2 font-semibold text-green-800">4C — Net ITC Available (4A − 4B)</td>
              <td className="px-3 py-2 text-right font-semibold text-green-800">
                {data.itc_net.iamt ? fmt(data.itc_net.iamt) : "—"}
              </td>
              <td className="px-3 py-2 text-right font-semibold text-green-800">
                {data.itc_net.camt ? fmt(data.itc_net.camt) : "—"}
              </td>
              <td className="px-3 py-2 text-right font-semibold text-green-800">
                {data.itc_net.samt ? fmt(data.itc_net.samt) : "—"}
              </td>
              <td className="px-3 py-2 text-right font-semibold text-green-800">
                {data.itc_net.csamt ? fmt(data.itc_net.csamt) : "—"}
              </td>
            </tr>

            <SectionHeader label="4D — Ineligible ITC (Sec 17(5))" />
            {data.itc_inelg.map((row) => (
              <TaxRow key={row.ty} label={ITC_TYPE_LABELS[row.ty] ?? row.ty} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
