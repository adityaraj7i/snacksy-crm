import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReservations, getReservationReportMetrics } from "@/server/services/reservation.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin, CheckCircle2, UserX, AlertTriangle } from "lucide-react";
import { ReservationsClient } from "./reservations-client";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string; status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const todayStr = new Date().toISOString().split("T")[0];
  const activeDate = searchParams.date || todayStr;

  const [reservationsData, metrics] = await Promise.all([
    getReservations({
      date: searchParams.view === "today" ? todayStr : searchParams.date,
      status: searchParams.status,
      pageSize: 30,
    }),
    getReservationReportMetrics(),
  ]);

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Table Reservations & Bookings"
        description="Daily booking sheet, table assignments, guest allergies, and status workflows."
        breadcrumbs={[{ label: "Reservations" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/waitlist">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" /> Waitlist Queue
              </Button>
            </Link>

            <Link href="/reservations/new">
              <Button size="sm" className="gap-1 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> New Booking
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {/* KPI Metrics Header */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Avg Party: {metrics.avgPartySize} guests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.completionRate}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">No-Show Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{metrics.noShowRate}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Cancellation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.cancellationRate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Client Reservations Views */}
        <ReservationsClient
          reservations={reservationsData.data}
          activeDate={activeDate}
          canManage={user.permissions.includes("reservation.update")}
        />
      </div>
    </AppShell>
  );
}
