type Totals = {
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function GSTR1Summary({ totals }: { totals: Totals }) {
  const totalTax = totals.igst + totals.cgst + totals.sgst + totals.cess;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="rounded-lg border bg-card px-4 py-3 col-span-2 sm:col-span-1">
        <p className="text-xs text-muted-foreground mb-0.5">Taxable Value</p>
        <p className="text-base font-semibold">{fmt(totals.taxableValue)}</p>
      </div>
      <div className="rounded-lg border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">IGST</p>
        <p className="text-base font-semibold">{fmt(totals.igst)}</p>
      </div>
      <div className="rounded-lg border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">CGST</p>
        <p className="text-base font-semibold">{fmt(totals.cgst)}</p>
      </div>
      <div className="rounded-lg border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">SGST</p>
        <p className="text-base font-semibold">{fmt(totals.sgst)}</p>
      </div>
      <div className="rounded-lg border bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">Total Tax</p>
        <p className="text-base font-bold">{fmt(totalTax)}</p>
      </div>
    </div>
  );
}
