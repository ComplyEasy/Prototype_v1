import { cn } from "@/lib/utils";

type StatItem = {
  label: string;
  value: string | number;
  highlight?: boolean;
  warning?: boolean;
};

type TDSSummaryBarProps = {
  stats: StatItem[];
  className?: string;
};

export function TDSSummaryBar({ stats, className }: TDSSummaryBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-2 px-4 py-3 bg-muted/40 rounded-lg border text-sm",
        className
      )}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-muted-foreground">{s.label}:</span>
          <span
            className={cn(
              "font-semibold",
              s.highlight && "text-primary",
              s.warning && "text-amber-600"
            )}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
