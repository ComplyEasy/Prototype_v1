"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const STATUS_BG: Record<string, string> = {
  green: "bg-green-50 border-green-200",
  yellow: "bg-yellow-50 border-yellow-200",
  red: "bg-red-50 border-red-200",
};

const STATUS_SCORE: Record<string, string> = {
  green: "text-green-600",
  yellow: "text-yellow-600",
  red: "text-red-600",
};

const STATUS_PILL: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  green: "On Track",
  yellow: "Needs Attention",
  red: "Action Required",
};

const TYPE_ACCENT: Record<string, string> = {
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
    <Card className={`border ${STATUS_BG[status]} relative overflow-hidden`}>
      {/* top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${TYPE_ACCENT[type]}`} />

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className={`text-3xl font-bold tabular-nums mt-0.5 ${STATUS_SCORE[status]}`}>
              {score}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">/100</span>
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <p className="text-xs text-muted-foreground">{summary}</p>

        <div className="rounded-md bg-white/70 border px-3 py-2">
          <p className="text-xs text-muted-foreground">Next action</p>
          <p className="text-sm font-medium mt-0.5">{nextAction}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Due {formattedDate}</p>
        </div>

        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-between h-8 text-xs"
          )}
        >
          View {label} details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
