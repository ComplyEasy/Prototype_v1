import Navbar from "@/components/Navbar";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import ModuleCard from "@/components/ModuleCard";
import DeadlineCard from "@/components/DeadlineCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import company from "@/data/company.json";
import health from "@/data/health.json";
import deadlines from "@/data/deadlines.json";

// Only show the next 30 days for the dashboard panel
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const upcomingDeadlines = deadlines
  .filter((d) => {
    if (d.status === "overdue") return true;
    const due = new Date(d.dueDate).getTime();
    const now = Date.now();
    return due - now <= THIRTY_DAYS_MS;
  })
  .sort((a, b) => a.daysLeft - b.daysLeft);

export default function DashboardPage() {
  const { modules, overall } = health;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hey {company.profile.name}, here&apos;s where you stand today 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {company.gstin.businessName} &nbsp;·&nbsp; GSTIN {company.gstin.number} &nbsp;·&nbsp; {company.gstin.state}
          </p>
        </div>

        {/* Top section: Health Score + Module Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Health Score */}
          <Card className="lg:col-span-1 flex flex-col items-center justify-center py-6">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-base font-semibold">Compliance Health</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Across GST · TDS · ROC</p>
            </CardHeader>
            <CardContent>
              <HealthScoreGauge
                overall={overall}
                modules={{
                  gst: { ...modules.gst, status: modules.gst.status as "green" | "yellow" | "red" },
                  tds: { ...modules.tds, status: modules.tds.status as "green" | "yellow" | "red" },
                  roc: { ...modules.roc, status: modules.roc.status as "green" | "yellow" | "red" },
                }}
              />
            </CardContent>
          </Card>

          {/* Module Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ModuleCard
              label={modules.gst.label}
              type="gst"
              score={modules.gst.score}
              status={modules.gst.status as "green" | "yellow" | "red"}
              summary={modules.gst.summary}
              nextAction={modules.gst.nextAction}
              nextDue={modules.gst.nextDue}
              href="/gst"
            />
            <ModuleCard
              label={modules.tds.label}
              type="tds"
              score={modules.tds.score}
              status={modules.tds.status as "green" | "yellow" | "red"}
              summary={modules.tds.summary}
              nextAction={modules.tds.nextAction}
              nextDue={modules.tds.nextDue}
              href="/tds"
            />
            <ModuleCard
              label={modules.roc.label}
              type="roc"
              score={modules.roc.score}
              status={modules.roc.status as "green" | "yellow" | "red"}
              summary={modules.roc.summary}
              nextAction={modules.roc.nextAction}
              nextDue={modules.roc.nextDue}
              href="/roc"
            />
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overdue items + next 30 days
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> GST
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500" /> TDS
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> ROC
                </span>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-2">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No deadlines in the next 30 days 🎉
              </p>
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
