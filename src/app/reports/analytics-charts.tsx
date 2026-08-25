"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Award, Star } from "lucide-react";

interface AnalyticsChartsProps {
  kpi: {
    activeCustomers: number;
    newGuestsCount: number;
    returningGuestsCount: number;
    churnedGuestsCount: number;
    totalReservations: number;
    totalPointsIssued: number;
  };
}

export function AnalyticsCharts({ kpi }: AnalyticsChartsProps) {
  const totalGuests = kpi.newGuestsCount + kpi.returningGuestsCount + kpi.churnedGuestsCount;
  const newGuestPct = totalGuests > 0 ? Math.round((kpi.newGuestsCount / totalGuests) * 100) : 0;
  const returningGuestPct = totalGuests > 0 ? Math.round((kpi.returningGuestsCount / totalGuests) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Customer Cohort & Guest Retention Graph */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Customer Cohort & Guest Retention Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>New First-Time Guests ({newGuestPct}%)</span>
                <span className="font-bold">{kpi.newGuestsCount} Guests</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div style={{ width: `${newGuestPct}%` }} className="h-full bg-primary rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Returning Loyal Guests ({returningGuestPct}%)</span>
                <span className="font-bold">{kpi.returningGuestsCount} Guests</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div style={{ width: `${returningGuestPct}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
