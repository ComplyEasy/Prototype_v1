"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobProgressTracker, type JobStatus } from "@/components/tds/JobProgressTracker";
import { TRACESCredentialsModal } from "@/components/tds/TRACESCredentialsModal";
import { Download, CheckCircle2, Lock, FileText } from "lucide-react";

type CertificateJobCardProps = {
  formType: "16" | "16A";
  title: string;
  subtitle: string;
  period: string;
  prerequisiteMet: boolean;
  prerequisiteLabel: string;
  existingRecord?: {
    generated_date: string;
    count: number;
  } | null;
};

const MOCK_DELAYS = [600, 1200, 1800, 800];

export function CertificateJobCard({
  formType,
  title,
  subtitle,
  period,
  prerequisiteMet,
  prerequisiteLabel,
  existingRecord,
}: CertificateJobCardProps) {
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [done, setDone] = useState(false);

  async function runJob() {
    const statuses: JobStatus[] = ["created", "queued", "in_progress", "succeeded"];
    for (let i = 0; i < statuses.length; i++) {
      setJobStatus(statuses[i]);
      await new Promise((r) => setTimeout(r, MOCK_DELAYS[i]));
    }
    setDone(true);
  }

  function handleCredentialsSubmit() {
    setCredModalOpen(false);
    runJob();
  }

  const isGenerating =
    jobStatus === "created" || jobStatus === "queued" || jobStatus === "in_progress";

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {period}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prerequisite check */}
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2
              className={
                prerequisiteMet
                  ? "h-4 w-4 text-green-600 shrink-0"
                  : "h-4 w-4 text-muted-foreground/40 shrink-0"
              }
            />
            <span className={prerequisiteMet ? "text-foreground" : "text-muted-foreground"}>
              {prerequisiteLabel}
            </span>
          </div>

          {/* Existing generated record */}
          {existingRecord && !done && (
            <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 flex items-center justify-between gap-3">
              <div className="text-xs">
                <p className="font-medium text-green-800">Previously generated</p>
                <p className="text-green-700 mt-0.5">
                  {existingRecord.count}{" "}
                  {formType === "16" ? "employee" : "deductee"} certificate
                  {existingRecord.count !== 1 ? "s" : ""} · {existingRecord.generated_date}
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0">
                <Download className="h-3.5 w-3.5" />
                Download ZIP
              </Button>
            </div>
          )}

          {/* Job progress */}
          {jobStatus !== "idle" && (
            <JobProgressTracker status={jobStatus} />
          )}

          {/* Download after generation */}
          {done && (
            <Button size="sm" className="gap-1.5 w-full" variant="outline">
              <Download className="h-3.5 w-3.5" />
              Download ZIP
            </Button>
          )}

          {/* Generate button */}
          {!done && (
            <Button
              size="sm"
              className="w-full gap-1.5"
              disabled={!prerequisiteMet || isGenerating}
              onClick={() => setCredModalOpen(true)}
            >
              <Lock className="h-3.5 w-3.5" />
              {existingRecord ? "Re-generate" : "Generate"} Form {formType}
            </Button>
          )}

          {!prerequisiteMet && (
            <p className="text-xs text-muted-foreground text-center">
              File and receive acknowledgement for the return before generating certificates.
            </p>
          )}
        </CardContent>
      </Card>

      <TRACESCredentialsModal
        open={credModalOpen}
        onOpenChange={setCredModalOpen}
        onSubmit={handleCredentialsSubmit}
        formType={formType}
        period={period}
      />
    </>
  );
}
