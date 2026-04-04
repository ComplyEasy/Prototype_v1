"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, ExternalLink, Building2, User } from "lucide-react";

type Directorship = {
  company_name: string;
  cin_llpin: string;
  designation: string;
  begin_date: string;
  end_date: string | null;
};

export type Director = {
  din: string;
  name: string;
  pan: string;
  designation: string;
  begin_date: string;
  din_verified: boolean;
  dir3_kyc_status: "Filed" | "Pending" | "Overdue";
  dir3_kyc_last_filed: string | null;
  dir3_kyc_next_due: string;
  other_directorships: Directorship[];
};

type DirectorProfileDrawerProps = {
  director: Director | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const KYC_CONFIG = {
  Filed:   { label: "Filed",   className: "bg-green-100 text-green-800 border-green-200" },
  Pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
  Overdue: { label: "Overdue", className: "bg-red-100  text-red-800  border-red-200" },
};

export function DirectorProfileDrawer({
  director,
  open,
  onOpenChange,
}: DirectorProfileDrawerProps) {
  if (!director) return null;

  const kyc = KYC_CONFIG[director.dir3_kyc_status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-violet-600" />
            {director.name}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            DIN:{" "}
            <span className="font-mono font-medium text-foreground">{director.din}</span>
            {director.din_verified ? (
              <span className="ml-2 inline-flex items-center gap-0.5 text-green-600 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-0.5 text-gray-500 text-[10px]">
                <Clock className="h-3 w-3" /> Unverified
              </span>
            )}
          </p>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          {/* Profile grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Designation</p>
              <p className="font-medium">{director.designation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">PAN</p>
              <p className="font-mono font-medium">{director.pan}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Appointed</p>
              <p className="font-medium">{fmtDate(director.begin_date)}</p>
            </div>
          </div>

          <Separator />

          {/* DIR-3 KYC section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              DIR-3 KYC Status
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current status</span>
              <Badge variant="outline" className={kyc.className}>
                {kyc.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Last filed</span>
              <span className="font-medium">
                {director.dir3_kyc_last_filed ? fmtDate(director.dir3_kyc_last_filed) : "Never"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Next due</span>
              <span className="font-medium">{fmtDate(director.dir3_kyc_next_due)}</span>
            </div>
          </div>

          {director.dir3_kyc_status !== "Filed" && (
            <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
              <CheckCircle2 className="h-4 w-4" />
              Initiate DIR-3 KYC Filing
            </Button>
          )}

          <Separator />

          {/* Other directorships */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Other Directorships
            </p>
            {director.other_directorships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other directorships found.</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-semibold">Company / LLP</TableHead>
                      <TableHead className="text-xs font-semibold">Designation</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {director.other_directorships.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs font-medium leading-tight">{d.company_name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {d.cin_llpin}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{d.designation}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              d.end_date === null
                                ? "text-[10px] bg-green-50 text-green-700 border-green-200"
                                : "text-[10px] bg-gray-50 text-gray-500 border-gray-200"
                            }
                          >
                            {d.end_date === null ? "Active" : "Resigned"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Fetch Live Data from MCA (DIN Lookup)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
