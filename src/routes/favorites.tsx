import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Sevimlilar — Baraka Moda" },
      { name: "description", content: "Saqlangan kiyimlar ro'yxati va tez xarid qilish." },
      { property: "og:title", content: "Sevimlilar — Baraka Moda" },
      { property: "og:description", content: "Yoqtirgan kiyimlaringiz bir joyda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { favorites, getProduct } = useShop();
  const list = favorites.map(getProduct).filter(Boolean);

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-extrabold">Sevimlilar</h1>
      {list.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
          Hozircha bo'sh. ❤️ tugmasi orqali kiyimlarni saqlang.{" "}
          <Link to="/catalog" className="font-semibold text-primary">
            Katalog
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {list.map((p, i) => p && <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
