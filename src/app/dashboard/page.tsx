import Navbar from "@/components/Navbar";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import ModuleCard from "@/components/ModuleCard";
import DeadlineCard from "@/components/DeadlineCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import company from "@/data/company.json";
import health from "@/data/health.json";
import deadlines from "@/data/deadlines.json";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const upcomingDeadlines = deadlines
  .filter((d) => {
    if (d.status === "overdue") return true;
    const due = new Date(d.dueDate).getTime();
    return due - Date.now() <= THIRTY_DAYS_MS;
  })
  .sort((a, b) => a.daysLeft - b.daysLeft);

type Status = "green" | "yellow" | "red";

export default function DashboardPage() {
  const { modules, overall } = health;

  const moduleList = [
    { ...modules.gst, type: "gst" as const, href: "/dashboard/gst" },
    { ...modules.tds, type: "tds" as const, href: "/dashboard/tds" },
    { ...modules.roc, type: "roc" as const, href: "/roc" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Greeting */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hey {company.profile.name} 👋
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {company.gstin.businessName} · GSTIN {company.gstin.number} · {company.gstin.state}
            </p>
          </div>
        </div>

        {/* ── Compliance Overview Card ── */}
        <Card className="overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Left: Health Score */}
            <div className="flex flex-col items-center justify-center gap-1 px-8 py-6 lg:w-64 lg:border-r shrink-0 bg-muted/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Compliance Health
              </p>
              <HealthScoreGauge
                overall={overall}
                modules={{
                  gst: { ...modules.gst, status: modules.gst.status as Status },
                  tds: { ...modules.tds, status: modules.tds.status as Status },
                  roc: { ...modules.roc, status: modules.roc.status as Status },
                }}
              />
            </div>

            {/* Right: Module rows */}
            <div className="flex-1 flex flex-col justify-center divide-y px-6 py-2">
              <div className="flex items-center gap-4 pb-2 px-1">
                <span className="w-16 shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Module</span>
                <span className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</span>
                <span className="w-12 shrink-0" />
                <span className="w-32 shrink-0 hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
                <span className="flex-1 hidden lg:block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next Action</span>
                <span className="w-16 shrink-0" />
              </div>
              {moduleList.map((mod) => (
                <ModuleCard
                  key={mod.type}
                  label={mod.label}
                  type={mod.type}
                  score={mod.score}
                  status={mod.status as Status}
                  summary={mod.summary}
                  nextAction={mod.nextAction}
                  nextDue={mod.nextDue}
                  href={mod.href}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* ── Upcoming Deadlines ── */}
        <Card>
          <CardHeader className="pb-0 pt-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Overdue items + next 30 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />GST</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" />TDS</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" />ROC</span>
              </div>
            </div>
          </CardHeader>
          <Separator className="mt-4" />
          <CardContent className="pt-3 pb-4 px-6 space-y-1.5">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No deadlines in the next 30 days 🎉</p>
            ) : (
              upcomingDeadlines.map((d) => (
                <DeadlineCard key={d.id} deadline={d as Parameters<typeof DeadlineCard>[0]["deadline"]} />
              ))
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

