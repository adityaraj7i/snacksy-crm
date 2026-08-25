import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { getDigitalMenu } from "@/server/services/menu.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import { DigitalMenuClient } from "./menu-client";

export default async function DigitalMenuPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const menuData = await getDigitalMenu();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Digital Menu"
        description="A live preview of your menu, just like guests will see on their phones."
        breadcrumbs={[{ label: "Digital Menu" }]}
      />

      <DigitalMenuClient
        initialData={menuData}
        canManage={user.permissions.includes("settings.manage")}
      />
    </AppShell>
  );
}
