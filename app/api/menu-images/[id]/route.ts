import { getBucket, getD1 } from "@/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const menuId = Number(id);
    if (!Number.isInteger(menuId) || menuId < 1) return new Response("Not found", { status: 404 });
    const item = await getD1().prepare("SELECT image_key AS imageKey FROM menu_items WHERE id = ?").bind(menuId).first<{ imageKey: string | null }>();
    if (!item?.imageKey) return new Response("Not found", { status: 404 });
    const object = await getBucket().get(item.imageKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("cache-control", "public, max-age=3600");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Menu image load failed", error);
    return new Response("Not found", { status: 404 });
  }
}
