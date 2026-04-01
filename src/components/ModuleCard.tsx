"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
  label: string;
  type: "gst" | "tds" | "roc";
  score: number;
  status: "green" | "yellow" | "red";
  summary: string;
  nextAction: string;
  nextDue: string;
  href: string;
}

const STATUS_SCORE: Record<string, string> = {
  green: "text-green-600",
  yellow: "text-yellow-600",
  red: "text-red-600",
};

const STATUS_PILL: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  green: "On Track",
  yellow: "Needs Attention",
  red: "Action Required",
};

const STATUS_BAR: Record<string, string> = {
  green: "[&>div]:bg-green-500",
  yellow: "[&>div]:bg-yellow-500",
  red: "[&>div]:bg-red-500",
};

const TYPE_DOT: Record<string, string> = {
  gst: "bg-blue-500",
  tds: "bg-orange-500",
  roc: "bg-purple-500",
};

export default function ModuleCard({
  label,
  type,
  score,
  status,
  summary,
  nextAction,
  nextDue,
  href,
}: ModuleCardProps) {
  const formattedDate = new Date(nextDue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-4 py-3.5 px-1">
      {/* Label + dot */}
      <div className="w-16 shrink-0 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${TYPE_DOT[type]}`} />
        <span className="text-sm font-semibold">{label}</span>
      </div>

      {/* Progress bar + score */}
      <div className="flex-1 min-w-0 space-y-1">
        <Progress value={score} className={cn("h-2", STATUS_BAR[status])} />
        <p className="text-xs text-muted-foreground truncate">{summary}</p>
      </div>

      {/* Score */}
      <div className="w-12 shrink-0 text-center">
        <span className={`text-xl font-bold tabular-nums ${STATUS_SCORE[status]}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground block -mt-0.5">/100</span>
      </div>

      {/* Status pill */}
      <div className="w-32 shrink-0 hidden sm:block">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Next action */}
      <div className="flex-1 min-w-0 hidden lg:block">
        <p className="text-sm font-medium truncate">{nextAction}</p>
        <p className="text-xs text-muted-foreground">Due {formattedDate}</p>
      </div>

      {/* CTA */}
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "shrink-0 h-7 text-xs gap-1"
        )}
      >
        View <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
