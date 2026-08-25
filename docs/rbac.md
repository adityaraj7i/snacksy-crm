# Role-Based Access Control (RBAC) Specification: Snacksy Cafe And Restro CRM

## 1. Overview & Capability Model
The Snacksy Cafe And Restro CRM uses a **Capability-Based Authorization Framework**. Roles represent bundles of fine-grained permissions. System components check explicit permissions (e.g. `customer.merge`) rather than hardcoded role names (e.g. `if (role === 'Manager')`).

---

## 2. Roles Definition Matrix

| Role | Description | Typical User |
| :--- | :--- | :--- |
| **Owner** | Full organization control, settings, billing, integrations, audit logs. | Business Owner |
| **Admin / Manager** | Operational & staff management across all or assigned branches. | Branch Manager / Operations Head |
| **Marketing** | Campaign creation, customer segmentation, automations, and loyalty. | Marketing Specialist |
| **Front Desk / Cashier** | Customer check-in, visit logging, reservations, waitlist & orders. | Receptionist / Host / Cashier |
| **Staff** | Task execution, customer notes, interaction logging. | Service Staff / Waiter |
| **Read Only / Analyst** | View dashboards, generate and export reports. | Accountant / Business Analyst |

---

## 3. Permission Capabilities Matrix

| Permission Code | Category | Owner | Admin/Manager | Marketing | Front Desk | Staff | Read Only |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `customer.read` | Customer 360 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `customer.create` | Customer 360 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `customer.update` | Customer 360 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `customer.delete` | Customer 360 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `customer.export` | Customer 360 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `customer.merge` | Customer 360 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `reservation.read` | Operations | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `reservation.create`| Operations | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `reservation.update`| Operations | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `visit.create` | Operations | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `order.read` | Operations | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `loyalty.read` | Loyalty | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `loyalty.adjust` | Loyalty | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `loyalty.manage` | Loyalty | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `segment.read` | Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `segment.manage` | Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `campaign.read` | Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `campaign.create` | Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `campaign.send` | Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `automation.read` | Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `automation.manage`| Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `feedback.read` | Feedback | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `feedback.manage` | Feedback | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `task.read` | Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `task.manage` | Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `report.read` | Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `report.export` | Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `staff.manage` | Administration| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `settings.manage` | Administration| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `integration.manage`| Administration| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `audit.read` | Security | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Policy Execution Layer Implementation Pattern

Policies are defined centrally in `src/server/policies/`.

```typescript
// src/server/policies/customer.policy.ts
import { UserContext, Permission } from "@/types";

export function canCreateCustomer(user: UserContext): boolean {
  return user.permissions.includes("customer.create");
}

export function canMergeCustomers(user: UserContext): boolean {
  return user.permissions.includes("customer.merge");
}

export function canAccessBranch(user: UserContext, branchId: string): boolean {
  if (user.roles.includes("Owner")) return true;
  return user.branchIds.includes(branchId);
}
```
