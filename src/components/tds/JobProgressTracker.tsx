"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";

export type JobStatus = "idle" | "created" | "queued" | "in_progress" | "succeeded" | "failed";

const steps: { status: JobStatus; label: string }[] = [
  { status: "created",     label: "Submitted" },
  { status: "queued",      label: "Queued" },
  { status: "in_progress", label: "Processing" },
  { status: "succeeded",   label: "Complete" },
];

const ORDER: Record<JobStatus, number> = {
  idle:        -1,
  created:      0,
  queued:       1,
  in_progress:  2,
  succeeded:    3,
  failed:       3,
};

type JobProgressTrackerProps = {
  status: JobStatus;
  label?: string;
  className?: string;
};

export function JobProgressTracker({ status, label, className }: JobProgressTrackerProps) {
  const currentOrder = ORDER[status];
  const isFailed = status === "failed";

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      )}
      <div className="flex items-center gap-1">
        {steps.map((step, idx) => {
          const stepOrder = ORDER[step.status];
          const isDone = !isFailed && currentOrder > stepOrder;
          const isActive = !isFailed && currentOrder === stepOrder;
          const isPending = isFailed ? false : currentOrder < stepOrder;

          return (
            <div key={step.status} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors",
                    isDone   && "bg-green-100 border-green-400",
                    isActive && "bg-blue-100 border-blue-400",
                    isPending && "bg-muted border-border",
                    isFailed && idx === 3 && "bg-red-100 border-red-400",
                    isFailed && idx < 3 && (currentOrder > stepOrder
                      ? "bg-green-100 border-green-400"
                      : "bg-muted border-border"
                    ),
                  )}
                >
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                  {isActive && <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />}
                  {isPending && <Clock className="h-3 w-3 text-muted-foreground" />}
                  {isFailed && idx === 3 && <XCircle className="h-3.5 w-3.5 text-red-600" />}
                  {isFailed && idx < 3 && (currentOrder > stepOrder
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    : <Clock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] whitespace-nowrap",
                    isDone    && "text-green-700",
                    isActive  && "text-blue-700 font-medium",
                    isPending && "text-muted-foreground",
                    isFailed && idx === 3 && "text-red-700 font-medium",
                  )}
                >
                  {isFailed && idx === 3 ? "Failed" : step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 mb-3.5 rounded transition-colors",
                    currentOrder > stepOrder ? "bg-green-400" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
