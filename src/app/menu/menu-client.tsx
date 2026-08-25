"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createMenuCategoryAction,
  createMenuItemAction,
  updateMenuItemAction,
  toggleAcceptingOrdersAction,
} from "@/server/services/menu.actions";
import { formatCurrencyNPR } from "@/lib/utils";
import { Smartphone, Monitor, Copy, ExternalLink, RefreshCw, Plus, Edit2, CheckCircle2, Utensils } from "lucide-react";
import Link from "next/link";

interface DigitalMenuClientProps {
  initialData: {
    organizationId: string;
    organizationName: string;
    categories: any[];
    settings: any;
  };
  canManage: boolean;
}

export function DigitalMenuClient({ initialData, canManage }: DigitalMenuClientProps) {
  const [viewMode, setViewMode] = useState<"PHONE" | "DESKTOP">("PHONE");
  const [acceptingOrders, setAcceptingOrders] = useState(initialData.settings?.acceptingOrders ?? true);

  // Modal / Form states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData.categories[0]?.id || "");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPriceNpr, setItemPriceNpr] = useState(250);
  const [dietaryTag, setDietaryTag] = useState<"VEG" | "NON_VEG" | "VEGAN" | "GLUTEN_FREE">("VEG");

  const [loading, setLoading] = useState(false);

  async function handleToggleOrders() {
    const nextState = !acceptingOrders;
    setAcceptingOrders(nextState);
    try {
      await toggleAcceptingOrdersAction(nextState);
    } catch {
      setAcceptingOrders(!nextState);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setLoading(true);
    try {
      await createMenuCategoryAction({ name: categoryName, description: categoryDescription });
      setCategoryName("");
      setCategoryDescription("");
      setShowAddCategory(false);
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim() || !selectedCategoryId) return;
    setLoading(true);
    try {
      await createMenuItemAction({
        categoryId: selectedCategoryId,
        name: itemName,
        description: itemDescription,
        priceNpr: itemPriceNpr * 100, // Convert NPR to Paisa
        dietaryTag,
      });
      setItemName("");
      setItemDescription("");
      setShowAddItem(false);
    } catch (err: any) {
      alert(err.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailability(itemId: string, currentAvailability: boolean) {
    try {
      await updateMenuItemAction(itemId, { isAvailable: !currentAvailability });
    } catch (err: any) {
      alert(err.message || "Failed to update item availability");
    }
  }

  const publicMenuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/menu/public`;

  return (
    <div className="space-y-6">
      {/* Top Header Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold text-emerald-600 border-emerald-600 gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Live & Synced
          </Badge>
          <span className="text-xs text-muted-foreground">Changes apply instantly to phone menus.</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(publicMenuUrl)}
            className="text-xs gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" /> Copy Link
          </Button>
          <Link href="/menu/public" target="_blank">
            <Button size="sm" className="text-xs gap-1.5 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white">
              Open in browser <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Mobile Preview Simulator, Right Owner Controls */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Mobile Phone Frame Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-foreground">Guest Mobile Phone Live Preview</span>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode("PHONE")}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === "PHONE" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Phone
              </button>
              <button
                onClick={() => setViewMode("DESKTOP")}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === "DESKTOP" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
            </div>
          </div>

          {/* Phone Frame Container */}
          <div className="mx-auto max-w-sm rounded-[38px] border-[8px] border-slate-900 bg-slate-900 p-2 shadow-2xl overflow-hidden">
            <div className="h-[620px] w-full rounded-[28px] bg-amber-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 overflow-y-auto font-sans p-4 space-y-4">
              {/* Phone Header Banner */}
              <div className="rounded-xl bg-red-900 text-amber-50 p-4 text-center space-y-1 shadow-md">
                <Badge variant="outline" className="border-amber-200 text-amber-100 text-[9px] uppercase tracking-widest">
                  {acceptingOrders ? "ACCEPTING ORDERS" : "MENU ONLY (PAUSED)"}
                </Badge>
                <h2 className="text-xl font-extrabold tracking-wider font-serif uppercase">
                  {initialData.organizationName}
                </h2>
                <p className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider">
                  {initialData.settings?.headerSubtitle || "DINE-IN & TAKEAWAY AVAILABLE"}
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {initialData.categories.map((cat, idx) => (
                  <span
                    key={cat.id}
                    className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] whitespace-nowrap ${
                      idx === 0 ? "bg-red-900 text-amber-50 shadow-sm" : "bg-amber-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>

              {/* Category Items */}
              <div className="space-y-4">
                {initialData.categories.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <h3 className="font-serif font-extrabold uppercase text-sm border-b-2 border-red-900/30 pb-1 text-red-900 dark:text-amber-400">
                      {cat.name}
                    </h3>

                    <div className="space-y-2">
                      {cat.menuItems?.map((item: any) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border bg-white dark:bg-stone-800 shadow-sm space-y-2 ${
                            !item.isAvailable ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs uppercase tracking-wide">{item.name}</span>
                                {item.dietaryTag && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[8px] px-1 py-0 ${
                                      item.dietaryTag === "VEG"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-red-600 text-red-600"
                                    }`}
                                  >
                                    {item.dietaryTag}
                                  </Badge>
                                )}
                              </div>
                              {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
                            </div>
                            <span className="font-bold text-xs text-red-900 dark:text-amber-400 font-mono">
                              {formatCurrencyNPR(item.priceNpr)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t text-[10px]">
                            <span className="text-muted-foreground">{item.isAvailable ? "Available" : "Sold Out"}</span>
                            <button
                              disabled={!acceptingOrders || !item.isAvailable}
                              className="px-3 py-1 rounded bg-red-900 text-amber-50 font-bold uppercase tracking-wider text-[9px] disabled:opacity-50"
                            >
                              Add to Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Owner Controls & Editing Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Synced with your menu */}
          <Card className="border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-foreground">Synced with your menu</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Price and description changes apply instantly. Edit dish names, prices, and availability below.
                </p>
              </div>
              {canManage && (
                <Button size="sm" onClick={() => setShowAddItem(true)} className="gap-1 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5" /> Add Dish Item
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Accepting Orders Toggle */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-foreground">Accepting guest orders</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Guests can browse items and place orders directly from their phones.
                </p>
              </div>
              <Button
                variant={acceptingOrders ? "default" : "outline"}
                size="sm"
                onClick={handleToggleOrders}
                className="font-bold text-xs"
              >
                {acceptingOrders ? "Enabled" : "Paused"}
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Menu Item Editor List */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Utensils className="h-4 w-4 text-primary" /> Edit Dishes & Prices
              </CardTitle>
              {canManage && (
                <Button size="sm" variant="outline" onClick={() => setShowAddCategory(true)} className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3" /> New Category
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {initialData.categories.map((cat) => (
                <div key={cat.id} className="space-y-2 border-b pb-3">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{cat.name} ({cat.menuItems?.length || 0})</span>
                  </div>

                  <div className="space-y-1.5">
                    {cat.menuItems?.map((item: any) => (
                      <div key={item.id} className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{item.name}</span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {formatCurrencyNPR(item.priceNpr)}
                            </Badge>
                          </div>
                          {item.description && <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>}
                        </div>

                        {canManage && (
                          <Button
                            size="sm"
                            variant={item.isAvailable ? "outline" : "secondary"}
                            onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                            className="h-6 text-[10px]"
                          >
                            {item.isAvailable ? "Available" : "Sold Out"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Add Category */}
      {showAddCategory && (
        <Card className="max-w-md mx-auto border-primary/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Add Menu Category</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddCategory}>
            <CardContent className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Category Name *</label>
                <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Hot Drinks, Specials" required className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Description</label>
                <Input value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="e.g. Freshly brewed beverages" className="mt-1" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Category"}</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Modal: Add Menu Item */}
      {showAddItem && (
        <Card className="max-w-md mx-auto border-primary/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Add Dish / Menu Item</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddItem}>
            <CardContent className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Category *</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full h-9 rounded border bg-background px-3 mt-1 text-xs"
                >
                  {initialData.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold">Dish Name *</label>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Buff Steam Mo:Mo" required className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold">Price (NPR Rs) *</label>
                  <Input type="number" value={itemPriceNpr} onChange={(e) => setItemPriceNpr(parseInt(e.target.value, 10) || 0)} required className="mt-1 font-mono" />
                </div>
                <div>
                  <label className="font-semibold">Dietary Tag</label>
                  <select value={dietaryTag} onChange={(e) => setDietaryTag(e.target.value as any)} className="w-full h-9 rounded border bg-background px-2 mt-1 text-xs">
                    <option value="VEG">Vegetarian (VEG)</option>
                    <option value="NON_VEG">Non-Veg</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="GLUTEN_FREE">Gluten-Free</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold">Description</label>
                <Textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="e.g. Served with spicy tomato chutney" className="mt-1 min-h-[60px]" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Dish Item"}</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}
