import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWaitlistQueue } from "@/server/services/waitlist.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import { Clock, Plus, Users, Bell, UserCheck, UserX, AlertCircle } from "lucide-react";
import { WaitlistClient } from "./waitlist-client";

export default async function WaitlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const queue = await getWaitlistQueue();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Front-Desk Waitlist Queue"
        description="Tablet-optimized walk-in waitlist queue & SMS notification board."
        breadcrumbs={[{ label: "Waitlist Queue" }]}
      />

      <WaitlistClient queue={queue} canManage={user.permissions.includes("reservation.update")} />
    </AppShell>
  );
}
