"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EVCOTPModal } from "@/components/gst/EVCOTPModal";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, FileText } from "lucide-react";

type StepStatus = "pending" | "active" | "done" | "error";

type Step = {
  id: number;
  label: string;
  description: string;
};

const STEPS: Step[] = [
  { id: 1, label: "Deductor Review",   description: "Verify TAN, responsible person, and deductor details" },
  { id: 2, label: "Deductee Data",     description: "Validate payment & TDS entries for all deductees" },
  { id: 3, label: "Challan Matching",  description: "Match deductions against deposited challans" },
  { id: 4, label: "Generate TXT",      description: "Produce NSDL-compliant fixed-width TXT file" },
  { id: 5, label: "TRACES Auth",       description: "Authenticate with TRACES to obtain filing token" },
  { id: 6, label: "FVU Validation",    description: "Validate TXT with NSDL FVU — checks format & PAN" },
  { id: 7, label: "E-File",            description: "Submit Form 26Q to ITD e-filing portal" },
  { id: 8, label: "Receipt",           description: "Download provisional receipt & acknowledgement" },
];

const MOCK_DELAYS = [900, 1100, 1000, 1400, 0, 1800, 1200, 600];

const SHORT_LABELS = [
  "Deductor",
  "Deductees",
  "Challans",
  "TXT",
  "Auth",
  "FVU",
  "E-File",
  "Receipt",
];

type FilingWizard26QProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tan: string;
  period: string;
  onComplete: () => void;
};

export function FilingWizard26Q({
  open,
  onOpenChange,
  tan,
  period,
  onComplete,
}: FilingWizard26QProps) {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(STEPS.map(() => "pending"));
  const [otpOpen, setOtpOpen] = useState(false);
  const [filing, setFiling] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setStepStatuses(STEPS.map(() => "pending"));
    setFiling(false);
    setDone(false);
  }

  async function runStep(stepIdx: number) {
    const delay = MOCK_DELAYS[stepIdx];
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  async function startFiling() {
    setFiling(true);
    for (let i = 0; i < 4; i++) {
      setStepStatuses((prev) => {
        const n = [...prev];
        n[i] = "active";
        return n;
      });
      await runStep(i);
      setStepStatuses((prev) => {
        const n = [...prev];
        n[i] = "done";
        return n;
      });
    }
    // Step 4: TRACES Auth — pause for OTP
    setStepStatuses((prev) => {
      const n = [...prev];
      n[4] = "active";
      return n;
    });
    setOtpOpen(true);
  }

  async function handleOTPVerify() {
    setOtpOpen(false);
    setStepStatuses((prev) => {
      const n = [...prev];
      n[4] = "done";
      return n;
    });
    for (let i = 5; i < STEPS.length; i++) {
      setStepStatuses((prev) => {
        const n = [...prev];
        n[i] = "active";
        return n;
      });
      await runStep(i);
      setStepStatuses((prev) => {
        const n = [...prev];
        n[i] = "done";
        return n;
      });
    }
    setDone(true);
    setFiling(false);
  }

  const activeIdx = stepStatuses.findIndex((s) => s === "active");
  const activeStep = activeIdx >= 0 ? STEPS[activeIdx] : null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v && filing) return;
          if (!v) reset();
          onOpenChange(v);
        }}
      >
        <DialogContent className="sm:max-w-3xl p-8" showCloseButton={false}>
          <div className="pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 text-foreground" />
                <p className="text-base font-semibold">
                  {done
                    ? "Form 26Q filed successfully!"
                    : filing && activeStep
                    ? activeStep.label
                    : "Submit Form 26Q — Non-Salary TDS Return"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{period}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground pl-7">
              {done
                ? "Form 26Q submitted. Provisional receipt is available."
                : filing && activeStep
                ? activeStep.description
                : "8 steps · Validates data, generates TXT, verifies via FVU, then e-files"}
            </p>
          </div>

          {/* Milestone stepper */}
          <div className="flex items-start py-6">
            {STEPS.flatMap((step, i) => {
              const status = stepStatuses[i];
              const result = [
                <div
                  key={`step-${step.id}`}
                  className="shrink-0 flex flex-col items-center"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      status === "pending" && "border-muted-foreground/20 bg-background",
                      status === "active" && "border-blue-500 bg-blue-500",
                      status === "done" && "border-green-500 bg-green-500",
                      status === "error" && "border-red-500 bg-red-500"
                    )}
                  >
                    {status === "pending" && (
                      <span className="text-[10px] font-bold text-muted-foreground/35">
                        {i + 1}
                      </span>
                    )}
                    {status === "active" && (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    )}
                    {status === "done" && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-center text-[10px] leading-tight font-medium w-12",
                      status === "pending" && "text-muted-foreground/40",
                      status === "active" && "text-blue-600",
                      status === "done" && "text-green-600"
                    )}
                  >
                    {SHORT_LABELS[i]}
                  </span>
                </div>,
              ];
              if (i < STEPS.length - 1) {
                result.push(
                  <div
                    key={`line-${step.id}`}
                    className={cn(
                      "flex-1 h-0.5 mt-4 transition-colors duration-500",
                      status === "done"
                        ? "bg-green-400"
                        : status === "active"
                        ? "bg-blue-300"
                        : "bg-muted-foreground/15"
                    )}
                  />
                );
              }
              return result;
            })}
          </div>

          <DialogFooter className="-mx-8 -mb-8 flex-col sm:flex-col">
            {done ? (
              <Button
                className="w-full"
                onClick={() => {
                  onComplete();
                  onOpenChange(false);
                  reset();
                }}
              >
                Done — View Receipt
              </Button>
            ) : (
              <>
                <Button disabled={filing} onClick={startFiling} className="w-full">
                  {filing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    "Start Filing Form 26Q"
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={filing}
                  className="w-full"
                  onClick={() => {
                    reset();
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EVCOTPModal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        pan={tan}
        title="TRACES Portal Authentication"
        description={
          <>
            An OTP has been sent to the mobile/email registered for TAN{" "}
            <span className="font-mono font-semibold text-foreground">{tan}</span> on the
            TRACES portal. Enter it to authorise Form 26Q filing.
          </>
        }
        buttonLabel="Verify & Continue"
        onVerify={handleOTPVerify}
      />
    </>
  );
}
