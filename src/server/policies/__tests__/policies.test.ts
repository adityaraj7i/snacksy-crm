import { describe, expect, it } from "vitest";
import { hasPermission, hasBranchAccess, requirePermission, requireBranchAccess } from "../index";
import { UserContext } from "@/types";
import { ForbiddenError } from "@/server/lib/errors";

describe("Server Authorization & Policy Engine", () => {
  const mockOwner: UserContext = {
    id: "owner-1",
    email: "owner@snacksy.local",
    name: "Owner User",
    organizationId: "org-1",
    branchIds: ["branch-1"],
    roles: ["Owner"],
    permissions: ["customer.read", "customer.create", "settings.manage", "staff.manage"],
  };

  const mockStaff: UserContext = {
    id: "staff-1",
    email: "staff@snacksy.local",
    name: "Staff User",
    organizationId: "org-1",
    branchIds: ["branch-1"],
    roles: ["Staff"],
    permissions: ["customer.read", "visit.read", "visit.create", "order.read", "task.read"],
  };

  const mockMarketing: UserContext = {
    id: "mkt-1",
    email: "marketing@snacksy.local",
    name: "Marketing User",
    organizationId: "org-1",
    branchIds: ["branch-1"],
    roles: ["Marketing"],
    permissions: ["customer.read", "campaign.read", "campaign.send", "segment.manage"],
  };

  const mockAnalyst: UserContext = {
    id: "analyst-1",
    email: "analyst@snacksy.local",
    name: "Analyst User",
    organizationId: "org-1",
    branchIds: ["branch-1"],
    roles: ["Analyst"],
    permissions: ["customer.read", "report.read", "report.export"],
  };

  it("Owner can access protected organization management actions", () => {
    expect(hasPermission(mockOwner, "settings.manage")).toBe(true);
    expect(hasPermission(mockOwner, "staff.manage")).toBe(true);
    expect(() => requirePermission(mockOwner, "settings.manage")).not.toThrow();
  });

  it("Staff cannot change organization settings or manage staff", () => {
    expect(hasPermission(mockStaff, "settings.manage")).toBe(false);
    expect(hasPermission(mockStaff, "staff.manage")).toBe(false);
    expect(() => requirePermission(mockStaff, "settings.manage")).toThrow(ForbiddenError);
  });

  it("Marketing user cannot manage staff", () => {
    expect(hasPermission(mockMarketing, "staff.manage")).toBe(false);
    expect(() => requirePermission(mockMarketing, "staff.manage")).toThrow(ForbiddenError);
  });

  it("Analyst cannot mutate customer data", () => {
    expect(hasPermission(mockAnalyst, "customer.create")).toBe(false);
    expect(hasPermission(mockAnalyst, "customer.delete")).toBe(false);
    expect(hasPermission(mockAnalyst, "customer.merge")).toBe(false);
    expect(() => requirePermission(mockAnalyst, "customer.create")).toThrow(ForbiddenError);
  });

  it("Branch-limited user cannot access unauthorized branch", () => {
    expect(hasBranchAccess(mockStaff, "branch-1")).toBe(true);
    expect(hasBranchAccess(mockStaff, "branch-unauthorized")).toBe(false);
    expect(() => requireBranchAccess(mockStaff, "branch-unauthorized")).toThrow(ForbiddenError);
  });

  it("Owner bypasses specific branch restrictions for organization overview", () => {
    expect(hasBranchAccess(mockOwner, "branch-any")).toBe(true);
  });
});
