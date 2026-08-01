import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Send, Trash2 } from "lucide-react";
import { formatPrice } from "@/data/products";
import { ProductThumb } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Savat — Baraka Moda" },
      { name: "description", content: "Savatdagi kiyimlar, yetkazib berish turi va buyurtmani admin orqali tasdiqlash." },
      { property: "og:title", content: "Savat — Baraka Moda" },
      { property: "og:description", content: "Buyurtmani rasmiylashtirish va admin bilan bog'lanish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const {
    cart,
    getProduct,
    setQty,
    removeFromCart,
    cartTotal,
    placeOrder,
    settings,
    adminLink,
  } = useShop();
  const [delivery, setDelivery] = useState<"courier" | "pickup">("courier");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const fee = delivery === "courier" && cart.length > 0 ? settings.deliveryFee : 0;
  const total = cartTotal + fee;

  const submit = () => {
    if (!name.trim() || phone.trim().length < 7 || (delivery === "courier" && !address.trim())) {
      haptic("warning");
      toast.error("Ma'lumotlarni to'ldiring", { description: "Ism, telefon va manzil kerak." });
      return;
    }
    const order = placeOrder({ delivery, address, phone, name, total });
    const lines = cart
      .map((i) => {
        const p = getProduct(i.productId);
        return `• ${p?.name ?? i.productId}${i.size ? ` (${i.size})` : ""} × ${i.qty}`;
      })
      .join("\n");
    const text = encodeURIComponent(
      `Yangi buyurtma #${order.id}\n${lines}\n\nJami: ${formatPrice(total)}\nIsm: ${name}\nTel: ${phone}\n${
        delivery === "courier" ? `Manzil: ${address}` : "Olib ketish"
      }`,
    );
    haptic("success");
    toast.success("Buyurtma yaratildi", { description: "Admin bilan bog'laning va to'lovni kelishing." });
    window.open(`${adminLink}?text=${text}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-5xl">🛍️</p>
        <h1 className="text-lg font-extrabold">Savat bo'sh</h1>
        <p className="text-sm text-muted-foreground">Katalogdan kiyim tanlang.</p>
        <Link
          to="/catalog"
          className="press inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Katalogga o'tish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-extrabold">Savat</h1>

      <div className="space-y-2">
        {cart.map((item) => {
          const p = getProduct(item.productId);
          if (!p) return null;
          return (
            <div
              key={`${item.productId}-${item.size ?? ""}`}
              className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl">
                <ProductThumb product={p} className="text-3xl" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                {item.size && (
                  <p className="text-[11px] text-muted-foreground">O'lcham: {item.size}</p>
                )}
                <p className="text-sm font-bold text-primary">{formatPrice(p.price * item.qty)}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    aria-label="Kamaytirish"
                    onClick={() => {
                      haptic("light");
                      setQty(item.productId, item.size, item.qty - 1);
                    }}
                    className="press grid size-8 place-items-center rounded-lg bg-secondary"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                  <button
                    type="button"
                    aria-label="Ko'paytirish"
                    onClick={() => {
                      haptic("light");
                      setQty(item.productId, item.size, item.qty + 1);
                    }}
                    className="press grid size-8 place-items-center rounded-lg bg-secondary"
                  >
                    <Plus className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="O'chirish"
                    onClick={() => {
                      haptic("warning");
                      removeFromCart(item.productId, item.size);
                    }}
                    className="press ml-auto grid size-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Yetkazib berish</h2>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "courier", label: `Kuryer · ${formatPrice(settings.deliveryFee)}` },
              { id: "pickup", label: "Olib ketish · bepul" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                haptic("light");
                setDelivery(o.id);
              }}
              className={cn(
                "press rounded-xl border px-3 py-2.5 text-xs font-semibold",
                delivery === o.id ? "border-primary bg-secondary text-primary" : "border-border bg-card",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Ma'lumotlaringiz</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Ismingiz"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          inputMode="tel"
          placeholder="+998 90 123 45 67"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        {delivery === "courier" && (
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={200}
            placeholder="Manzil (tuman, ko'cha, uy)"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        )}
      </section>

      <section className="space-y-1.5 rounded-2xl bg-card p-4 text-sm shadow-soft">
        <Row label="Mahsulotlar" value={formatPrice(cartTotal)} />
        <Row label="Yetkazib berish" value={fee ? formatPrice(fee) : "Bepul"} />
        <div className="flex items-center justify-between border-t border-border pt-2 text-base font-extrabold">
          <span>Jami</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
        <p className="pt-1 text-[11px] text-muted-foreground">
          To'lov admin bilan Telegram orqali kelishiladi (@{settings.adminUsername}).
        </p>
      </section>

      <button
        type="button"
        onClick={submit}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-float"
      >
        <Send className="size-4" /> Buyurtmani adminga yuborish
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
