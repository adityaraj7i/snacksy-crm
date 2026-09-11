import { getD1 } from "@/db";
import { del } from "@vercel/blob";

const defaultTables = [
  ["T1", 2, "Window"], ["T2", 2, "Window"], ["T3", 4, "Main floor"],
  ["T4", 4, "Main floor"], ["T5", 4, "Main floor"], ["T6", 6, "Family"],
  ["T7", 2, "Patio"], ["T8", 2, "Patio"], ["T9", 4, "Patio"],
];
const defaultMenu = [
  ["Iced Latte", "Coffee", 320], ["Cappuccino", "Coffee", 280], ["Americano", "Coffee", 220],
  ["Chicken Momo", "Kitchen", 380], ["Club Sandwich", "Kitchen", 420], ["Veg Chowmein", "Kitchen", 290],
  ["Croissant", "Bakery", 230], ["Lemon Soda", "Drinks", 210],
];
const defaultStaff = [
  ["owner", "Ayush", "INITIAL_OWNER_PIN"], ["waiter", "Rohan", "INITIAL_WAITER_PIN"],
  ["chef", "Maya", "INITIAL_CHEF_PIN"], ["cashier", "Nima", "INITIAL_CASHIER_PIN"],
] as const;

function getInitialStaff() {
  return defaultStaff.map(([role, name, binding]) => {
    const pin = process.env[binding];
    if (!/^\d{4}$/.test(pin || "")) throw new Error(`Missing or invalid ${binding} secret.`);
    return [role, name, pin] as const;
  });
}

const allowed: Record<string, string[]> = {
  waiter: ["create", "served"], chef: ["cooking", "ready"], cashier: ["completed", "add_table", "remove_table", "add_menu", "remove_menu"], owner: ["create", "cooking", "ready", "served", "completed", "add_table", "remove_table", "add_menu", "remove_menu", "add_staff", "update_staff", "remove_staff"],
};

