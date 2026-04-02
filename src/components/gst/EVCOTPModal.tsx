"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, RefreshCw } from "lucide-react";

type EVCOTPModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pan: string;
  onVerify: (otp: string) => void;
  title?: string;
  description?: React.ReactNode;
  buttonLabel?: string;
};

const OTP_LIFETIME = 10 * 60; // 10 minutes in seconds

export function EVCOTPModal({
  open,
  onOpenChange,
  pan,
  onVerify,
  title = "EVC Verification",
  description,
  buttonLabel = "Verify & File Return",
}: EVCOTPModalProps) {
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_LIFETIME);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // Defer state updates to avoid cascading renders
    const id = requestAnimationFrame(() => {
      setOtp("");
      setSecondsLeft(OTP_LIFETIME);
      setSent(true);
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open || !sent) return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, sent, secondsLeft]);

  function handleResend() {
    setSent(true);
    setSecondsLeft(OTP_LIFETIME);
    setOtp("");
  }

  function handleVerify() {
    if (otp.length === 6) onVerify(otp);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description ?? (
              <>
                An OTP has been sent to the registered mobile and email for PAN{" "}
                <span className="font-mono font-semibold text-foreground">{pan}</span>.
              </>
            )}
          </p>

          <div className="space-y-1.5">
            <Label>Enter 6-digit OTP</Label>
            <Input
              ref={inputRef}
              placeholder="• • • • • •"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-xl tracking-[0.4em] font-mono h-12"
              disabled={expired}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {expired ? (
                <span className="text-destructive font-medium">OTP expired</span>
              ) : (
                <>
                  Expires in{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {mm}:{ss}
                  </span>
                </>
              )}
            </span>
            <button
              onClick={handleResend}
              className="text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Resend OTP
            </button>
          </div>

          <Button
            className="w-full"
            disabled={otp.length !== 6 || expired}
            onClick={handleVerify}
          >
            {buttonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
