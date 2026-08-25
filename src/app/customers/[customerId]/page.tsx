import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db/client";
import { getCustomer360 } from "@/server/services/customer.service";
import { getCustomerFavoriteInsights } from "@/server/services/metrics.service";
import { getCurrentUser } from "@/server/policies";
import { formatCurrencyNPR } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Heart,
  Tag,
  ShieldCheck,
  Clock,
  MessageSquare,
  Award,
  ShoppingBag,
  Plus,
} from "lucide-react";
import { CustomerProfileClient } from "./profile-client";

export default async function CustomerProfilePage({
  params,
}: {
  params: { customerId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let customer;
  let favoriteInsights;
  let loyaltyAccount;
  let availableRewards;
  let rfmScore;

  try {
    customer = await getCustomer360(params.customerId);
    favoriteInsights = await getCustomerFavoriteInsights(params.customerId);
    
    [loyaltyAccount, availableRewards] = await Promise.all([
      db.loyaltyAccount.findUnique({
        where: { customerId: params.customerId },
        include: { currentTier: true, transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
      }),
      db.reward.findMany({
        where: { organizationId: user.organizationId, active: true },
        orderBy: { pointsRequired: "asc" },
      }),
    ]);
  } catch {
    redirect("/customers");
  }

  const name = customer.displayName || `${customer.firstName} ${customer.lastName || ""}`.trim();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title={name}
        description={`Customer ID: ${customer.id}`}
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: name }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/visits/new?customerId=${customer.id}`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Record Visit
              </Button>
            </Link>
            <Link href={`/orders/new?customerId=${customer.id}`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Record Order
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs font-mono">
              Stage: {customer.lifecycleStage}
            </Badge>
            <Badge variant={customer.status === "ACTIVE" ? "default" : "destructive"} className="text-xs">
              {customer.status}
            </Badge>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Profile Header Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.visitCount}</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Last Visit: {customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString() : "Never"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Lifetime Spend (NPR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrencyNPR(customer.totalSpendNpr)}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Avg Spend: {formatCurrencyNPR(customer.averageSpendNpr)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Contact & City</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {customer.phone}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {customer.city || "Kathmandu"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Customer Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{new Date(customer.createdAt).toLocaleDateString()}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Source: {customer.acquisitionSource || "WALK_IN"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Prominent Allergy Alert Banner */}
        {(() => {
          const allergiesList = typeof customer.preferences?.allergies === "string" ? JSON.parse(customer.preferences.allergies || "[]") : customer.preferences?.allergies || [];
          if (allergiesList.length === 0) return null;
          return (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-destructive uppercase tracking-wider">FOOD ALLERGY WARNING: </span>
                <span className="font-semibold text-foreground">
                  {allergiesList.join(", ")}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Always verify allergy restrictions with kitchen staff prior to serving.
                </p>
              </div>
            </div>
          );
        })()}

        {/* Interactive Tabs Client Component */}
        <CustomerProfileClient
          customer={customer}
          favoriteInsights={favoriteInsights}
          loyaltyAccount={loyaltyAccount}
          availableRewards={availableRewards}
          rfmScore={rfmScore}
        />
      </div>
    </AppShell>
  );
}
