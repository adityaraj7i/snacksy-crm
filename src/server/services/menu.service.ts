import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export async function getDigitalMenu(organizationSlug: string = "snacksy-cafe") {
  const org = await db.organization.findUnique({
    where: { slug: organizationSlug },
    include: {
      menuCategories: {
        where: { active: true },
        include: {
          menuItems: {
            where: { active: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { sequence: "asc" },
      },
      digitalMenuSettings: true,
    },
  });

  if (!org) throw new Error("Organization not found.");

  // Ensure default digital menu settings exist
  let settings = org.digitalMenuSettings;
  if (!settings) {
    settings = await db.digitalMenuSettings.create({
      data: {
        organizationId: org.id,
        acceptingOrders: true,
        headerTitle: org.name,
        headerSubtitle: "DINE-IN & TAKEAWAY AVAILABLE",
        accentColor: "#b91c1c",
      },
    });
  }

  return {
    organizationId: org.id,
    organizationName: org.name,
    categories: org.menuCategories,
    settings,
  };
}

export async function createMenuCategory(data: { name: string; description?: string }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "settings.manage");

  const category = await db.menuCategory.create({
    data: {
      organizationId: currentUser.organizationId,
      name: data.name.trim(),
      description: data.description?.trim(),
      active: true,
    },
  });

  revalidatePath("/menu");
  revalidatePath("/menu/public");
  return category;
}

export async function createMenuItem(data: {
  categoryId: string;
  name: string;
  description?: string;
  priceNpr: number; // In Paisa
  imageUrl?: string;
  dietaryTag?: "VEG" | "NON_VEG" | "VEGAN" | "GLUTEN_FREE";
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "settings.manage");

  const item = await db.menuItem.create({
    data: {
      organizationId: currentUser.organizationId,
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description?.trim(),
      priceNpr: Math.max(0, data.priceNpr),
      imageUrl: data.imageUrl?.trim(),
      dietaryTag: data.dietaryTag,
      isAvailable: true,
      active: true,
    },
  });

  logger.info("Menu item created", { itemId: item.id, name: item.name });
  revalidatePath("/menu");
  revalidatePath("/menu/public");
  return item;
}

export async function updateMenuItem(
  itemId: string,
  data: {
    name?: string;
    description?: string;
    priceNpr?: number;
    dietaryTag?: string;
    isAvailable?: boolean;
  }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "settings.manage");

  const updatedItem = await db.menuItem.update({
    where: { id: itemId },
    data: {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(data.priceNpr !== undefined ? { priceNpr: Math.max(0, data.priceNpr) } : {}),
      ...(data.dietaryTag !== undefined ? { dietaryTag: data.dietaryTag } : {}),
      ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
    },
  });

  revalidatePath("/menu");
  revalidatePath("/menu/public");
  return updatedItem;
}

export async function toggleAcceptingOrders(acceptingOrders: boolean) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "settings.manage");

  const updated = await db.digitalMenuSettings.upsert({
    where: { organizationId: currentUser.organizationId },
    update: { acceptingOrders },
    create: {
      organizationId: currentUser.organizationId,
      acceptingOrders,
    },
  });

  revalidatePath("/menu");
  revalidatePath("/menu/public");
  return updated;
}
