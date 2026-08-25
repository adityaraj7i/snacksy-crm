"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    fullName: string;
    role: string;
    permissions: string[];
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" userPermissions={user?.permissions} />

      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav onMobileMenuOpen={() => setMobileMenuOpen(true)} user={user} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
