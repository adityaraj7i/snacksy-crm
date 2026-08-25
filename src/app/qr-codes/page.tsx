import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { getQRCodeSettings } from "@/server/services/qr.service";
import { getCurrentUser } from "@/server/policies";
import { redirect } from "next/navigation";
import { QRCodesClient } from "./qr-client";

export default async function QRCodesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const qrData = await getQRCodeSettings();

  return (
    <AppShell
      user={{
        fullName: user.name,
        role: user.roles[0] || "Staff",
        permissions: user.permissions,
      }}
    >
      <PageHeader
        title="QR codes"
        description="Guests scan to view your menu and order from their phone. Print and place on tables, the bar, or your counter."
        breadcrumbs={[{ label: "Run" }, { label: "QR codes" }]}
      />

      <QRCodesClient qrData={qrData} />
    </AppShell>
  );
}
