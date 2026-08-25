"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CRM_NAV_ITEMS, BUSINESS_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { X, Coffee } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex w-4/5 max-w-xs flex-col bg-card text-card-foreground p-4 shadow-xl z-50 border-r">
        <div className="flex items-center justify-between border-b pb-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Coffee className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              {BUSINESS_NAME}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 py-2">
          {CRM_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            if (!item.isImplemented) {
              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground/60"
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
