"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createReservationAction } from "@/server/services/reservation.actions";
import { Calendar, AlertCircle, ShieldAlert } from "lucide-react";

export default function NewReservationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const dateVal = formData.get("reservationDate")?.toString();
    const timeVal = formData.get("reservationTime")?.toString();

    if (!dateVal || !timeVal) {
      setError("Please select reservation date and time.");
      setLoading(false);
      return;
    }

    const reservationDateTime = `${dateVal}T${timeVal}:00.000Z`;

    try {
      await createReservationAction({
        branchId: formData.get("branchId")?.toString() || "",
        customerId: formData.get("customerId")?.toString() || "",
        tableId: formData.get("tableId")?.toString() || undefined,
        reservationDateTime,
        expectedDurationMinutes: parseInt(formData.get("duration")?.toString() || "90", 10),
        partySize: parseInt(formData.get("partySize")?.toString() || "2", 10),
        source: formData.get("source")?.toString() || "PHONE",
        occasion: formData.get("occasion")?.toString(),
        customerNotes: formData.get("customerNotes")?.toString(),
      });

      router.push("/reservations");
    } catch (err: any) {
      setError(err.message || "Failed to create reservation.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Book Table Reservation"
        description="Schedule a table reservation with conflict detection."
        breadcrumbs={[{ label: "Reservations", href: "/reservations" }, { label: "New Booking" }]}
      />

      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Booking Details & Table Allocation
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

              <div>
                <label className="font-semibold">Customer ID *</label>
                <Input name="customerId" placeholder="Enter Customer UUID" required className="mt-1 font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Branch ID *</label>
                  <Input name="branchId" placeholder="Enter Branch ID" required className="mt-1 font-mono" />
                </div>
                <div>
                  <label className="font-semibold">Table ID (Optional)</label>
                  <Input name="tableId" placeholder="Enter Table ID" className="mt-1 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold">Booking Date *</label>
                  <Input name="reservationDate" type="date" required className="mt-1" />
                </div>
                <div>
                  <label className="font-semibold">Booking Time *</label>
                  <Input name="reservationTime" type="time" required className="mt-1" />
                </div>
                <div>
                  <label className="font-semibold">Duration (Minutes)</label>
                  <Input name="duration" type="number" defaultValue={90} min={30} step={15} required className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Party Size (Guests) *</label>
                  <Input name="partySize" type="number" defaultValue={2} min={1} required className="mt-1" />
                </div>
                <div>
                  <label className="font-semibold">Booking Source</label>
                  <select name="source" className="w-full h-9 rounded-md border bg-background px-3 mt-1 text-xs">
                    <option value="PHONE">Phone Call</option>
                    <option value="WALK_IN">Walk-In Request</option>
                    <option value="WEBSITE">Website Form</option>
                    <option value="INSTAGRAM">Instagram Direct Message</option>
                    <option value="WHATSAPP">WhatsApp Direct Message</option>
                    <option value="GOOGLE">Google Maps / Reserve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold">Occasion (Optional)</label>
                <Input name="occasion" placeholder="e.g. Birthday Party, Anniversary, Business Lunch" className="mt-1" />
              </div>

              <div>
                <label className="font-semibold">Guest / Special Requests</label>
                <Textarea name="customerNotes" placeholder="e.g. High chair needed, rooftop seating preferred..." className="mt-1 min-h-[60px]" />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="font-semibold">
                  {loading ? "Checking Conflicts & Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
