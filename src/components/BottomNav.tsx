import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useShop } from "@/store/shop";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Bosh sah.", icon: Home },
  { to: "/catalog", label: "Katalog", icon: LayoutGrid },
  { to: "/cart", label: "Savat", icon: ShoppingBag },
  { to: "/favorites", label: "Sevimli", icon: Heart },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const { cartCount, favorites } = useShop();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          const badge = to === "/cart" ? cartCount : to === "/favorites" ? favorites.length : 0;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                onClick={() => haptic("light")}
                className={cn(
                  "press relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[10px] font-semibold transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative grid size-9 place-items-center rounded-2xl transition-all duration-300",
                    active ? "-translate-y-0.5 bg-secondary shadow-soft" : "bg-transparent",
                  )}
                >
                  <Icon className={cn("size-[21px] transition-transform duration-300", active && "scale-110")} />
                  {badge > 0 && (
                    <span className="absolute -right-1 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate">{label}</span>
              </Link>

            </li>
          );
        })}
      </ul>
    </nav>
  );
}
