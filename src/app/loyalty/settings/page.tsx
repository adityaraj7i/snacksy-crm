import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { redirect } from "next/navigation";
import { Settings, ShieldCheck } from "lucide-react";
import { LoyaltySettingsClient } from "./settings-client";

export default async function LoyaltySettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  requirePermission(user, "settings.manage");

  const settings = await db.loyaltySettings.findUnique({
    where: { organizationId: user.organizationId },
  });

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Loyalty Program Settings"
        description="Configure spend earning rates, minimum spend thresholds, and bonus points."
        breadcrumbs={[{ label: "Loyalty Program", href: "/loyalty" }, { label: "Settings" }]}
      />

      <div className="max-w-xl mx-auto">
        <LoyaltySettingsClient settings={settings} />
      </div>
    </AppShell>
  );
}
