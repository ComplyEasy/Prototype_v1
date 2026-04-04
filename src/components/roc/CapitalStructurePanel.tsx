import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Landmark } from "lucide-react";

type CapitalStructurePanelProps = {
  authorizedCapital: number;
  paidupCapital: number;
  sharesIssued: number;
  faceValuePerShare: number;
};

function fmtInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function CapitalStructurePanel({
  authorizedCapital,
  paidupCapital,
  sharesIssued,
  faceValuePerShare,
}: CapitalStructurePanelProps) {
  const utilization = Math.round((paidupCapital / authorizedCapital) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Landmark className="h-4 w-4 text-violet-600" />
          Capital Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Authorized Capital</p>
            <p className="font-semibold">{fmtInr(authorizedCapital)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Paid-up Capital</p>
            <p className="font-semibold text-violet-700">{fmtInr(paidupCapital)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Shares Issued</p>
            <p className="font-semibold">{fmtNum(sharesIssued)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Face Value</p>
            <p className="font-semibold">₹{faceValuePerShare} / share</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Capital utilization</span>
            <span className="font-medium text-foreground">{utilization}%</span>
          </div>
          <Progress value={utilization} className="h-2 [&>div]:bg-violet-500" />
          <p className="text-xs text-muted-foreground">
            {fmtInr(authorizedCapital - paidupCapital)} headroom remaining before needing SH-7
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
