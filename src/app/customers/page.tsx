import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/server/services/customer.service";
import { getCurrentUser } from "@/server/policies";
import { formatCurrencyNPR } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus, Download, GitMerge, Tag, Search, Filter, Eye, Phone, Mail } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; stage?: string; tagId?: string; segmentId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const page = parseInt(searchParams.page || "1", 10);
  const result = await getCustomers({
    page,
    pageSize: 15,
    search: searchParams.search,
    lifecycleStage: searchParams.stage,
    tagId: searchParams.tagId,
    segmentId: searchParams.segmentId,
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
        title="Customer Directory"
        description="Centralized Customer 360 database & profile management."
        breadcrumbs={[{ label: "Customers" }]}
        actions={
          <div className="flex items-center gap-2">
            {user.permissions.includes("customer.export") && (
              <a href="/api/customers/export" download>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </a>
            )}

            {user.permissions.includes("customer.merge") && (
              <Link href="/customers/merge">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <GitMerge className="h-3.5 w-3.5" /> Merge Records
                </Button>
              </Link>
            )}

            <Link href="/customers/tags">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Tag className="h-3.5 w-3.5" /> Tags
              </Button>
            </Link>

            {user.permissions.includes("customer.create") && (
              <Link href="/customers/new">
                <Button size="sm" className="gap-1 text-xs font-semibold">
                  <UserPlus className="h-3.5 w-3.5" /> Add Customer
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <Card className="p-4">
          <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                name="search"
                defaultValue={searchParams.search || ""}
                placeholder="Search by customer name, phone (+977), email, or ID..."
                className="flex h-9 w-full rounded-md border bg-background pl-9 pr-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <select
              name="stage"
              defaultValue={searchParams.stage || ""}
              className="h-9 rounded-md border bg-background px-3 text-xs shadow-sm w-full sm:w-44"
            >
              <option value="">All Lifecycle Stages</option>
              <option value="NEW">New</option>
              <option value="RETURNING">Returning</option>
              <option value="REGULAR">Regular</option>
              <option value="VIP">VIP</option>
              <option value="AT_RISK">At Risk</option>
              <option value="LAPSED">Lapsed</option>
            </select>

            <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </form>
        </Card>

        {/* Customer Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Stage</th>
                  <th className="p-4 font-semibold">Visits</th>
                  <th className="p-4 font-semibold">Lifetime Spend</th>
                  <th className="p-4 font-semibold">Avg. Spend</th>
                  <th className="p-4 font-semibold">Last Visit</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No customer profiles matched your criteria.
                    </td>
                  </tr>
                ) : (
                  result.data.map((c) => (
                    <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                      <td className="p-4">
                        <Link href={`/customers/${c.id}`} className="font-bold text-foreground hover:text-primary transition-colors text-sm">
                          {c.name}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.tags.map((t) => (
                            <Badge key={t.id} variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30">
                              {t.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3" /> {c.email}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={c.lifecycleStage === "VIP" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {c.lifecycleStage}
                        </Badge>
                      </td>
                      <td className="p-4 font-semibold">{c.visitCount}</td>
                      <td className="p-4 font-semibold text-primary">{formatCurrencyNPR(c.totalSpendNpr)}</td>
                      <td className="p-4 text-muted-foreground">{formatCurrencyNPR(c.averageSpendNpr)}</td>
                      <td className="p-4 text-muted-foreground">
                        {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : "No visits yet"}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/customers/${c.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1" /> Profile
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Server Pagination */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
          <div>
            Showing {result.data.length} of {result.meta.total} customers (Page {result.meta.page} of {result.meta.totalPages || 1})
          </div>
          <div className="flex items-center gap-2">
            {result.meta.page > 1 && (
              <Link href={`/customers?page=${result.meta.page - 1}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Previous
                </Button>
              </Link>
            )}
            {result.meta.page < result.meta.totalPages && (
              <Link href={`/customers?page=${result.meta.page + 1}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
