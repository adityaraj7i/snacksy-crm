"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createStaffMember, toggleStaffStatus } from "@/server/staff/actions";
import { UserPlus, Shield, MapPin, UserX, UserCheck, AlertCircle } from "lucide-react";

interface StaffClientProps {
  staff: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    roles: string[];
    branches: string[];
    createdAt: Date;
  }>;
  canManage: boolean;
}

export function StaffManagementClient({ staff, canManage }: StaffClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createStaffMember(null, formData);

    setLoading(false);
    if (result && result.error) {
      setError(result.error);
    } else {
      setShowModal(false);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    await toggleStaffStatus(userId, nextStatus as any);
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Staff Directory ({staff.length})</h2>
          <p className="text-xs text-muted-foreground">Server-enforced RBAC access policies active.</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowModal(true)} className="gap-2 text-xs font-semibold">
            <UserPlus className="h-4 w-4" /> Invite New Staff
          </Button>
        )}
      </div>

      {/* Staff Table Card */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Staff Member</th>
                <th className="p-4 font-semibold">Assigned Roles</th>
                <th className="p-4 font-semibold">Branch Access</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Last Active</th>
                {canManage && <th className="p-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-accent/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-foreground text-sm">{member.fullName}</div>
                    <div className="text-muted-foreground">{member.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((r) => (
                        <Badge key={r} variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          <Shield className="h-3 w-3 mr-1" /> {r}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {member.branches.length > 0 ? (
                        member.branches.map((b) => (
                          <Badge key={b} variant="secondary" className="text-[10px]">
                            <MapPin className="h-3 w-3 mr-1" /> {b}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic">All Org Branches</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={member.isActive ? "default" : "destructive"} className="text-[10px]">
                      {member.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  {canManage && (
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant={member.isActive ? "outline" : "default"}
                        className="text-xs h-7"
                        onClick={() => handleToggleStatus(member.id, member.status)}
                      >
                        {member.isActive ? (
                          <>
                            <UserX className="h-3 w-3 mr-1 text-destructive" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" /> Reactivate
                          </>
                        )}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invite Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-xl border p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Create Staff Account</h3>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Full Name</label>
                <Input name="fullName" placeholder="e.g. Ramesh Shrestha" required className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Email Address</label>
                <Input name="email" type="email" placeholder="ramesh@snacksy.local" required className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Initial Password</label>
                <Input name="password" type="password" placeholder="Min 8 characters" required minLength={8} className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Assign Role</label>
                <select name="roleName" className="w-full h-9 rounded-md border bg-background px-3 py-1 mt-1 text-xs">
                  <option value="Staff">Staff</option>
                  <option value="Front Desk">Front Desk / Cashier</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Manager">Manager</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
