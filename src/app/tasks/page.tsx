import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { getTasks } from "@/server/services/task.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const taskData = await getTasks();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Staff Task & Recovery Board"
        description="Kanban workflow for managing guest recovery, reservation follow-ups, and operational tasks."
        breadcrumbs={[{ label: "Tasks" }]}
      />

      <TasksClient
        taskData={taskData}
        canManage={user.permissions.includes("task.manage")}
      />
    </AppShell>
  );
}
