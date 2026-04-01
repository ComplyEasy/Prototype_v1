"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  label: string;
  type: "gst" | "tds" | "roc";
  dueDate: string;
  status: "urgent" | "upcoming" | "overdue";
  daysLeft: number;
  action: string;
  actionHref: string;
}

interface DeadlineCardProps {
  deadline: Deadline;
}

const TYPE_COLORS: Record<string, string> = {
  gst: "bg-blue-100 text-blue-700 border-blue-200",
  tds: "bg-orange-100 text-orange-700 border-orange-200",
  roc: "bg-purple-100 text-purple-700 border-purple-200",
};

const TYPE_DOT: Record<string, string> = {
  gst: "bg-blue-500",
  tds: "bg-orange-500",
  roc: "bg-purple-500",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "overdue") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (status === "urgent") return <Clock className="h-4 w-4 text-yellow-500" />;
  return <CalendarClock className="h-4 w-4 text-muted-foreground" />;
}

function daysLabel(daysLeft: number, status: string): { text: string; className: string } {
  if (status === "overdue") return { text: `${Math.abs(daysLeft)}d overdue`, className: "text-destructive font-semibold" };
  if (daysLeft === 0) return { text: "Due today", className: "text-destructive font-semibold" };
  if (daysLeft <= 7) return { text: `${daysLeft}d left`, className: "text-yellow-600 font-semibold" };
  return { text: `${daysLeft} days left`, className: "text-muted-foreground" };
}

export default function DeadlineCard({ deadline }: DeadlineCardProps) {
  const { text, className } = daysLabel(deadline.daysLeft, deadline.status);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/40 ${
        deadline.status === "overdue" ? "border-destructive/30 bg-destructive/5" :
        deadline.status === "urgent" ? "border-yellow-300/60 bg-yellow-50/50" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon status={deadline.status} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{deadline.title}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TYPE_COLORS[deadline.type]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT[deadline.type]}`} />
              {deadline.type.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{deadline.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs ${className}`}>{text}</span>
        <Link
          href={deadline.actionHref}
          className={cn(
            buttonVariants({
              variant: deadline.status === "overdue" ? "destructive" : deadline.status === "urgent" ? "default" : "outline",
              size: "sm",
            }),
            "h-7 text-xs px-3"
          )}
        >
          {deadline.action}
        </Link>
      </div>
    </div>
  );
}
