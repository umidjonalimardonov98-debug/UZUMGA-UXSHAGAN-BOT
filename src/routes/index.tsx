import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Search, Heart, MapPin } from "lucide-react";
import { categories } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { useTelegramUser } from "@/lib/telegram";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baraka Shop — kiyim-kechak do'koni | Onlayn xarid" },
      {
        name: "description",
        content:
          "Erkaklar, ayollar va bolalar kiyimlari: arzon narx, tez yetkazib berish. Buyurtma to'g'ridan-to'g'ri admin orqali.",
      },
      { property: "og:title", content: "Baraka Shop — kiyim-kechak do'koni" },
      {
        property: "og:description",
        content: "Zamonaviy kiyimlar katalogi, chegirmalar va tezkor yetkazib berish.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
  }),
  component: Home,
});

function Home() {
  const tgUser = useTelegramUser();
  const { products, settings, favorites } = useShop();
  const navigate = useNavigate();

  const sale = products.filter((p) => p.oldPrice).slice(0, 6);
  const fresh = products.filter((p) => p.isNew).slice(0, 6);
  const all = products.slice(0, 12);

  return (
    <div className="space-y-5 pb-4">
      <header className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 font-semibold">
            <MapPin className="size-4 text-primary" /> Toshkent
          </span>
          <span className="text-xs text-muted-foreground">yetkazib beriladigan shahar</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/catalog" })}
            className="press flex flex-1 items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground"
          >
            <Search className="size-[18px]" />
            Kiyim va toifalarni qidirish
          </button>
          <Link
            to="/favorites"
            className="press relative grid size-11 shrink-0 place-items-center rounded-2xl bg-muted"
            aria-label="Sevimlilar"
          >
            <Heart className="size-5" />
            {favorites.length > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {favorites.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="animate-rise space-y-2 rounded-3xl bg-hero-gradient p-5 text-primary-foreground shadow-float">
        <p className="text-xs opacity-90">
          Assalomu alaykum{tgUser?.first_name ? `, ${tgUser.first_name}` : ""} 👋
        </p>
        <h1 className="text-xl font-extrabold leading-tight">
          {settings.shopName} — mavsumiy chegirmalar 70% gacha
        </h1>
        <p className="text-xs opacity-90">
          Faqat kiyim: erkaklar, ayollar, bolalar. To'lov va yetkazish admin orqali.
        </p>
        <Link
          to="/catalog"
          className="press mt-2 inline-flex items-center gap-1 rounded-xl bg-card px-4 py-2 text-sm font-bold text-primary"
        >
          Xarid qilish <ChevronRight className="size-4" />
        </Link>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/catalog"
              search={{ cat: c.id }}
              className="press flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-soft"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-tile-gradient text-2xl">
                {c.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {sale.length > 0 && (
        <Section title="Wow foyda" to="/catalog">
          <div className="grid grid-cols-2 gap-2.5">
            {sale.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </Section>
      )}

      {fresh.length > 0 && (
        <Section title="Yangi kelganlar" to="/catalog">
          <div className="grid grid-cols-2 gap-2.5">
            {fresh.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Barcha mahsulotlar" to="/catalog">
        <div className="grid grid-cols-2 gap-2.5">
          {all.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  to,
  children,
}: {
  title: string;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold">{title}</h2>
        <Link to={to} className="flex items-center text-xs font-semibold text-primary">
          Barchasi <ChevronRight className="size-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}
