import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { formatPrice, type Product } from "@/data/products";
import { useShop } from "@/store/shop";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={cn("size-full object-cover", className)}
      />
    );
  }
  return (
    <span aria-hidden className={cn("grid size-full place-items-center bg-tile-gradient text-6xl", className)}>
      {product.emoji}
    </span>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { favorites, toggleFavorite, addToCart } = useShop();
  const liked = favorites.includes(product.id);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <article
      className="animate-rise flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden">
        <ProductThumb product={product} />
        <button
          type="button"
          aria-label="Sevimlilarga qo'shish"
          onClick={(e) => {
            e.preventDefault();
            haptic(liked ? "light" : "success");
            toggleFavorite(product.id);
          }}
          className="press absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-card/85 backdrop-blur"
        >
          <Heart
            className={cn(
              "size-[18px] transition-all",
              liked ? "scale-110 fill-destructive text-destructive" : "text-muted-foreground",
            )}
          />
        </button>
        {product.isNew && (
          <span className="absolute left-2 top-2 rounded-md bg-gold-gradient px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
            YANGI
          </span>
        )}
        {discount > 0 && (
          <span className="absolute bottom-2 left-2 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
            ARZON NARX
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-extrabold text-primary">
            {product.price.toLocaleString("ru-RU")}
          </span>
          {discount > 0 && (
            <span className="text-xs font-bold text-destructive">↓{discount}%</span>
          )}
        </div>
        {product.oldPrice && (
          <span className="text-[11px] text-muted-foreground line-through">
            {product.oldPrice.toLocaleString("ru-RU")} so'm
          </span>
        )}
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 min-h-9 text-[13px] leading-[1.15rem]"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="size-3 fill-accent text-accent" />
          {product.rating} · {product.sold} sotildi
        </div>
        <button
          type="button"
          onClick={() => {
            haptic("success");
            addToCart(product.id, product.sizes?.[0]);
            toast.success("Savatga qo'shildi", { description: product.name });
          }}
          className="press mt-auto w-full rounded-xl bg-secondary py-2 text-xs font-bold text-secondary-foreground"
        >
          Savatga
        </button>
      </div>
    </article>
  );
}

export { formatPrice };
