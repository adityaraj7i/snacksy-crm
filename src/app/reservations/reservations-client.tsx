"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateReservationStatusAction } from "@/server/services/reservation.actions";
import { formatCurrencyNPR } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  UserCheck,
  UserX,
  AlertTriangle,
  Phone,
  Eye,
  ShieldAlert,
} from "lucide-react";

interface ReservationsClientProps {
  reservations: any[];
  activeDate: string;
  canManage: boolean;
}

export function ReservationsClient({ reservations, activeDate, canManage }: ReservationsClientProps) {
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "list" | "calendar">("today");
  const [selectedRes, setSelectedRes] = useState<any | null>(null);

  async function handleStatusChange(reservationId: string, status: string) {
    await updateReservationStatusAction(reservationId, status);
  }

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="flex border-b text-xs font-semibold space-x-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "today" ? "border-primary text-primary font-bold bg-primary/5" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" /> Today&apos;s Sheet
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "upcoming" ? "border-primary text-primary font-bold bg-primary/5" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> Upcoming
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "list" ? "border-primary text-primary font-bold bg-primary/5" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" /> All Bookings List
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reservations Table / Sheet */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Reservation Entries ({reservations.length})</span>
              <span className="text-xs text-muted-foreground font-normal">Active Date: {activeDate}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 font-semibold">Time & Guest</th>
                  <th className="p-3 font-semibold">Party</th>
                  <th className="p-3 font-semibold">Table</th>
                  <th className="p-3 font-semibold">Status</th>
                  {canManage && <th className="p-3 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No reservations found for this view.
                    </td>
                  </tr>
                ) : (
                  reservations.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRes(r)}
                      className={`hover:bg-accent/40 cursor-pointer transition-colors ${
                        selectedRes?.id === r.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-foreground">
                          {new Date(r.reservationDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-primary font-semibold hover:underline">{r.customerName}</div>
                      </td>
                      <td className="p-3 font-semibold">{r.partySize} guests</td>
                      <td className="p-3 text-muted-foreground">{r.tableName}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            r.status === "SEATED"
                              ? "default"
                              : r.status === "CONFIRMED"
                              ? "secondary"
                              : r.status === "NO_SHOW" || r.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      {canManage && (
                        <td className="p-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          {r.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2"
                              onClick={() => handleStatusChange(r.id, "CONFIRMED")}
                            >
                              Confirm
                            </Button>
                          )}
                          {r.status === "CONFIRMED" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-6 text-[10px] px-2"
                                onClick={() => handleStatusChange(r.id, "SEATED")}
                              >
                                Seat
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 text-[10px] px-2"
                                onClick={() => handleStatusChange(r.id, "NO_SHOW")}
                              >
                                No-Show
                              </Button>
                            </>
                          )}
                          {r.status === "SEATED" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 text-[10px] px-2"
                              onClick={() => handleStatusChange(r.id, "COMPLETED")}
                            >
                              Complete
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Customer Context Panel */}
        <Card className="lg:col-span-1 border-primary/20">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" /> Customer Context Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-4">
            {selectedRes ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-foreground">{selectedRes.customerName}</h3>
                  <div className="flex items-center gap-1 font-mono text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" /> {selectedRes.customerPhone}
                  </div>
                </div>

                {/* Customer Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-background text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Total Visits:</span>
                    <p className="font-bold text-foreground">{selectedRes.customerVisitCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lifetime Spend:</span>
                    <p className="font-bold text-primary">{formatCurrencyNPR(selectedRes.customerLifetimeSpend)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">No-Show Count:</span>
                    <p className={`font-bold ${selectedRes.customerNoShowCount > 0 ? "text-destructive" : "text-foreground"}`}>
                      {selectedRes.customerNoShowCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>
                    <p className="font-bold text-foreground">{selectedRes.source}</p>
                  </div>
                </div>

                {/* Food Allergy Alert */}
                {selectedRes.customerAllergies && selectedRes.customerAllergies.length > 0 && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Guest Allergy Restriction:
                    </div>
                    <p className="font-semibold text-foreground">{selectedRes.customerAllergies.join(", ")}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedRes.customerNotes && (
                  <div>
                    <span className="font-semibold text-foreground">Guest Notes:</span>
                    <p className="text-muted-foreground italic bg-muted/40 p-2 rounded mt-1">&quot;{selectedRes.customerNotes}&quot;</p>
                  </div>
                )}

                <Link href={`/customers/${selectedRes.customerId}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 mt-2">
                    <Eye className="h-3.5 w-3.5" /> Open Full Customer Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground space-y-2">
                <Users className="h-8 w-8 mx-auto opacity-40" />
                <p>Click on any reservation row to view guest context & allergy warnings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
