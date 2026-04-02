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
  { id: 1, label: "Authenticate",     description: "Create taxpayer session (6-hour validity)" },
  { id: 2, label: "Save Data",        description: "Upload invoice data to GST portal" },
  { id: 3, label: "Validate Status",  description: "Check for errors after upload" },
  { id: 4, label: "Proceed to File",  description: "Initialize filing process" },
  { id: 5, label: "Get Summary",      description: "Retrieve sec_sum and checksum" },
  { id: 6, label: "Generate EVC OTP", description: "Send OTP to registered contact" },
  { id: 7, label: "File Return",      description: "Submit GSTR-1 to GST portal" },
  { id: 8, label: "Confirm Filing",   description: "Verify ACK and ARN" },
];

const MOCK_DELAYS = [1200, 1800, 1500, 1000, 1200, 0, 1000, 800];

type FilingWizardGSTR1Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pan: string;
  period: string;
  onComplete: () => void;
};

export function FilingWizardGSTR1({ open, onOpenChange, pan, period, onComplete }: FilingWizardGSTR1Props) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(STEPS.map(() => "pending"));
  const [authOtpOpen, setAuthOtpOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [filing, setFiling] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setCurrentStep(0);
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
    // Step 0: Authenticate — pause for session auth OTP
    setStepStatuses((prev) => { const n = [...prev]; n[0] = "active"; return n; });
    setCurrentStep(1);
    setAuthOtpOpen(true);
  }

  async function handleAuthOTPVerify() {
    setAuthOtpOpen(false);
    setStepStatuses((prev) => { const n = [...prev]; n[0] = "done"; return n; });
    // Continue steps 1-4, then pause at step 5 for EVC OTP
    for (let i = 1; i < STEPS.length; i++) {
      if (i === 5) {
        setStepStatuses((prev) => { const n = [...prev]; n[i] = "active"; return n; });
        setCurrentStep(i + 1);
        setOtpOpen(true);
        return;
      }
      setStepStatuses((prev) => { const n = [...prev]; n[i] = "active"; return n; });
      setCurrentStep(i + 1);
      await runStep(i);
      setStepStatuses((prev) => { const n = [...prev]; n[i] = "done"; return n; });
    }
    setDone(true);
    setFiling(false);
  }

  async function handleOTPVerify() {
    setOtpOpen(false);
    // Mark OTP step done and continue
    setStepStatuses((prev) => {
      const n = [...prev];
      n[5] = "done";
      return n;
    });
    // Continue steps 7-8
    for (let i = 6; i < STEPS.length; i++) {
      setStepStatuses((prev) => {
        const n = [...prev];
        n[i] = "active";
        return n;
      });
      setCurrentStep(i + 1);
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

  const SHORT_LABELS = ["Auth", "Save Data", "Validate", "Proceed", "Summary", "EVC OTP", "File", "Confirm"];

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

          {/* Heading */}
          <div className="pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 text-foreground" />
                <p className="text-base font-semibold">
                  {done
                    ? "Filed successfully!"
                    : filing && activeStep
                    ? activeStep.label
                    : "Submit your GSTR-1 return"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{period}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground pl-7">
              {done
                ? "GSTR-1 submitted. ARN will be available shortly."
                : filing && activeStep
                ? activeStep.description
                : "8 steps · Uploads invoices, validates, then signs with EVC OTP"}
            </p>
          </div>

          {/* Milestone stepper */}
          <div className="flex items-start py-6">
            {STEPS.flatMap((step, i) => {
              const status = stepStatuses[i];
              const result = [
                <div key={`step-${step.id}`} className="shrink-0 flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      status === "pending" && "border-muted-foreground/20 bg-background",
                      status === "active"  && "border-blue-500 bg-blue-500",
                      status === "done"    && "border-green-500 bg-green-500",
                      status === "error"   && "border-red-500 bg-red-500",
                    )}
                  >
                    {status === "pending" && (
                      <span className="text-[10px] font-bold text-muted-foreground/35">{i + 1}</span>
                    )}
                    {status === "active" && <Loader2 className="h-4 w-4 text-white animate-spin" />}
                    {status === "done"   && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-center text-[10px] leading-tight font-medium w-12",
                      status === "pending" && "text-muted-foreground/40",
                      status === "active"  && "text-blue-600",
                      status === "done"    && "text-green-600",
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
                      status === "done"   ? "bg-green-400" :
                      status === "active" ? "bg-blue-300"  : "bg-muted-foreground/15"
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
                onClick={() => { onComplete(); onOpenChange(false); reset(); }}
              >
                Done
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
                    "Start Filing"
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={filing}
                  className="w-full"
                  onClick={() => { reset(); onOpenChange(false); }}
                >
                  Cancel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EVCOTPModal
        open={authOtpOpen}
        onOpenChange={setAuthOtpOpen}
        pan={pan}
        title="GST Portal Authentication"
        description={
          <>
            An OTP has been sent to the mobile number registered with{" "}
            <span className="font-mono font-semibold text-foreground">gst.gov.in</span>{" "}
            for this GSTIN. Enter it to start the session.
          </>
        }
        buttonLabel="Verify & Continue"
        onVerify={handleAuthOTPVerify}
      />

      <EVCOTPModal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        pan={pan}
        onVerify={handleOTPVerify}
      />
    </>
  );
}
