import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Copy,
  Heart,
  LayoutGrid,
  MessageCircle,
  Package,
  Phone,
  Send,
  Settings as SettingsIcon,
  ShoppingBag,
} from "lucide-react";
import { formatPrice } from "@/data/products";
import { useShop, type OrderStatus } from "@/store/shop";
import { useTelegramUser, haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil — Baraka Shop" },
      {
        name: "description",
        content: "Telegram profilingiz, buyurtmalaringiz tarixi, sevimlilar, til va admin bilan aloqa.",
      },
      { property: "og:title", content: "Profil — Baraka Shop" },
      { property: "og:description", content: "Buyurtmalar holati, sevimlilar va aloqa." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

const statusLabels: Record<OrderStatus, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  shipped: "Yuborildi",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

function Profile() {
  const tgUser = useTelegramUser();
  const { orders, favorites, cartCount, getProduct, cancelOrder, lang, setLang, settings, adminLink } =
    useShop();
  const fullName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ") || "Mehmon";
  const tgLink = tgUser?.username ? `https://t.me/${tgUser.username}` : adminLink;

  const copy = (text: string, label: string) => {
    haptic("light");
    navigator.clipboard?.writeText(text).then(
      () => toast.success(`${label} nusxalandi`),
      () => toast.error("Nusxalab bo'lmadi"),
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Compact Telegram identity card */}
      <header className="animate-rise overflow-hidden rounded-3xl bg-hero-gradient p-4 text-primary-foreground shadow-float">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-card/25 text-lg font-bold ring-2 ring-primary-foreground/30">
            {tgUser?.photo_url ? (
              <img
                src={tgUser.photo_url}
                alt={fullName}
                width={56}
                height={56}
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              fullName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="flex min-w-0 items-center gap-1 text-base font-bold">
              <span className="truncate">{fullName}</span>
              {tgUser?.id && <BadgeCheck className="size-4 shrink-0 opacity-80" />}
            </h1>
            {tgUser?.username && (
              <a
                href={tgLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => haptic("light")}
                className="press inline-block truncate text-xs opacity-90 underline-offset-2 hover:underline"
              >
                @{tgUser.username}
              </a>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => copy(String(tgUser?.id ?? "—"), "ID")}
                className="press inline-flex items-center gap-1 rounded-full bg-card/20 px-2 py-0.5 text-[10px] font-semibold"
              >
                ID: {tgUser?.id ?? "—"} <Copy className="size-3" />
              </button>
              {tgUser?.language_code && (
                <span className="rounded-full bg-card/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {tgUser.language_code}
                </span>
              )}
              <a
                href={tgLink}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex items-center gap-1 rounded-full bg-card/20 px-2 py-0.5 text-[10px] font-semibold"
              >
                <Send className="size-3" /> Telegram
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        <Stat to="/profile" icon={<Package className="size-4" />} value={orders.length} label="Buyurtma" />
        <Stat to="/favorites" icon={<Heart className="size-4" />} value={favorites.length} label="Sevimli" />
        <Stat to="/cart" icon={<ShoppingBag className="size-4" />} value={cartCount} label="Savat" />
      </div>

      {/* Animated inline buttons */}
      <nav className="grid grid-cols-2 gap-2">
        <Tile to="/catalog" icon={<LayoutGrid className="size-5" />} label="Katalog" />
        <Tile to="/favorites" icon={<Heart className="size-5" />} label="Sevimlilar" />
        <Tile to="/cart" icon={<ShoppingBag className="size-5" />} label="Savat" />
        <Tile to="/admin" icon={<SettingsIcon className="size-5" />} label="Admin panel" />
      </nav>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Buyurtmalarim</h2>
        {orders.length === 0 ? (
          <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-soft">
            Hozircha buyurtmangiz yo'q.
          </p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="space-y-2 rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">#{o.id}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                    o.status === "cancelled"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {statusLabels[o.status]}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {new Date(o.createdAt).toLocaleString("uz-UZ")} ·{" "}
                {o.delivery === "courier" ? "Kuryer" : "Olib ketish"}
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {o.items.map((it) => (
                  <li key={`${it.productId}-${it.size ?? ""}`}>
                    {getProduct(it.productId)?.emoji} {getProduct(it.productId)?.name} × {it.qty}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-primary">{formatPrice(o.total)}</span>
                {o.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      haptic("warning");
                      cancelOrder(o.id);
                      toast("Buyurtma bekor qilindi", { description: `#${o.id}` });
                    }}
                    className="press rounded-xl bg-secondary px-3 py-1.5 text-[11px] font-medium"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Til</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["uz", "ru"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                haptic("light");
                setLang(l);
              }}
              className={cn(
                "press rounded-2xl border py-2.5 text-sm font-medium transition-all duration-200",
                lang === l
                  ? "border-primary bg-secondary shadow-soft"
                  : "border-border bg-card hover:-translate-y-0.5",
              )}
            >
              {l === "uz" ? "🇺🇿 O'zbekcha" : "🇷🇺 Русский"}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-1 rounded-2xl bg-card p-4 shadow-soft">
        <h2 className="mb-1 text-sm font-bold">Aloqa</h2>
        <ContactRow href={`tel:${settings.phone}`} icon={<Phone className="size-4 text-primary" />}>
          {settings.phone}
        </ContactRow>
        <ContactRow href={adminLink} external icon={<Send className="size-4 text-primary" />}>
          Admin: @{settings.adminUsername}
        </ContactRow>
        {settings.channel && (
          <ContactRow
            href={`https://t.me/${settings.channel.replace(/^@/, "")}`}
            external
            icon={<MessageCircle className="size-4 text-primary" />}
          >
            Kanal: @{settings.channel.replace(/^@/, "")}
          </ContactRow>
        )}
      </section>
    </div>
  );
}

function Stat({
  to,
  icon,
  value,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => haptic("light")}
      className="press rounded-2xl bg-card p-3 text-center shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
    >
      <span className="mx-auto grid size-8 place-items-center rounded-xl bg-secondary text-primary">
        {icon}
      </span>
      <p className="mt-1.5 text-base font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </Link>
  );
}

function Tile({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      onClick={() => haptic("light")}
      className="press group flex items-center gap-2.5 rounded-2xl bg-card p-3.5 text-sm font-semibold shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float active:scale-[0.97]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tile-gradient text-primary transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}

function ContactRow({
  href,
  external,
  icon,
  children,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      onClick={() => haptic("light")}
      className="press flex items-center gap-2 rounded-xl px-1 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
    >
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </a>
  );
}
