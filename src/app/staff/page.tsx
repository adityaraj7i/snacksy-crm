import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStaffList } from "@/server/staff/actions";
import { getCurrentUser } from "@/server/policies";
import { canManageStaff } from "@/server/policies/staff.policy";
import { redirect } from "next/navigation";
import { UserCheck, Shield, MapPin, Mail, Calendar } from "lucide-react";
import { StaffManagementClient } from "./staff-client";

export default async function StaffPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const staff = await getStaffList();
  const isManager = canManageStaff(user);

  return (
    <AppShell>
      <PageHeader
        title="Staff & User Management"
        description="Manage organizational staff accounts, role assignments, and branch permissions."
        breadcrumbs={[{ label: "Staff Management" }]}
      />

      <div className="space-y-6">
        <StaffManagementClient staff={staff} canManage={isManager} />
      </div>
    </AppShell>
  );
}
