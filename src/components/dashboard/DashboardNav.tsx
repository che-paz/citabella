"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CreditCard,
  LayoutGrid,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
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
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/agenda", label: "Agenda", icon: Calendar, placeholder: true },
  { href: "/clientas", label: "Clientas", icon: Users, placeholder: true },
  { href: "/pagos", label: "Pagos", icon: CreditCard, placeholder: true },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.placeholder && !isActive && "opacity-70"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
            {item.placeholder && (
              <span className="ml-auto text-xs opacity-60">Próximo</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardNav({ user }: { user: AuthUser }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-semibold">CitaBella</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <NavLinks />
          <div className="mt-auto space-y-3 pt-4">
            <Separator />
            <div className="px-3 text-sm">
              <p className="font-medium truncate">{user.salon.nombre}</p>
              <p className="text-muted-foreground truncate">{user.nombre}</p>
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
        </div>
      </aside>

      {/* Mobile header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
        <span className="text-lg font-semibold">CitaBella</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>{user.salon.nombre}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-1 flex-col">
              <NavLinks />
              <div className="mt-auto space-y-3 pt-6">
                <Separator />
                <p className="px-3 text-sm text-muted-foreground">{user.nombre}</p>
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
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
