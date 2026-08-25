"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveFeedbackAction } from "@/server/services/feedback.actions";
import { MessageSquare, Star, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

interface FeedbackClientProps {
  feedbackList: any[];
  canManage: boolean;
}

export function FeedbackClient({ feedbackList, canManage }: FeedbackClientProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResolve() {
    if (!selectedFeedback || !resolutionNotes.trim()) return;
    setLoading(true);
    try {
      await resolveFeedbackAction(selectedFeedback.id, resolutionNotes);
      setSelectedFeedback(null);
      setResolutionNotes("");
    } catch (err: any) {
      alert(err.message || "Failed to resolve feedback.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Guest Ratings Ledger ({feedbackList.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Guest Comment</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                {canManage && <th className="p-4 font-semibold text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No customer ratings logged yet.
                  </td>
                </tr>
              ) : (
                feedbackList.map((f) => (
                  <tr key={f.id} className={f.isNegative ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-accent/40"}>
                    <td className="p-4 font-bold text-foreground">
                      {f.customer ? `${f.customer.firstName} ${f.customer.lastName || ""}`.trim() : "Guest"}
                      <p className="text-[11px] font-mono text-muted-foreground">{f.customer?.phone || "—"}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={f.rating >= 4 ? "default" : f.rating === 3 ? "secondary" : "destructive"} className="text-[10px]">
                        {f.rating} ★
                      </Badge>
                    </td>
                    <td className="p-4 max-w-xs font-sans">
                      <p className="text-foreground">{f.comment || <span className="text-muted-foreground italic">No written comment</span>}</p>
                      {f.resolutionNotes && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">Resolution: {f.resolutionNotes}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={f.status === "RESOLVED" ? "outline" : f.isNegative ? "destructive" : "secondary"} className="text-[10px]">
                        {f.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-[11px]">{new Date(f.createdAt).toLocaleString()}</td>
                    {canManage && (
                      <td className="p-4 text-right">
                        {f.status !== "RESOLVED" && f.isNegative && (
                          <Button size="sm" variant="outline" onClick={() => setSelectedFeedback(f)} className="h-7 text-xs gap-1 border-destructive/40 text-destructive">
                            <AlertTriangle className="h-3 w-3" /> Resolve Recovery
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

      {/* Resolution Dialog Modal */}
      {selectedFeedback && (
        <Card className="border-primary/40 bg-primary/5 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Resolve Low-Rating Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="font-semibold text-foreground">
              Guest Rating: {selectedFeedback.rating}★ • Comment: &quot;{selectedFeedback.comment}&quot;
            </p>
            <div>
              <label className="font-semibold">Resolution Notes *</label>
              <Input
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Called guest, offered 20% discount voucher for next visit"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedFeedback(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleResolve} disabled={loading} className="font-semibold">
                {loading ? "Saving..." : "Complete Recovery & Close Task"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
