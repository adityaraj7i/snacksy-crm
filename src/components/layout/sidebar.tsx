"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CRM_NAV_ITEMS, BUSINESS_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingBag,
  Award,
  Filter,
  Send,
  Zap,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Puzzle,
  UserCheck,
  ShieldAlert,
  Settings,
  Coffee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingBag,
  Award,
  Filter,
  Send,
  Zap,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Puzzle,
  UserCheck,
  ShieldAlert,
  Settings,
};

export function Sidebar({
  className,
  userPermissions = [],
}: {
  className?: string;
  userPermissions?: string[];
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card text-card-foreground w-64 min-h-screen shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Coffee className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight tracking-tight text-foreground">
            {BUSINESS_NAME}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            CRM Portal
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {CRM_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
          const isActive = pathname === item.href;

          if (!item.isImplemented) {
            return (
              <div
                key={item.title}
                className="group relative flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground/60 cursor-not-allowed hover:bg-accent/40"
                title={`Module ${item.title} scheduled for ${item.badge}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 opacity-50" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 opacity-60">
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
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Context Info */}
      <div className="p-4 border-t text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Snacksy Kirtipur Branch</p>
        <p>Location: Kathmandu, Nepal</p>
        <p>Currency: NPR (रू)</p>
      </div>
    </aside>
  );
}
