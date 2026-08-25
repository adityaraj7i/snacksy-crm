import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db/client";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Award,
  MessageSquare,
  CheckSquare,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const todayStr = new Date().toISOString().split("T")[0];
  const startToday = new Date(`${todayStr}T00:00:00.000Z`);
  const endToday = new Date(`${todayStr}T23:59:59.999Z`);

  // Fetch database metrics
  const [
    totalCustomers,
    todayReservations,
    loyaltyAccountCount,
    totalPoints,
    openTasksCount,
    recentCustomers,
  ] = await Promise.all([
    db.customer.count({ where: { organizationId: currentUser.organizationId, status: "ACTIVE" } }),
    db.reservation.count({
      where: {
        organizationId: currentUser.organizationId,
        reservationDateTime: { gte: startToday, lte: endToday },
      },
    }),
    db.loyaltyAccount.count({ where: { organizationId: currentUser.organizationId, status: "ACTIVE" } }),
    db.loyaltyAccount.aggregate({
      where: { organizationId: currentUser.organizationId },
      _sum: { currentPoints: true },
    }),
    db.task.count({ where: { organizationId: currentUser.organizationId, status: "TODO" } }),
    db.customer.findMany({
      where: { organizationId: currentUser.organizationId, status: "ACTIVE" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, phone: true, visitCount: true, totalSpendNpr: true, createdAt: true },
    }),
  ]);

  return (
    <AppShell
      user={{
        fullName: currentUser.name,
        role: currentUser.roles[0] || "Staff",
        permissions: currentUser.permissions,
      }}
    >
      <PageHeader
        title="Executive CRM Dashboard"
        description="Live operational overview across Customer 360, Table Reservations, Loyalty & Rewards, and Staff Tasks."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/customers/new">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Customer
              </Button>
            </Link>
            <Link href="/reservations/new">
              <Button size="sm" className="gap-1 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Book Table
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Top Operational Metrics Header */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Enrolled CRM Profiles</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Today&apos;s Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayReservations}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Table Bookings Today</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Circulating Loyalty Points</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalPoints._sum.currentPoints || 0).toLocaleString()} pts</div>
              <p className="text-[11px] text-muted-foreground mt-1">{loyaltyAccountCount} Enrolled Loyalty Members</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{openTasksCount}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Staff Recovery Tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Operational CRM Modules Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Customers 360
                </span>
                <Link href="/customers">
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">{totalCustomers} Active Customer Profiles</p>
              <p>Search by name, mobile, allergies, and preferences.</p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Reservations & Tables
                </span>
                <Link href="/reservations">
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    View Sheet <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">{todayReservations} Bookings Today</p>
              <p>Daily booking sheet, table conflict protection & waitlist queue.</p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Loyalty & Rewards
                </span>
                <Link href="/loyalty">
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    Manage <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">{loyaltyAccountCount} Enrolled Members</p>
              <p>Immutable points ledger, tier progress & reward redemptions.</p>
            </CardContent>
          </Card>
        </div>

        {/* Recently Registered Customers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Recently Registered Guests</span>
              <Link href="/customers">
                <Button size="sm" variant="link" className="text-xs">
                  View Full Directory
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b uppercase text-[10px]">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Total Visits</th>
                  <th className="p-3">Registration Date</th>
                  <th className="p-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/40">
                    <td className="p-3 font-bold text-foreground">{`${c.firstName} ${c.lastName || ""}`.trim()}</td>
                    <td className="p-3 font-mono text-muted-foreground">{c.phone}</td>
                    <td className="p-3 font-semibold">{c.visitCount} visits</td>
                    <td className="p-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link href={`/customers/${c.id}`}>
                        <Button size="sm" variant="outline" className="h-6 text-[10px]">
                          Open 360
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
