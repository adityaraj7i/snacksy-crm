import { getD1 } from "@/db";
import { del } from "@vercel/blob";

const tableZones = ["Hall", "Cabin", "Outside"] as const;
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
  waiter: ["create", "update_order", "cancel_order", "served"], chef: ["cooking", "ready"], cashier: ["completed", "add_table", "remove_table", "add_menu", "remove_menu", "add_inventory", "update_inventory", "remove_inventory", "add_expense", "remove_expense"], owner: ["create", "update_order", "cancel_order", "cooking", "ready", "served", "completed", "add_table", "remove_table", "add_menu", "remove_menu", "add_staff", "update_staff", "remove_staff", "add_inventory", "update_inventory", "remove_inventory", "add_expense", "remove_expense"],
};

export async function GET() {
  try {
    const db = getD1();
    await db.prepare("UPDATE cafe_tables SET zone = CASE zone WHEN 'Window' THEN 'Hall' WHEN 'Main floor' THEN 'Cabin' WHEN 'Family' THEN 'Outside' WHEN 'Patio' THEN 'Outside' ELSE zone END WHERE zone IN ('Window', 'Main floor', 'Family', 'Patio')").run();
    const staffExisting = await db.prepare("SELECT COUNT(*) AS count FROM staff_members").first<{ count: number }>();
    if (!staffExisting?.count) await db.batch(getInitialStaff().map(member => db.prepare("INSERT INTO staff_members (role, name, pin, active, created_at) VALUES (?, ?, ?, 1, ?)").bind(...member, Date.now())));
    const [tables, orders, menuItems, staffMembers, inventoryItems, expenses] = await db.batch([
      db.prepare("SELECT id, name, seats, zone FROM cafe_tables ORDER BY id"),
      db.prepare("SELECT id, table_name AS tableName, items, total, discount, status, waiter, payment_method AS paymentMethod, created_at AS createdAt, completed_at AS completedAt FROM orders ORDER BY created_at DESC LIMIT 5000"),
      db.prepare("SELECT id, name, category, price, available, image_key AS imageKey FROM menu_items ORDER BY category, name"),
      db.prepare("SELECT id, role, name, active, created_at AS createdAt FROM staff_members WHERE active = 1 ORDER BY CASE role WHEN 'owner' THEN 1 WHEN 'cashier' THEN 2 WHEN 'waiter' THEN 3 ELSE 4 END, id"),
      db.prepare("SELECT id, name, unit, quantity, reorder_level AS reorderLevel, updated_at AS updatedAt FROM inventory_items ORDER BY name"),
      db.prepare("SELECT id, category, note, amount, created_at AS createdAt FROM expenses ORDER BY created_at DESC LIMIT 1000"),
    ]);
    return Response.json({ tables: tables.results, orders: orders.results, menuItems: menuItems.results, staffMembers: staffMembers.results, inventoryItems: inventoryItems.results, expenses: expenses.results });
  } catch (error) {
    console.error("Snacksy state load failed", error);
    return Response.json({ error: "Shared café data is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; role?: string; actorStaffId?: number; staffId?: number; staffRole?: string; pin?: string; tableName?: string; items?: unknown; total?: number; discount?: number; waiter?: string; orderId?: number; paymentMethod?: string; tableId?: number; seats?: number; zone?: string; menuId?: number; name?: string; category?: string; price?: number; inventoryId?: number; unit?: string; quantity?: number; reorderLevel?: number; expenseId?: number; note?: string; amount?: number };
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
      const zone = body.zone;
      if (!body.tableName?.trim() || !zone || !tableZones.includes(zone as typeof tableZones[number]) || !Number.isInteger(body.seats) || body.seats! < 1 || body.seats! > 20) return Response.json({ error: "Enter a table name, Hall/Cabin/Outside category and 1–20 seats." }, { status: 400 });
      await db.prepare("INSERT INTO cafe_tables (name, seats, zone) VALUES (?, ?, ?)").bind(body.tableName.trim().toUpperCase(), body.seats, zone).run();
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
    if (body.action === "add_inventory") {
      if (!body.name?.trim() || !body.unit?.trim() || !Number.isInteger(body.quantity) || body.quantity! < 0 || !Number.isInteger(body.reorderLevel) || body.reorderLevel! < 0) return Response.json({ error: "Enter an item, unit, current stock and reorder level." }, { status: 400 });
      const result = await db.prepare("INSERT INTO inventory_items (name, unit, quantity, reorder_level, updated_at) VALUES (?, ?, ?, ?, ?)").bind(body.name.trim(), body.unit.trim(), body.quantity, body.reorderLevel, Date.now()).run();
      return Response.json({ ok: true, inventoryId: result.meta.last_row_id });
    }
    if (body.action === "update_inventory") {
      if (!body.inventoryId || !Number.isInteger(body.quantity) || body.quantity! < 0 || !Number.isInteger(body.reorderLevel) || body.reorderLevel! < 0) return Response.json({ error: "Enter valid stock and reorder values." }, { status: 400 });
      await db.prepare("UPDATE inventory_items SET quantity = ?, reorder_level = ?, updated_at = ? WHERE id = ?").bind(body.quantity, body.reorderLevel, Date.now(), body.inventoryId).run();
      return Response.json({ ok: true });
    }
    if (body.action === "remove_inventory") {
      if (!body.inventoryId) return Response.json({ error: "Inventory item is required." }, { status: 400 });
      await db.prepare("DELETE FROM inventory_items WHERE id = ?").bind(body.inventoryId).run();
      return Response.json({ ok: true });
    }
    if (body.action === "add_expense") {
      if (!body.category?.trim() || !Number.isInteger(body.amount) || body.amount! < 1) return Response.json({ error: "Enter a category and valid amount." }, { status: 400 });
      const result = await db.prepare("INSERT INTO expenses (category, note, amount, created_at) VALUES (?, ?, ?, ?)").bind(body.category.trim(), body.note?.trim() || "", body.amount, Date.now()).run();
      return Response.json({ ok: true, expenseId: result.meta.last_row_id });
    }
    if (body.action === "remove_expense") {
      if (!body.expenseId) return Response.json({ error: "Expense is required." }, { status: 400 });
      await db.prepare("DELETE FROM expenses WHERE id = ?").bind(body.expenseId).run();
      return Response.json({ ok: true });
    }
    if (body.action === "create") {
      if (!body.tableName || !Array.isArray(body.items) || !body.items.length || !Number.isFinite(body.total) || !body.waiter) return Response.json({ error: "Table, items and waiter are required." }, { status: 400 });
      const result = await db.prepare("INSERT INTO orders (table_name, items, total, status, waiter, created_at) VALUES (?, ?, ?, 'kitchen', ?, ?)").bind(body.tableName, JSON.stringify(body.items), body.total, body.waiter, Date.now()).run();
      return Response.json({ ok: true, orderId: result.meta.last_row_id });
    }
    if (!body.orderId) return Response.json({ error: "Order is required." }, { status: 400 });
    if (body.action === "update_order") {
      if (!Array.isArray(body.items) || !body.items.length || !Number.isFinite(body.total) || body.total! < 1) return Response.json({ error: "Order needs at least one valid item." }, { status: 400 });
      const result = await db.prepare("UPDATE orders SET items = ?, total = ? WHERE id = ? AND status = 'kitchen'").bind(JSON.stringify(body.items), body.total, body.orderId).run();
      return Response.json({ ok: true, result: result.meta });
    }
    if (body.action === "cancel_order") {
      const current = await db.prepare("SELECT status FROM orders WHERE id = ?").bind(body.orderId).first<{ status: string }>();
      if (!current || current.status !== "kitchen") return Response.json({ error: "Only a new kitchen ticket can be cancelled." }, { status: 409 });
      await db.prepare("DELETE FROM orders WHERE id = ? AND status = 'kitchen'").bind(body.orderId).run();
      return Response.json({ ok: true });
    }
    const expected: Record<string, string> = { cooking: "kitchen", ready: "cooking", served: "ready", completed: "served" };
    const current = await db.prepare("SELECT status FROM orders WHERE id = ?").bind(body.orderId).first<{ status: string }>();
    if (!current || current.status !== expected[body.action]) return Response.json({ error: "Order has already moved to another stage." }, { status: 409 });
    if (body.action === "completed") {
      if (!body.paymentMethod) return Response.json({ error: "Payment method is required." }, { status: 400 });
      const order = await db.prepare("SELECT total FROM orders WHERE id = ? AND status = 'served'").bind(body.orderId).first<{ total: number }>();
      const discount = Math.max(0, Math.round(Number(body.discount) || 0));
      if (!order || discount >= order.total) return Response.json({ error: "Discount must be lower than the bill total." }, { status: 400 });
      await db.prepare("UPDATE orders SET status = 'completed', total = ?, discount = ?, payment_method = ?, completed_at = ? WHERE id = ? AND status = 'served'").bind(order.total - discount, discount, body.paymentMethod, Date.now(), body.orderId).run();
    } else {
      await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.action, body.orderId).run();
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Snacksy state update failed", error);
    return Response.json({ error: "Could not save that change. Please try again." }, { status: 503 });
  }
}
