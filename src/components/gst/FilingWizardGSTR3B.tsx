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
  { id: 1,  label: "Authenticate",         description: "Create taxpayer session (6-hour validity)" },
  { id: 2,  label: "Get Existing Data",    description: "Fetch current GSTR-3B from portal" },
  { id: 3,  label: "Save Data",            description: "Upload summary data to GST portal" },
  { id: 4,  label: "Validate Status",      description: "Check for errors after save" },
  { id: 5,  label: "Get Ledger Balance",   description: "Fetch ITC and cash ledger balances" },
  { id: 6,  label: "Offset Liability",     description: "Allocate ITC and cash to tax heads" },
  { id: 7,  label: "Validate Offset",      description: "Confirm offset processing completed" },
  { id: 8,  label: "Get Updated Details",  description: "Fetch GSTR-3B with payment info (tx_pmt)" },
  { id: 9,  label: "Generate EVC OTP",     description: "Send OTP to registered contact" },
  { id: 10, label: "File Return",          description: "Submit GSTR-3B to GST portal" },
  { id: 11, label: "Confirm Filing",       description: "Verify ACK and ARN" },
];

const MOCK_DELAYS = [1200, 800, 1800, 1500, 800, 1000, 1200, 800, 0, 1200, 800];
const OTP_STEP = 8; // 0-indexed step 8 = "Generate EVC OTP"

type FilingWizardGSTR3BProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pan: string;
  period: string;
  onComplete: () => void;
};

export function FilingWizardGSTR3B({ open, onOpenChange, pan, period, onComplete }: FilingWizardGSTR3BProps) {
  const [currentStep, setCurrentStep] = useState(0);
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

  async function runStep(idx: number) {
    const delay = MOCK_DELAYS[idx];
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
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
    // Continue steps 1-7, then pause at EVC OTP step
    for (let i = 1; i < STEPS.length; i++) {
      if (i === OTP_STEP) {
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
    setStepStatuses((prev) => { const n = [...prev]; n[OTP_STEP] = "done"; return n; });
    for (let i = OTP_STEP + 1; i < STEPS.length; i++) {
      setStepStatuses((prev) => { const n = [...prev]; n[i] = "active"; return n; });
      setCurrentStep(i + 1);
      await runStep(i);
      setStepStatuses((prev) => { const n = [...prev]; n[i] = "done"; return n; });
    }
    setDone(true);
    setFiling(false);
  }

  const activeIdx = stepStatuses.findIndex((s) => s === "active");
  const activeStep = activeIdx >= 0 ? STEPS[activeIdx] : null;

  const SHORT_LABELS = ["Auth", "Fetch", "Save", "Validate", "Ledger", "Offset", "Verify", "Update", "OTP", "File", "Confirm"];

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
                    : "Submit your GSTR-3B return"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{period}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground pl-7">
              {done
                ? "GSTR-3B submitted. Tax liability cleared."
                : filing && activeStep
                ? activeStep.description
                : "11 steps · Saves data, offsets liability, then signs with EVC OTP"}
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
                      "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      status === "pending" && "border-muted-foreground/20 bg-background",
                      status === "active"  && "border-blue-500 bg-blue-500",
                      status === "done"    && "border-green-500 bg-green-500",
                      status === "error"   && "border-red-500 bg-red-500",
                    )}
                  >
                    {status === "pending" && (
                      <span className="text-[9px] font-bold text-muted-foreground/35">{i + 1}</span>
                    )}
                    {status === "active" && <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />}
                    {status === "done"   && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-center text-[9px] leading-tight font-medium w-10",
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
                      "flex-1 h-0.5 mt-3.5 transition-colors duration-500",
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
