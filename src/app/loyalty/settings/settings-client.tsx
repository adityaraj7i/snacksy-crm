"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateLoyaltySettingsAction } from "@/server/services/loyalty.actions";
import { Settings, AlertCircle, CheckCircle2 } from "lucide-react";

interface LoyaltySettingsClientProps {
  settings: any;
}

export function LoyaltySettingsClient({ settings }: LoyaltySettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const earnRateRs = parseFloat(formData.get("earnRateRs")?.toString() || "100");
    const minSpendRs = parseFloat(formData.get("minSpendRs")?.toString() || "100");

    try {
      await updateLoyaltySettingsAction({
        earnRateSpendNpr: Math.round(earnRateRs * 100),
        minSpendToEarnNpr: Math.round(minSpendRs * 100),
        earnPointsPerVisit: parseInt(formData.get("earnPointsPerVisit")?.toString() || "5", 10),
      });
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to update settings.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" /> Earning Rules Configuration
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 text-primary text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Loyalty program earning rules saved successfully!</span>
            </div>
          )}

          <div>
            <label className="font-semibold">Spend Required for 1 Loyalty Point (NPR Rupees)</label>
            <Input
              name="earnRateRs"
              type="number"
              defaultValue={(settings?.earnRateSpendNpr || 10000) / 100}
              min={10}
              required
              className="mt-1 font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Default: NPR 100 spent = 1 Loyalty Point earned.
            </p>
          </div>

          <div>
            <label className="font-semibold">Minimum Order Spend Threshold (NPR Rupees)</label>
            <Input
              name="minSpendRs"
              type="number"
              defaultValue={(settings?.minSpendToEarnNpr || 10000) / 100}
              min={0}
              required
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold">Bonus Points per Completed Visit</label>
            <Input
              name="earnPointsPerVisit"
              type="number"
              defaultValue={settings?.earnPointsPerVisit || 5}
              min={0}
              required
              className="mt-1 font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end border-t">
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading ? "Saving Settings..." : "Save Earning Rules"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
