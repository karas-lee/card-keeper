"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  ScanLine,
  FolderOpen,
  Tags,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { href: "/cards", label: "Home", icon: CreditCard },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/folders", label: "Folders", icon: FolderOpen },
  { href: "/tags", label: "Tags", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-gray-200 px-6 py-4">
          <SheetTitle className="text-xl font-bold text-primary-600">
            CardKeeper
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-2 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
