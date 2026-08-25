import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getExecutiveAnalytics } from "@/server/services/analytics.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Users, Calendar, Award, Star } from "lucide-react";
import { AnalyticsCharts } from "./analytics-charts";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const periodDays = parseInt(searchParams.period || "30", 10);
  const analytics = await getExecutiveAnalytics(periodDays);

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Executive Analytics & Reporting"
        description="Comprehensive business metrics across Customer Retention, Table Reservations, and Loyalty."
        breadcrumbs={[{ label: "Reports" }]}
        actions={
          <a href="/api/reports/export?type=feedback" download>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Download className="h-3.5 w-3.5" /> Export Feedback CSV
            </Button>
          </a>
        }
      />

      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <span className="text-xs font-semibold text-muted-foreground">Reporting Period Window:</span>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Link href="/reports?period=7">
              <Button size="sm" variant={periodDays === 7 ? "default" : "ghost"} className="h-7 text-xs">
                7 Days
              </Button>
            </Link>
            <Link href="/reports?period=30">
              <Button size="sm" variant={periodDays === 30 ? "default" : "ghost"} className="h-7 text-xs">
                30 Days
              </Button>
            </Link>
            <Link href="/reports?period=90">
              <Button size="sm" variant={periodDays === 90 ? "default" : "ghost"} className="h-7 text-xs">
                90 Days
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Executive KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active Customer Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.kpi.activeCustomers}</div>
              <p className="text-[11px] text-muted-foreground mt-1">{analytics.kpi.newGuestsCount} new this period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Table Reservations ({periodDays}d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.kpi.totalReservations}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Booked table reservations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Average Rating Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                {analytics.kpi.averageRating} <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{analytics.kpi.resolvedFeedbackCount} low-ratings resolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Loyalty Points Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.kpi.totalPointsIssued.toLocaleString()} pts</div>
              <p className="text-[11px] text-muted-foreground mt-1">Circulating guest rewards</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Analytics Charts */}
        <AnalyticsCharts kpi={analytics.kpi} />
      </div>
    </AppShell>
  );
}
