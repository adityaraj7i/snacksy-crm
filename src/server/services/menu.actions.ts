"use server";

import { createMenuCategory, createMenuItem, updateMenuItem, toggleAcceptingOrders } from "./menu.service";

export async function createMenuCategoryAction(data: Parameters<typeof createMenuCategory>[0]) {
  return createMenuCategory(data);
}

export async function createMenuItemAction(data: Parameters<typeof createMenuItem>[0]) {
  return createMenuItem(data);
}

export async function updateMenuItemAction(itemId: string, data: Parameters<typeof updateMenuItem>[1]) {
  return updateMenuItem(itemId, data);
}

export async function toggleAcceptingOrdersAction(acceptingOrders: boolean) {
  return toggleAcceptingOrders(acceptingOrders);
}
