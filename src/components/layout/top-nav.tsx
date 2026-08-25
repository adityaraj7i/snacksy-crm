"use client";

import { useState, useEffect } from "react";
import { Menu, MapPin, User, ChevronDown, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/auth/actions";

interface TopNavProps {
  onMobileMenuOpen: () => void;
  user?: {
    fullName: string;
    role: string;
  };
}

export function TopNav({ onMobileMenuOpen, user }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/95 px-4 sm:px-6 backdrop-blur transition-all">
      {/* Left side: Mobile menu toggle + Branch Selector */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuOpen}
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Branch Selector Dropdown */}
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>Snacksy Kirtipur</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border bg-background p-1 pl-3 text-xs font-medium shadow-sm hover:bg-accent transition-colors"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-foreground font-semibold leading-tight">
                {user?.fullName || "Staff User"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {user?.role || "Staff"}
              </span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-card p-1 shadow-lg z-50 text-xs">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
