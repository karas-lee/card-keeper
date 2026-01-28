"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile navigation */}
        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header onMobileMenuOpen={() => setMobileNavOpen(true)} />

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
