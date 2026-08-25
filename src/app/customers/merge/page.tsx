"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mergeCustomersAction } from "@/server/services/customer.actions";
import { GitMerge, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function CustomerMergePage() {
  const router = useRouter();
  const [primaryId, setPrimaryId] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleMerge(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await mergeCustomersAction(primaryId.trim(), duplicateId.trim());
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push(`/customers/${primaryId.trim()}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to merge customer records.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Merge Customer Records"
        description="Consolidate duplicate customer profiles into a single primary record."
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "Merge Records" }]}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-600">
              <ShieldAlert className="h-4 w-4" /> Transactional Customer Merge Warning
            </div>
            <p className="text-muted-foreground">
              Merging transfers all notes, tags, consent logs, visits, and total spends to the <strong>Primary Customer</strong>. The duplicate customer profile will be marked as <code className="font-mono text-foreground">MERGED</code> and archived.
            </p>
          </CardContent>
        </Card>

        {success ? (
          <Card className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-foreground">Customer Records Merged Successfully!</h3>
            <p className="text-xs text-muted-foreground">Redirecting to primary customer profile...</p>
          </Card>
        ) : (
          <form onSubmit={handleMerge}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-primary" /> Select Records to Consolidate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-foreground">Primary Customer ID (Record to Keep) *</label>
                  <Input
                    value={primaryId}
                    onChange={(e) => setPrimaryId(e.target.value)}
                    placeholder="Enter Primary Customer UUID e.g. 550e8400-e29b-41d4-a716-446655440000"
                    required
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-destructive">Duplicate Customer ID (Record to Archive) *</label>
                  <Input
                    value={duplicateId}
                    onChange={(e) => setDuplicateId(e.target.value)}
                    placeholder="Enter Duplicate Customer UUID"
                    required
                    className="mt-1 font-mono border-destructive/30"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !primaryId || !duplicateId} className="font-semibold">
                    {loading ? "Executing Merge Transaction..." : "Confirm & Merge Customer Records"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </AppShell>
  );
}
