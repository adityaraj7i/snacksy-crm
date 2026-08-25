"use server";

import { db } from "@/server/db/client";
import { verifyPassword, hashPassword, generateRandomToken, hashToken } from "./passwords";
import { createSession, setSessionCookie, clearSessionCookie } from "./session";
import { checkRateLimit } from "./rate-limiter";
import { logger } from "@/server/lib/logger";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginServerAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Rate Limiting Protection (5 attempts per minute per email)
  const rateLimitKey = `login:${email}`;
  const limit = checkRateLimit(rateLimitKey, 5, 60 * 1000);
  if (!limit.success) {
    logger.warn("Login rate limit exceeded", { email });
    return { error: "Too many login attempts. Please wait 1 minute before trying again." };
  }

  const user = await db.user.findUnique({
    where: { email },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      userBranches: true,
    },
  });

  if (!user || !user.isActive || user.status !== "ACTIVE") {
    // Log security failure without revealing existence
    logger.warn("Failed login attempt: Invalid credentials or inactive user", { email });
    return { error: "Invalid email or password." };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    logger.warn("Failed login attempt: Incorrect password", { email });
    return { error: "Invalid email or password." };
  }

  const roles = user.userRoles.map((ur) => ur.role.name as any);
  const permissionsSet = new Set<string>();
  user.userRoles.forEach((ur) => {
    ur.role.rolePermissions.forEach((rp) => {
      permissionsSet.add(rp.permission.code);
    });
  });
  const branchIds = user.userBranches.map((ub) => ub.branchId);

  const sessionToken = await createSession({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    organizationId: user.organizationId,
    roles,
    permissions: Array.from(permissionsSet) as any,
    branchIds,
  });

  await setSessionCookie(sessionToken);

  // Update last login timestamp
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Audit log entry
  await db.auditLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "auth.login.success",
      resource: "User",
      resourceId: user.id,
      details: JSON.stringify({ email: user.email }),
    },
  });

  logger.info("User logged in successfully", { userId: user.id, email: user.email });
  redirect("/");
}

export async function logoutServerAction() {
  await clearSessionCookie();
  revalidatePath("/");
  redirect("/login");
}

export async function forgotPasswordServerAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) {
    return { error: "Please provide a valid email address." };
  }

  const rateLimitKey = `forgot:${email}`;
  const limit = checkRateLimit(rateLimitKey, 3, 60 * 1000);
  if (!limit.success) {
    return { error: "Too many reset requests. Please wait 1 minute." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user && user.isActive && user.status === "ACTIVE") {
    const token = generateRandomToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Development logging for testing reset links without SMTP
    logger.info(`[DEV MODE RESET TOKEN] Link: /reset-password?token=${token}`, { email: user.email });

    await db.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: "password.reset_requested",
        resource: "User",
        resourceId: user.id,
      },
    });
  }

  // Always return identical success message to prevent user enumeration attacks
  return {
    success: true,
    message: "If an active account exists for this email, password reset instructions have been dispatched.",
  };
}

export async function resetPasswordServerAction(_prevState: unknown, formData: FormData) {
  const token = formData.get("token")?.toString().trim();
  const newPassword = formData.get("newPassword")?.toString();

  if (!token || !newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const tokenHash = hashToken(token);
  const resetRecord = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
    return { error: "Invalid or expired password reset token." };
  }

  const newHash = await hashPassword(newPassword);

  await db.$transaction([
    db.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: newHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    db.auditLog.create({
      data: {
        organizationId: resetRecord.user.organizationId,
        userId: resetRecord.user.id,
        action: "password.reset_completed",
        resource: "User",
        resourceId: resetRecord.user.id,
      },
    }),
  ]);

  logger.info("Password reset completed successfully", { userId: resetRecord.userId });
  return { success: true, message: "Password updated successfully! You can now log in with your new password." };
}
