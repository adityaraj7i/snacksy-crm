import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db/client";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import { Tag as TagIcon, Plus } from "lucide-react";
import { TagAdminClient } from "./tag-client";

export default async function TagsAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tags = await db.tag.findMany({
    where: { organizationId: user.organizationId },
    include: { _count: { select: { customerTags: true } } },
    orderBy: { name: "asc" },
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
        title="Customer Tag Administration"
        description="Manage organizational tags for segmenting and labeling customer profiles."
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "Tags" }]}
      />

      <TagAdminClient tags={tags} />
    </AppShell>
  );
}
