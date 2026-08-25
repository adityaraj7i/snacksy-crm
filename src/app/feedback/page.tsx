import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeedbackList } from "@/server/services/feedback.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Star, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { FeedbackClient } from "./feedback-client";

export default async function FeedbackPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const feedbackList = await getFeedbackList();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="Customer Ratings & Feedback Recovery"
        description="Monitor guest star ratings, comments, and low-rating automated recovery tasks."
        breadcrumbs={[{ label: "Feedback" }]}
      />

      <FeedbackClient
        feedbackList={feedbackList}
        canManage={user.permissions.includes("feedback.manage")}
      />
    </AppShell>
  );
}
