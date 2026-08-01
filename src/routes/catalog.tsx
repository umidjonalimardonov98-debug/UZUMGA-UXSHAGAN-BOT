import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { categories } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";

type Sort = "popular" | "cheap" | "expensive" | "new";

export const Route = createFileRoute("/catalog")({
  validateSearch: (s: Record<string, unknown>) => ({ cat: (s.cat as string) || "" }),
  head: () => ({
    meta: [
      { title: "Katalog — Baraka Moda kiyimlari" },
      {
        name: "description",
        content: "Kiyimlar katalogi: qidiruv, kategoriya bo'yicha filtr va narx bo'yicha saralash.",
      },
      { property: "og:title", content: "Katalog — Baraka Moda" },
      { property: "og:description", content: "Erkaklar, ayollar va bolalar kiyimlari katalogi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { cat } = Route.useSearch();
  const { products } = useShop();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(cat);
  const [sort, setSort] = useState<Sort>("popular");

  const list = useMemo(() => {
    let r = products.filter(
      (p) =>
        (!active || p.category === active) &&
        (!q || p.name.toLowerCase().includes(q.toLowerCase())),
    );
    r = [...r].sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "expensive") return b.price - a.price;
      if (sort === "new") return Number(!!b.isNew) - Number(!!a.isNew);
      return b.sold - a.sold;
    });
    return r;
  }, [products, active, q, sort]);

  const sorts: { id: Sort; label: string }[] = [
    { id: "popular", label: "Ommabop" },
    { id: "cheap", label: "Arzon" },
    { id: "expensive", label: "Qimmat" },
    { id: "new", label: "Yangi" },
  ];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
        <Search className="size-[18px] text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Kiyim qidirish..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip label="Hammasi" active={!active} onClick={() => setActive("")} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={`${c.emoji} ${c.name}`}
            active={active === c.id}
            onClick={() => setActive(c.id)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <SlidersHorizontal className="size-4" />
        {sorts.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              haptic("light");
              setSort(s.id);
            }}
            className={cn(
              "press rounded-full px-3 py-1.5 font-semibold",
              sort === s.id ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{list.length} ta mahsulot topildi</p>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
          Hech narsa topilmadi 🙁
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic("light");
        onClick();
      }}
      className={cn(
        "press shrink-0 rounded-full px-4 py-2 text-xs font-semibold",
        active ? "bg-primary text-primary-foreground" : "bg-card shadow-soft",
      )}
    >
      {label}
    </button>
  );
}
