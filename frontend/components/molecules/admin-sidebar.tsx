"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, LogOut, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminSidebarProps {
  organizationName?: string;
  onLogout?: () => void;
  onClose?: () => void;
  showThemeToggle?: boolean;
}

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Produtos", href: "/admin/products" },
  { icon: ShoppingBag, label: "Pedidos", href: "/admin/orders" },
];

export function AdminSidebar({
  organizationName = "Minha ONG",
  onLogout,
  onClose,
}: Readonly<AdminSidebarProps>) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Logo href={null} />
          <div className="ml-auto flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6 relative">
          <div className="absolute top-0 right-0 z-10">
            <ThemeToggle />
          </div>
          <div className="px-3 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Organização
            </p>
            <p className="text-sm font-semibold truncate">{organizationName}</p>
          </div>
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
