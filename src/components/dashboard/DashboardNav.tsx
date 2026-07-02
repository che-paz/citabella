"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { SalonBrand } from "@/components/dashboard/SalonBrand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { AuthUser } from "@/types/database";

const navItems = [
  { href: "/", label: "Inicio", icon: Home, exact: true },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/clientas", label: "Clientas", icon: Users },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/pagos", label: "Pagos", icon: CreditCard, adminOnly: true },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

function NavLinks({
  onNavigate,
  isAdmin,
}: {
  onNavigate?: () => void;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

function SidebarFooter({ user }: { user: AuthUser }) {
  return (
    <div className="mt-auto space-y-3 pt-4">
      <Separator />
      <div className="px-3 text-sm">
        <p className="font-medium truncate">{user.nombre}</p>
        <p className="text-muted-foreground truncate">{user.email}</p>
      </div>
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

export function DashboardNav({ user }: { user: AuthUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user.rol === "admin_salon";
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border/80 px-4">
          <SalonBrand
            nombre={user.salon.nombre}
            logoUrl={user.salon.logo_url}
            compact
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <NavLinks isAdmin={isAdmin} />
          <SidebarFooter user={user} />
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/80 bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
        <SalonBrand
          nombre={user.salon.nombre}
          logoUrl={user.salon.logo_url}
          compact
          className="min-w-0 flex-1 pr-2"
        />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col">
            <SheetHeader>
              <SheetTitle className="text-left">
                <SalonBrand
                  nombre={user.salon.nombre}
                  logoUrl={user.salon.logo_url}
                  compact
                />
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-1 flex-col">
              <NavLinks isAdmin={isAdmin} onNavigate={closeMobile} />
              <SidebarFooter user={user} />
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
