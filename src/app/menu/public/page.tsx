import { getDigitalMenu } from "@/server/services/menu.service";
import { PublicMenuClient } from "./public-menu-client";

export const dynamic = "force-dynamic";

export default async function PublicDigitalMenuPage({
  searchParams,
}: {
  searchParams: { table?: string };
}) {
  const menuData = await getDigitalMenu();

  return (
    <div className="min-h-screen bg-amber-50/50 dark:bg-stone-950 font-sans antialiased text-stone-900 dark:text-stone-100">
      <PublicMenuClient
        initialData={menuData}
        preselectedTable={searchParams.table || ""}
      />
    </div>
  );
}
