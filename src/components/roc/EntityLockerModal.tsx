"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link2, QrCode, Download } from "lucide-react";

type EntityLockerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const STEPS = [
  {
    id: 1,
    title: "Generate Secure Link",
    description:
      "We'll generate a one-time consent link for your authorized representative to share company documents.",
  },
  {
    id: 2,
    title: "Authorize & Share",
    description:
      "Share the link with your authorized signatory. They log in to EntityLocker and grant consent to share the selected documents.",
  },
  {
    id: 3,
    title: "Documents Fetched",
    description:
      "Your verified company documents are now available. They will be securely stored for 60 minutes.",
  },
];

export function EntityLockerModal({ open, onOpenChange, onSuccess }: EntityLockerModalProps) {
  const [step, setStep] = useState(1);

  function handlePrimary() {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      onSuccess();
      onOpenChange(false);
      setStep(1);
    }
  }

  function handleClose() {
    onOpenChange(false);
    setStep(1);
  }

  const current = STEPS[step - 1];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4 text-violet-600" />
            Fetch via EntityLocker
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  s.id < step
                    ? "bg-violet-600 text-white"
                    : s.id === step
                    ? "bg-violet-100 text-violet-700 border-2 border-violet-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
              </div>
              {s.id < STEPS.length && (
                <div
                  className={`h-0.5 w-8 ${s.id < step ? "bg-violet-600" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-semibold">{current.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{current.description}</p>
          </div>

          {step === 1 && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-700">
              EntityLocker is India&apos;s government-certified digital locker for businesses. All
              documents are fetched directly from MCA/official sources with your consent.
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-3 font-mono text-xs break-all select-all">
                https://entitylocker.gov.in/consent/mock-session-a1b2c3d4e5
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <QrCode className="h-4 w-4 text-violet-500" />
                Or scan the QR code on MCA21 mobile app
              </div>
              <div className="h-28 w-28 mx-auto bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                [QR Code]
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              {["Certificate of Incorporation", "Memorandum of Association (MoA)", "Articles of Association (AoA)", "PAN Card"].map(
                (doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between rounded-lg border bg-green-50 border-green-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{doc}</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                      Fetched
                    </Badge>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handlePrimary}>
            {step === 1 ? "Generate Link" : step === 2 ? (
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> I&apos;ve Authorized — Fetch Now
              </span>
            ) : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
