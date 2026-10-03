import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cafeTables = sqliteTable("cafe_tables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  seats: integer("seats").notNull().default(2),
  zone: text("zone").notNull().default("Main floor"),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tableName: text("table_name").notNull(),
  items: text("items").notNull(),
  total: integer("total").notNull(),
  discount: integer("discount").notNull().default(0),
  status: text("status").notNull().default("kitchen"),
  waiter: text("waiter").notNull(),
  paymentMethod: text("payment_method"),
  createdAt: integer("created_at").notNull(),
  completedAt: integer("completed_at"),
}, (table) => [
  index("idx_orders_status").on(table.status),
  index("idx_orders_created_at").on(table.createdAt),
]);

export const menuItems = sqliteTable("menu_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  imageKey: text("image_key"),
});

export const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull().default("units"),
  quantity: integer("quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  note: text("note").notNull(),
  amount: integer("amount").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("idx_expenses_created_at").on(table.createdAt),
]);

export const staffMembers = sqliteTable("staff_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  name: text("name").notNull(),
  pin: text("pin").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("idx_staff_members_role").on(table.role),
]);
