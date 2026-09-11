import { getD1 } from "@/db";
import { del, put } from "@vercel/blob";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function canManage(role: string | undefined) {
  return role === "cashier" || role === "owner";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { role?: string; menuId?: number; contentType?: string; imageBase64?: string };
    if (!canManage(body.role)) return Response.json({ error: "Only cashier or owner can manage menu photos." }, { status: 403 });
    const menuId = Number(body.menuId);
    if (!Number.isInteger(menuId) || menuId < 1) return Response.json({ error: "Menu item is required." }, { status: 400 });
    if (!body.contentType || !IMAGE_TYPES[body.contentType] || !body.imageBase64) return Response.json({ error: "Choose a PNG, JPG or WebP image." }, { status: 400 });
    let bytes: Uint8Array;
    try { bytes = Uint8Array.from(atob(body.imageBase64), character => character.charCodeAt(0)); }
    catch { return Response.json({ error: "That image could not be read. Choose another file." }, { status: 400 }); }
    if (bytes.byteLength < 1 || bytes.byteLength > MAX_IMAGE_BYTES) return Response.json({ error: "Image must be smaller than 4 MB." }, { status: 400 });

    const db = getD1();
    const current = await db.prepare("SELECT image_key AS imageKey FROM menu_items WHERE id = ?").bind(menuId).first<{ imageKey: string | null }>();
    if (!current) return Response.json({ error: "Menu item not found." }, { status: 404 });

    const key = `menu/${menuId}/${crypto.randomUUID()}.${IMAGE_TYPES[body.contentType]}`;
    const blob = await put(key, Buffer.from(bytes), { access: "public", contentType: body.contentType });
    try {
      await db.prepare("UPDATE menu_items SET image_key = ? WHERE id = ?").bind(blob.url, menuId).run();
    } catch (error) {
      await del(blob.url);
      throw error;
    }
    if (current.imageKey) await del(current.imageKey);
    return Response.json({ ok: true, imageUrl: `/api/menu-images/${menuId}` });
  } catch (error) {
    console.error("Menu image upload failed", error);
    return Response.json({ error: "Could not save that image. Please try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { role?: string; menuId?: number };
    if (body.role !== "cashier" && body.role !== "owner") return Response.json({ error: "Only cashier or owner can manage menu photos." }, { status: 403 });
    if (!Number.isInteger(body.menuId) || body.menuId! < 1) return Response.json({ error: "Menu item is required." }, { status: 400 });
    const db = getD1();
    const current = await db.prepare("SELECT image_key AS imageKey FROM menu_items WHERE id = ?").bind(body.menuId).first<{ imageKey: string | null }>();
    if (!current) return Response.json({ error: "Menu item not found." }, { status: 404 });
    await db.prepare("UPDATE menu_items SET image_key = NULL WHERE id = ?").bind(body.menuId).run();
    if (current.imageKey) await del(current.imageKey);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Menu image removal failed", error);
    return Response.json({ error: "Could not remove that image. Please try again." }, { status: 503 });
  }
}
