import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLoyaltyDashboardMetrics } from "@/server/services/loyalty.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Gift, Settings, TrendingUp, Users, ShieldCheck } from "lucide-react";

export default async function LoyaltyDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const metrics = await getLoyaltyDashboardMetrics();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Loyalty Program & Rewards Dashboard"
        description="Executive analytics, points circulation ledger, and reward redemptions."
        breadcrumbs={[{ label: "Loyalty Program" }]}
        actions={
          user.permissions.includes("settings.manage") && (
            <Link href="/loyalty/settings">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Settings className="h-3.5 w-3.5" /> Program Settings
              </Button>
            </Link>
          )
        }
      />

      <div className="space-y-6">
        {/* Metric Cards Header */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Enrolled Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalMembers}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Active Loyalty Accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Points Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.totalPointsIssued.toLocaleString()} pts</div>
              <p className="text-[11px] text-muted-foreground mt-1">Lifetime Ledger Earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Points Redeemed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{metrics.totalPointsRedeemed.toLocaleString()} pts</div>
              <p className="text-[11px] text-muted-foreground mt-1">{metrics.redemptionCount} Reward Vouchers Issued</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Outstanding Points Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.outstandingPoints.toLocaleString()} pts</div>
              <p className="text-[11px] text-muted-foreground mt-1">Circulating Liability Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Member Tier Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            {metrics.tierDistribution.map((tier) => (
              <div key={tier.name} className="p-4 rounded-lg border bg-card shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tier.colorHex }} />
                  <span className="font-bold text-foreground text-sm">{tier.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">
                  {tier.count} Members
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