export async function GET() {
  try {
    const db = getD1();
    const existing = await db.prepare("SELECT COUNT(*) AS count FROM cafe_tables").first<{ count: number }>();
    if (!existing?.count) await db.batch(defaultTables.map(table => db.prepare("INSERT INTO cafe_tables (name, seats, zone) VALUES (?, ?, ?)").bind(...table)));
    const menuExisting = await db.prepare("SELECT COUNT(*) AS count FROM menu_items").first<{ count: number }>();
    if (!menuExisting?.count) await db.batch(defaultMenu.map(item => db.prepare("INSERT INTO menu_items (name, category, price, available) VALUES (?, ?, ?, 1)").bind(...item)));
    const staffExisting = await db.prepare("SELECT COUNT(*) AS count FROM staff_members").first<{ count: number }>();
    if (!staffExisting?.count) await db.batch(getInitialStaff().map(member => db.prepare("INSERT INTO staff_members (role, name, pin, active, created_at) VALUES (?, ?, ?, 1, ?)").bind(...member, Date.now())));
    const [tables, orders, menuItems, staffMembers] = await db.batch([
      db.prepare("SELECT id, name, seats, zone FROM cafe_tables ORDER BY id"),
      db.prepare("SELECT id, table_name AS tableName, items, total, status, waiter, payment_method AS paymentMethod, created_at AS createdAt, completed_at AS completedAt FROM orders ORDER BY created_at DESC LIMIT 200"),
      db.prepare("SELECT id, name, category, price, available, image_key AS imageKey FROM menu_items ORDER BY category, name"),
      db.prepare("SELECT id, role, name, active, created_at AS createdAt FROM staff_members WHERE active = 1 ORDER BY CASE role WHEN 'owner' THEN 1 WHEN 'cashier' THEN 2 WHEN 'waiter' THEN 3 ELSE 4 END, id"),
    ]);
    return Response.json({ tables: tables.results, orders: orders.results, menuItems: menuItems.results, staffMembers: staffMembers.results });
  } catch (error) {
    console.error("Snacksy state load failed", error);
    return Response.json({ error: "Shared café data is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; role?: string; actorStaffId?: number; staffId?: number; staffRole?: string; pin?: string; tableName?: string; items?: unknown; total?: number; waiter?: string; orderId?: number; paymentMethod?: string; tableId?: number; seats?: number; zone?: string; menuId?: number; name?: string; category?: string; price?: number };
    const db = getD1();
    if (body.action === "login") {
      if (!body.staffId || !/^\d{4}$/.test(body.pin || "")) return Response.json({ error: "Enter your 4-digit PIN." }, { status: 400 });
      const member = await db.prepare("SELECT id, role, name, active, created_at AS createdAt FROM staff_members WHERE id = ? AND pin = ? AND active = 1").bind(body.staffId, body.pin).first();
      if (!member) return Response.json({ error: "Incorrect PIN." }, { status: 401 });
      return Response.json({ ok: true, staff: member });
    }
    if (!body.role || !body.action || !allowed[body.role]?.includes(body.action)) return Response.json({ error: "This role cannot perform that action." }, { status: 403 });
    if (body.action === "add_staff") {
      if (!body.name?.trim() || !["waiter", "chef", "cashier"].includes(body.staffRole || "") || !/^\d{4}$/.test(body.pin || "")) return Response.json({ error: "Enter a name, staff role and 4-digit PIN." }, { status: 400 });
      const result = await db.prepare("INSERT INTO staff_members (role, name, pin, active, created_at) VALUES (?, ?, ?, 1, ?)").bind(body.staffRole, body.name.trim(), body.pin, Date.now()).run();
      return Response.json({ ok: true, staffId: result.meta.last_row_id });
    }
    if (body.action === "update_staff") {
      if (!body.staffId || !body.name?.trim() || (body.pin && !/^\d{4}$/.test(body.pin))) return Response.json({ error: "Enter a name and, when changing it, a 4-digit PIN." }, { status: 400 });
      const current = await db.prepare("SELECT id FROM staff_members WHERE id = ? AND active = 1").bind(body.staffId).first();
      if (!current) return Response.json({ error: "Staff member not found." }, { status: 404 });
      await db.prepare("UPDATE staff_members SET name = ?, pin = COALESCE(?, pin) WHERE id = ?").bind(body.name.trim(), body.pin || null, body.staffId).run();
      return Response.json({ ok: true });
    }
    if (body.action === "remove_staff") {
      if (!body.staffId) return Response.json({ error: "Staff member is required." }, { status: 400 });
      const current = await db.prepare("SELECT role FROM staff_members WHERE id = ? AND active = 1").bind(body.staffId).first<{ role: string }>();
      if (!current) return Response.json({ error: "Staff member not found." }, { status: 404 });
      if (current.role === "owner") return Response.json({ error: "The owner account cannot be removed." }, { status: 400 });
      await db.prepare("UPDATE staff_members SET active = 0 WHERE id = ?").bind(body.staffId).run();
      return Response.json({ ok: true });
    }
    if (body.action === "add_table") {
      if (!body.tableName?.trim() || !body.zone?.trim() || !Number.isInteger(body.seats) || body.seats! < 1 || body.seats! > 20) return Response.json({ error: "Enter a table name, zone and 1–20 seats." }, { status: 400 });
      await db.prepare("INSERT INTO cafe_tables (name, seats, zone) VALUES (?, ?, ?)").bind(body.tableName.trim().toUpperCase(), body.seats, body.zone.trim()).run();
      return Response.json({ ok: true });
    }
    if (body.action === "remove_table") {
      if (!body.tableId) return Response.json({ error: "Table is required." }, { status: 400 });
      const table = await db.prepare("SELECT name FROM cafe_tables WHERE id = ?").bind(body.tableId).first<{ name: string }>();
      if (!table) return Response.json({ error: "Table not found." }, { status: 404 });
      const active = await db.prepare("SELECT id FROM orders WHERE table_name = ? AND status != 'completed' LIMIT 1").bind(table.name).first();
      if (active) return Response.json({ error: "Complete the active order before removing this table." }, { status: 409 });
      await db.prepare("DELETE FROM cafe_tables WHERE id = ?").bind(body.tableId).run();
      return Response.json({ ok: true });
    }
    if (body.action === "add_menu") {
      if (!body.name?.trim() || !body.category?.trim() || !Number.isInteger(body.price) || body.price! < 1) return Response.json({ error: "Enter item name, category and a valid price." }, { status: 400 });
      const result = await db.prepare("INSERT INTO menu_items (name, category, price, available) VALUES (?, ?, ?, 1)").bind(body.name.trim(), body.category.trim(), body.price).run();
      return Response.json({ ok: true, menuId: result.meta.last_row_id });
    }
    if (body.action === "remove_menu") {
      if (!body.menuId) return Response.json({ error: "Menu item is required." }, { status: 400 });
      const item = await db.prepare("SELECT image_key AS imageKey FROM menu_items WHERE id = ?").bind(body.menuId).first<{ imageKey: string | null }>();
      await db.prepare("DELETE FROM menu_items WHERE id = ?").bind(body.menuId).run();
      if (item?.imageKey) await del(item.imageKey);
      return Response.json({ ok: true });
    }
    if (body.action === "create") {
      if (!body.tableName || !Array.isArray(body.items) || !body.items.length || !Number.isFinite(body.total) || !body.waiter) return Response.json({ error: "Table, items and waiter are required." }, { status: 400 });
      const result = await db.prepare("INSERT INTO orders (table_name, items, total, status, waiter, created_at) VALUES (?, ?, ?, 'kitchen', ?, ?)").bind(body.tableName, JSON.stringify(body.items), body.total, body.waiter, Date.now()).run();
      return Response.json({ ok: true, orderId: result.meta.last_row_id });
    }
    if (!body.orderId) return Response.json({ error: "Order is required." }, { status: 400 });
    const expected: Record<string, string> = { cooking: "kitchen", ready: "cooking", served: "ready", completed: "served" };
    const current = await db.prepare("SELECT status FROM orders WHERE id = ?").bind(body.orderId).first<{ status: string }>();
    if (!current || current.status !== expected[body.action]) return Response.json({ error: "Order has already moved to another stage." }, { status: 409 });
    if (body.action === "completed") {
      if (!body.paymentMethod) return Response.json({ error: "Payment method is required." }, { status: 400 });
      await db.prepare("UPDATE orders SET status = 'completed', payment_method = ?, completed_at = ? WHERE id = ? AND status = 'served'").bind(body.paymentMethod, Date.now(), body.orderId).run();
    } else {
      await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.action, body.orderId).run();
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Snacksy state update failed", error);
    return Response.json({ error: "Could not save that change. Please try again." }, { status: 503 });
  }
}
