"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DirectorProfileDrawer, type Director } from "@/components/roc/DirectorProfileDrawer";
import { CheckCircle2, Clock, Plus, Users } from "lucide-react";

type DirectorSummaryBarProps = {
  total: number;
  kycFiled: number;
  kycPending: number;
  resigned: number;
};

function DirectorSummaryBar({ total, kycFiled, kycPending, resigned }: DirectorSummaryBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { label: "Total Directors", value: total, class: "bg-muted/40 border text-foreground" },
        { label: "KYC Filed", value: kycFiled, class: "bg-green-50 border-green-200 text-green-700" },
        { label: "KYC Pending", value: kycPending, class: kycPending > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-muted/40 border text-foreground" },
        { label: "Resigned This Year", value: resigned, class: "bg-muted/40 border text-foreground" },
      ].map((chip) => (
        <div
          key={chip.label}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${chip.class}`}
        >
          <span className="text-muted-foreground font-normal">{chip.label}:</span>
          <span className="font-semibold">{chip.value}</span>
        </div>
      ))}
    </div>
  );
}

const KYC_CONFIG = {
  Filed:   { label: "Filed",   className: "bg-green-100 text-green-800 border-green-200" },
  Pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
  Overdue: { label: "Overdue", className: "bg-red-100  text-red-800  border-red-200" },
};

type DirectorTableProps = {
  directors: Director[];
};

export function DirectorTable({ directors }: DirectorTableProps) {
  const [drawerDirector, setDrawerDirector] = useState<Director | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const kycFiled   = directors.filter((d) => d.dir3_kyc_status === "Filed").length;
  const kycPending = directors.filter((d) => d.dir3_kyc_status !== "Filed").length;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <DirectorSummaryBar
          total={directors.length}
          kycFiled={kycFiled}
          kycPending={kycPending}
          resigned={0}
        />
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5 h-8 text-xs"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-3 w-3" />
          Add Director
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs">Name</TableHead>
              <TableHead className="font-semibold text-xs">DIN</TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">Designation</TableHead>
              <TableHead className="font-semibold text-xs hidden lg:table-cell">Appointed</TableHead>
              <TableHead className="font-semibold text-xs">DIR-3 KYC</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {directors.map((d) => {
              const kyc = KYC_CONFIG[d.dir3_kyc_status];
              return (
                <TableRow
                  key={d.din}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => {
                    setDrawerDirector(d);
                    setDrawerOpen(true);
                  }}
                >
                  <TableCell className="font-medium text-sm">{d.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{d.din}</span>
                      {d.din_verified ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {d.designation}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {fmtDate(d.begin_date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${kyc.className}`}>
                      {kyc.label}
                    </Badge>
                    {d.dir3_kyc_last_filed && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Last: {fmtDate(d.dir3_kyc_last_filed)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.dir3_kyc_status !== "Filed" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-violet-600 hover:bg-violet-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerDirector(d);
                          setDrawerOpen(true);
                        }}
                      >
                        Initiate KYC
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DirectorProfileDrawer
        director={drawerDirector}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Add Director Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-600" />
              Add Director
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="e.g. Neha Kapoor" />
              </div>
              <div className="space-y-1.5">
                <Label>DIN</Label>
                <Input placeholder="e.g. 01234567" className="font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="managing_director">Managing Director</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="whole_time_director">Whole-time Director</SelectItem>
                  <SelectItem value="independent_director">Independent Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Appointment Date</Label>
              <Input type="date" />
            </div>
            <p className="text-xs text-muted-foreground">
              After saving, we will mock-fetch the director profile from MCA to verify the DIN.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={() => setAddDialogOpen(false)}
            >
              Save Director
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
