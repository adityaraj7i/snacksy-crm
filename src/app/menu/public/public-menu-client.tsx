"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyNPR } from "@/lib/utils";
import { ShoppingBag, CheckCircle2, Utensils, AlertTriangle, Plus, Minus, X } from "lucide-react";

interface PublicMenuClientProps {
  initialData: {
    organizationId: string;
    organizationName: string;
    categories: any[];
    settings: any;
  };
  preselectedTable?: string;
}

export function PublicMenuClient({ initialData, preselectedTable }: PublicMenuClientProps) {
  const [cart, setCart] = useState<Array<{ item: any; quantity: number }>>([]);
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [tableNumber, setTableNumber] = useState(preselectedTable || "");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const acceptingOrders = initialData.settings?.acceptingOrders ?? true;

  function addToCart(item: any) {
    if (!acceptingOrders || !item.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
      }
      return prev.filter((c) => c.item.id !== itemId);
    });
  }

  const cartTotalNpr = cart.reduce((sum, c) => sum + c.item.priceNpr * c.quantity, 0);

  function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderSubmitted(true);
  }

  if (orderSubmitted) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-serif font-extrabold text-stone-900 dark:text-stone-100">Order Received!</h1>
        <p className="text-xs text-muted-foreground">
          Thank you {guestName || "Guest"}! Your order has been placed successfully and sent to our kitchen.
        </p>
        {tableNumber && (
          <Badge variant="outline" className="text-xs font-mono border-emerald-600 text-emerald-600 px-3 py-1">
            Table {tableNumber}
          </Badge>
        )}
        <Button onClick={() => { setCart([]); setOrderSubmitted(false); }} className="bg-red-900 text-amber-50 text-xs font-semibold mt-4">
          Place Another Order
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      {/* Mobile Top Header Banner */}
      <div className="rounded-2xl bg-red-900 text-amber-50 p-6 text-center space-y-2 shadow-lg">
        <Badge variant="outline" className="border-amber-200 text-amber-100 text-[10px] uppercase tracking-widest">
          {acceptingOrders ? "ACCEPTING ORDERS" : "MENU ONLY (PAUSED)"}
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-wider font-serif uppercase">
          {initialData.organizationName}
        </h1>
        <p className="text-xs text-amber-200 font-semibold uppercase tracking-wider">
          {initialData.settings?.headerSubtitle || "DINE-IN & TAKEAWAY AVAILABLE"}
        </p>
        {tableNumber && (
          <Badge className="bg-amber-100 text-red-900 text-xs font-bold px-3 py-1 mt-2">
            Table {tableNumber} Pre-Selected
          </Badge>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {initialData.categories.map((cat, idx) => (
          <a
            key={cat.id}
            href={`#cat-${cat.id}`}
            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-[11px] whitespace-nowrap shadow-sm transition-colors ${
              idx === 0 ? "bg-red-900 text-amber-50" : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border"
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Category Dishes List */}
      <div className="space-y-6">
        {initialData.categories.map((cat) => (
          <div key={cat.id} id={`cat-${cat.id}`} className="space-y-3">
            <h2 className="font-serif font-extrabold uppercase text-base border-b-2 border-red-900/40 pb-1 text-red-900 dark:text-amber-400">
              {cat.name}
            </h2>

            <div className="space-y-3">
              {cat.menuItems?.map((item: any) => {
                const inCartCount = cart.find((c) => c.item.id === item.id)?.quantity || 0;
                return (
                  <Card key={item.id} className={`shadow-sm ${!item.isAvailable ? "opacity-50" : ""}`}>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground uppercase tracking-wide">{item.name}</span>
                            {item.dietaryTag && (
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 ${
                                  item.dietaryTag === "VEG"
                                    ? "border-emerald-600 text-emerald-600"
                                    : "border-red-600 text-red-600"
                                }`}
                              >
                                {item.dietaryTag}
                              </Badge>
                            )}
                          </div>
                          {item.description && <p className="text-xs text-muted-foreground mt-1 font-sans">{item.description}</p>}
                        </div>
                        <span className="font-bold text-sm text-red-900 dark:text-amber-400 font-mono">
                          {formatCurrencyNPR(item.priceNpr)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-xs">
                        <span className="text-muted-foreground text-[11px]">
                          {item.isAvailable ? "In Stock" : "Sold Out"}
                        </span>

                        {inCartCount > 0 ? (
                          <div className="flex items-center gap-2 bg-red-900 text-amber-50 rounded-lg px-2 py-1">
                            <button onClick={() => removeFromCart(item.id)} className="p-0.5">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-bold text-xs font-mono">{inCartCount}</span>
                            <button onClick={() => addToCart(item)} className="p-0.5">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!acceptingOrders || !item.isAvailable}
                            onClick={() => addToCart(item)}
                            className="bg-red-900 hover:bg-red-950 text-amber-50 font-bold uppercase tracking-wider text-[10px] h-7 px-3"
                          >
                            Add to Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Cart Bar & Checkout */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-stone-900 border-t shadow-2xl z-30 max-w-md mx-auto rounded-t-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-foreground text-sm font-mono">{formatCurrencyNPR(cartTotalNpr)}</span>
              <span className="text-muted-foreground ml-2">({cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
            </div>
            <form onSubmit={handleSubmitOrder}>
              <Button type="submit" className="bg-red-900 hover:bg-red-950 text-amber-50 font-bold text-xs px-6 py-2">
                Send Order to Kitchen
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
