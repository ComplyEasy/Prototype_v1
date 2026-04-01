"use client";

import { RadialBarChart, RadialBar } from "recharts";

interface ModuleScore {
  score: number;
  label: string;
  status: "green" | "yellow" | "red";
}

interface HealthScoreGaugeProps {
  overall: number;
  modules: {
    gst: ModuleScore;
    tds: ModuleScore;
    roc: ModuleScore;
  };
}

const STATUS_COLORS = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

function getColor(score: number): string {
  if (score >= 70) return STATUS_COLORS.green;
  if (score >= 40) return STATUS_COLORS.yellow;
  return STATUS_COLORS.red;
}

function getLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Good Shape", color: "text-green-600" };
  if (score >= 40) return { text: "Needs Attention", color: "text-yellow-600" };
  return { text: "Urgent Action", color: "text-red-600" };
}

export default function HealthScoreGauge({ overall, modules }: HealthScoreGaugeProps) {
  const moduleList = [modules.roc, modules.gst, modules.tds];

  const chartData = [
    // Outermost ring: ROC
    { name: "ROC", value: modules.roc.score, fill: getColor(modules.roc.score) },
    // Middle ring: GST
    { name: "GST", value: modules.gst.score, fill: getColor(modules.gst.score) },
    // Inner ring: TDS
    { name: "TDS", value: modules.tds.score, fill: getColor(modules.tds.score) },
  ];

  const { text, color } = getLabel(overall);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Radial rings + center score */}
      <div className="relative h-[220px] w-[220px]">
        <RadialBarChart
          width={220}
          height={220}
          cx={110}
          cy={110}
          innerRadius="45%"
          outerRadius="90%"
          barSize={14}
          data={chartData}
          startAngle={225}
          endAngle={-45}
        >
          <RadialBar
            background={{ fill: "#f1f5f9" }}
            dataKey="value"
            cornerRadius={6}
            max={100}
          />
        </RadialBarChart>

        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: getColor(overall) }}
          >
            {overall}
          </span>
          <span className={`text-xs font-semibold mt-1 ${color}`}>{text}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Health Score</span>
        </div>
      </div>

      {/* Module legend */}
      <div className="flex items-center gap-6">
        {moduleList.map((mod) => (
          <div key={mod.label} className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getColor(mod.score) }}
              />
              <span className="text-xs font-medium text-muted-foreground">{mod.label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: getColor(mod.score) }}>
              {mod.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
