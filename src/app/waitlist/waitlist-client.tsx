"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addWaitlistEntryAction, updateWaitlistStatusAction } from "@/server/services/waitlist.actions";
import { Clock, Plus, Users, Bell, UserCheck, UserX, AlertCircle, Phone, Info } from "lucide-react";

interface WaitlistClientProps {
  queue: any[];
  canManage: boolean;
}

export function WaitlistClient({ queue, canManage }: WaitlistClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleAddEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await addWaitlistEntryAction({
        branchId: formData.get("branchId")?.toString() || "",
        customerId: formData.get("customerId")?.toString() || "",
        partySize: parseInt(formData.get("partySize")?.toString() || "2", 10),
        estimatedWaitMinutes: parseInt(formData.get("estimatedWaitMinutes")?.toString() || "15", 10),
        preferredSeating: formData.get("preferredSeating")?.toString(),
        notes: formData.get("notes")?.toString(),
      });
      setShowModal(false);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to add waitlist entry.");
      setLoading(false);
    }
  }

  async function handleStatusChange(entryId: string, status: "NOTIFIED" | "SEATED" | "CANCELLED" | "LEFT") {
    const res = await updateWaitlistStatusAction(entryId, status);
    if (res && res.message) {
      setNotice(res.message);
      setTimeout(() => setNotice(null), 4000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Action & Status Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Live Waiting Queue ({queue.length} Guests)</h2>
          <p className="text-xs text-muted-foreground">Touch-friendly tablet controls for front-desk hosts.</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowModal(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Add Walk-In Guest
          </Button>
        )}
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Info className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Waitlist Queue Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queue.length === 0 ? (
          <Card className="col-span-full p-8 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto opacity-40 mb-2" />
            <p className="text-sm font-semibold">Waitlist Queue is Currently Empty</p>
            <p className="text-xs">Walk-in guests will appear here when added to the queue.</p>
          </Card>
        ) : (
          queue.map((item) => (
            <Card key={item.id} className="border-primary/20 hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-base text-foreground">{item.customerName}</span>
                  <Badge variant={item.status === "NOTIFIED" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-mono">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {item.customerPhone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {item.partySize} Guests
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Est. {item.estimatedWaitMinutes} mins
                  </div>
                  <div>
                    Seating: <span className="font-semibold text-foreground">{item.preferredSeating || "Any"}</span>
                  </div>
                </div>

                {item.notes && <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded">&quot;{item.notes}&quot;</p>}

                {canManage && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 text-xs gap-1"
                      onClick={() => handleStatusChange(item.id, "NOTIFIED")}
                    >
                      <Bell className="h-3.5 w-3.5 text-amber-600" /> Notify
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-10 text-xs gap-1 font-semibold"
                      onClick={() => handleStatusChange(item.id, "SEATED")}
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Seat
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => handleStatusChange(item.id, "CANCELLED")}
                    >
                      <UserX className="h-3.5 w-3.5" /> Leave
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Walk-in Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-xl border p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Add Walk-In Guest to Waitlist</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleAddEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Customer ID *</label>
                <Input name="customerId" placeholder="Enter Customer UUID" required className="mt-1 font-mono" />
              </div>
              <div>
                <label className="font-semibold">Branch ID *</label>
                <Input name="branchId" placeholder="Enter Branch ID" required className="mt-1 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Party Size (Guests)</label>
                  <Input name="partySize" type="number" defaultValue={2} min={1} required className="mt-1" />
                </div>
                <div>
                  <label className="font-semibold">Est. Wait (Minutes)</label>
                  <Input name="estimatedWaitMinutes" type="number" defaultValue={15} min={5} step={5} required className="mt-1" />
                </div>
              </div>
              <div>
                <label className="font-semibold">Preferred Seating</label>
                <select name="preferredSeating" className="w-full h-9 rounded-md border bg-background px-3 mt-1 text-xs">
                  <option value="ANY">Any Seating</option>
                  <option value="MAIN_HALL">Main Dining Hall</option>
                  <option value="ROOFTOP">Rooftop Terrace</option>
                  <option value="PATIO">Outdoor Patio</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="font-semibold">
                  {loading ? "Adding..." : "Add to Waitlist Queue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
