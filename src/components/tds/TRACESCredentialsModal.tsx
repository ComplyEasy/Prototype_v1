"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";

type TRACESCredentialsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, password: string) => void;
  formType: "16" | "16A";
  period: string;
};

export function TRACESCredentialsModal({
  open,
  onOpenChange,
  onSubmit,
  formType,
  period,
}: TRACESCredentialsModalProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function handleSubmit() {
    if (!userId.trim() || !password) return;
    onSubmit(userId.trim(), password);
    setUserId("");
    setPassword("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <DialogTitle className="text-base">TRACES Login</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-1">
          Form {formType} · {period}
        </p>
        <p className="text-xs text-muted-foreground">
          Enter your TRACES portal credentials to authorise certificate generation. Your
          password is used only for this request and is not stored.
        </p>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="traces-user-id" className="text-sm">
              TRACES User ID
            </Label>
            <Input
              id="traces-user-id"
              placeholder="e.g. AHMA09719B"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="username"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="traces-password" className="text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="traces-password"
                type={showPwd ? "text" : "password"}
                placeholder="TRACES portal password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!userId.trim() || !password}
          >
            Authorise & Generate
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
