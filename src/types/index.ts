export type Timezone = "Asia/Kathmandu";
export type Currency = "NPR";

export type RoleName =
  | "Owner"
  | "Admin"
  | "Manager"
  | "Marketing"
  | "Front Desk"
  | "Cashier"
  | "Staff"
  | "Analyst"
  | "ReadOnly";

export type Permission =
  | "customer.read"
  | "customer.create"
  | "customer.update"
  | "customer.delete"
  | "customer.export"
  | "customer.merge"
  | "reservation.read"
  | "reservation.create"
  | "reservation.update"
  | "visit.read"
  | "visit.create"
  | "visit.update"
  | "order.read"
  | "loyalty.read"
  | "loyalty.adjust"
  | "loyalty.manage"
  | "segment.read"
  | "segment.manage"
  | "campaign.read"
  | "campaign.create"
  | "campaign.send"
  | "automation.read"
  | "automation.manage"
  | "feedback.read"
  | "feedback.manage"
  | "task.read"
  | "task.manage"
  | "report.read"
  | "report.export"
  | "staff.read"
  | "staff.manage"
  | "settings.read"
  | "settings.manage"
  | "integration.manage"
  | "audit.read";

export interface UserContext {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  branchIds: string[];
  roles: RoleName[];
  permissions: Permission[];
}
