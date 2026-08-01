import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, Send, Star, Truck } from "lucide-react";
import { formatPrice } from "@/data/products";
import { ProductThumb } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Mahsulot — Baraka Moda" },
      { name: "description", content: "Kiyim haqida to'liq ma'lumot: narx, o'lcham, rang va yetkazib berish." },
      { property: "og:title", content: "Mahsulot — Baraka Moda" },
      { property: "og:description", content: "Kiyim tavsifi, o'lchamlari va narxi." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { getProduct, addToCart, favorites, toggleFavorite, adminLink, settings } = useShop();
  const product = getProduct(id);
  const [size, setSize] = useState<string | undefined>(undefined);

  if (!product) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">Mahsulot topilmadi.</p>
        <Link to="/catalog" className="text-sm font-semibold text-primary">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const liked = favorites.includes(product.id);
  const chosen = size ?? product.sizes?.[0];
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/catalog" })}
          className="press grid size-10 place-items-center rounded-full bg-card shadow-soft"
          aria-label="Orqaga"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            haptic(liked ? "light" : "success");
            toggleFavorite(product.id);
          }}
          className="press grid size-10 place-items-center rounded-full bg-card shadow-soft"
          aria-label="Sevimlilar"
        >
          <Heart className={cn("size-5", liked && "fill-destructive text-destructive")} />
        </button>
      </div>

      <div className="animate-rise aspect-square overflow-hidden rounded-3xl bg-card shadow-soft">
        <ProductThumb product={product} className="text-[8rem]" />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-primary">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <span className="rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
              -{discount}%
            </span>
          )}
        </div>
        {product.oldPrice && (
          <p className="text-sm text-muted-foreground line-through">
            {formatPrice(product.oldPrice)}
          </p>
        )}
        <h1 className="text-lg font-bold leading-snug">{product.name}</h1>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-accent text-accent" />
          {product.rating} · {product.sold} sotildi
          {typeof product.stock === "number" && ` · omborda ${product.stock} ta`}
        </p>
      </div>

      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold">O'lcham</h2>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  haptic("light");
                  setSize(s);
                }}
                className={cn(
                  "press min-w-12 rounded-xl border px-3 py-2 text-sm font-semibold",
                  chosen === s ? "border-primary bg-secondary text-primary" : "border-border bg-card",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold">Rang</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {product.colors.map((c) => (
              <span key={c} className="rounded-xl bg-secondary px-3 py-2 font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="space-y-1.5 rounded-2xl bg-card p-4 shadow-soft">
        <h2 className="text-sm font-bold">Tavsif</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
      </section>

      <section className="flex items-start gap-3 rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-soft">
        <Truck className="size-5 shrink-0 text-primary" />
        <p>
          Yetkazib berish {formatPrice(settings.deliveryFee)} · To'lov va yetkazish shartlari admin
          bilan kelishiladi.
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-[68px] z-40 mx-auto flex max-w-lg gap-2 px-4">
        <a
          href={adminLink}
          target="_blank"
          rel="noreferrer"
          className="press grid size-12 shrink-0 place-items-center rounded-2xl bg-card shadow-float"
          aria-label="Adminga yozish"
        >
          <Send className="size-5 text-primary" />
        </a>
        <button
          type="button"
          onClick={() => {
            haptic("success");
            addToCart(product.id, chosen);
            toast.success("Savatga qo'shildi", { description: product.name });
          }}
          className="press flex-1 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-float"
        >
          Savatga qo'shish
        </button>
      </div>
    </div>
  );
}
