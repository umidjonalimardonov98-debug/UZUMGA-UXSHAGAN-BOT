import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { categories, defaultSizes, formatPrice, type Product } from "@/data/products";
import { useShop, type OrderStatus, type Settings } from "@/store/shop";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Baraka Moda" },
      { name: "description", content: "Mahsulot qo'shish, buyurtmalarni boshqarish va do'kon sozlamalari." },
      { property: "og:title", content: "Admin panel — Baraka Moda" },
      { property: "og:description", content: "Do'kon boshqaruvi: mahsulotlar, buyurtmalar, sozlamalar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const statusList: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const statusLabels: Record<OrderStatus, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  shipped: "Yuborildi",
  delivered: "Yetkazildi",
  cancelled: "Bekor",
};

const emptyForm = {
  id: "",
  name: "",
  category: categories[0].id,
  price: "",
  oldPrice: "",
  emoji: "👕",
  image: "",
  sizes: "S, M, L, XL",
  colors: "",
  stock: "",
  isNew: false,
  description: "",
};

function Admin() {
  const { settings } = useShop();
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);

  if (!ok) {
    return (
      <div className="space-y-4 py-16">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-hero-gradient text-primary-foreground shadow-float">
          <Lock className="size-7" />
        </div>
        <h1 className="text-center text-lg font-extrabold">Admin panel</h1>
        <p className="text-center text-sm text-muted-foreground">PIN kodni kiriting</p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          inputMode="numeric"
          maxLength={12}
          placeholder="PIN"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            if (pin === settings.adminPin) {
              haptic("success");
              setOk(true);
            } else {
              haptic("warning");
              toast.error("PIN noto'g'ri");
            }
          }}
          className="press w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
        >
          Kirish
        </button>
      </div>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const {
    products,
    orders,
    settings,
    saveProduct,
    deleteProduct,
    setOrderStatus,
    updateSettings,
    getProduct,
  } = useShop();
  const [tab, setTab] = useState<"products" | "orders" | "settings">("products");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [conf, setConf] = useState<Settings>(settings);

  const set = (k: keyof typeof emptyForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onPickFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayli");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Rasm 3MB dan kichik bo'lsin");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("image", String(reader.result));
      haptic("success");
      toast.success("Rasm yuklandi");
    };
    reader.readAsDataURL(file);
  };


  const submit = () => {
    if (!form.name.trim() || !Number(form.price)) {
      haptic("warning");
      toast.error("Nomi va narxi kerak");
      return;
    }
    const p: Product = {
      id: form.id || `p${Date.now().toString().slice(-7)}`,
      name: form.name.trim().slice(0, 120),
      category: form.category,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice) || undefined,
      emoji: form.emoji || "👕",
      image: form.image.trim() || undefined,
      rating: 4.7,
      sold: 0,
      isNew: form.isNew,
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number(form.stock) || undefined,
      description: form.description.trim().slice(0, 600) || "Tavsif kiritilmagan.",
    };
    saveProduct(p);
    haptic("success");
    toast.success(editing ? "Mahsulot yangilandi" : "Mahsulot qo'shildi", { description: p.name });
    setForm(emptyForm);
    setEditing(false);
  };

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-extrabold">Admin panel</h1>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["products", "Mahsulotlar"],
            ["orders", "Buyurtmalar"],
            ["settings", "Sozlamalar"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              haptic("light");
              setTab(id);
            }}
            className={cn(
              "press rounded-xl py-2.5 text-xs font-bold",
              tab === id ? "bg-primary text-primary-foreground" : "bg-card shadow-soft",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <>
          <section className="space-y-2 rounded-2xl bg-card p-4 shadow-soft">
            <h2 className="text-sm font-bold">
              {editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
            </h2>
            <Field label="Nomi">
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Kategoriya">
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Narx (so'm)">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </Field>
              <Field label="Eski narx">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={form.oldPrice}
                  onChange={(e) => set("oldPrice", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Emoji">
                <input className={inputCls} value={form.emoji} onChange={(e) => set("emoji", e.target.value)} />
              </Field>
              <Field label="Ombor (dona)">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["👕", "👖", "🧥", "👗", "👟", "🧢", "🧣", "👜"].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    haptic("light");
                    set("emoji", e);
                  }}
                  className={cn(
                    "press grid size-9 place-items-center rounded-xl text-lg transition-transform hover:-translate-y-0.5",
                    form.emoji === e ? "bg-primary/15 ring-1 ring-primary" : "bg-secondary",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
            <Field label="Mahsulot rasmi">
              <div className="flex items-center gap-3">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-tile-gradient text-2xl">
                  {form.image ? (
                    <img src={form.image} alt="Ko'rinish" className="size-full object-cover" />
                  ) : (
                    form.emoji || "👕"
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <label className="press cursor-pointer rounded-xl bg-secondary px-3 py-2 text-center text-xs font-bold">
                    📷 Telefondan rasm tanlash
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickFile(e.target.files?.[0])}
                    />
                  </label>
                  <input
                    className={inputCls}
                    placeholder="yoki rasm havolasi https://..."
                    value={form.image.startsWith("data:") ? "" : form.image}
                    onChange={(e) => set("image", e.target.value)}
                  />
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => set("image", "")}
                      className="press self-start text-[11px] font-semibold text-destructive"
                    >
                      Rasmni o'chirish
                    </button>
                  )}
                </div>
              </div>
            </Field>

            <Field label={`O'lchamlar (vergul bilan, masalan: ${defaultSizes.join(", ")})`}>
              <input className={inputCls} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} />
            </Field>
            <Field label="Ranglar (vergul bilan)">
              <input className={inputCls} value={form.colors} onChange={(e) => set("colors", e.target.value)} />
            </Field>
            <Field label="Tavsif">
              <textarea
                className={cn(inputCls, "min-h-20 resize-y")}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="size-4 accent-[oklch(0.52_0.24_295)]"
              />
              Yangi mahsulot belgisi
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={submit}
                className="press flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                <Plus className="size-4" /> {editing ? "Saqlash" : "Qo'shish"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setEditing(false);
                  }}
                  className="press rounded-xl bg-secondary px-4 text-sm font-semibold"
                >
                  Bekor
                </button>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold">Mahsulotlar ({products.length})</h2>
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-tile-gradient text-xl">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="size-full object-cover" />
                  ) : (
                    p.emoji
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-primary">{formatPrice(p.price)}</p>
                </div>
                <button
                  type="button"
                  aria-label="Tahrirlash"
                  onClick={() => {
                    haptic("light");
                    setEditing(true);
                    setForm({
                      id: p.id,
                      name: p.name,
                      category: p.category,
                      price: String(p.price),
                      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
                      emoji: p.emoji,
                      image: p.image ?? "",
                      sizes: (p.sizes ?? []).join(", "),
                      colors: (p.colors ?? []).join(", "),
                      stock: p.stock ? String(p.stock) : "",
                      isNew: !!p.isNew,
                      description: p.description,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="press grid size-9 place-items-center rounded-lg bg-secondary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="O'chirish"
                  onClick={() => {
                    haptic("warning");
                    deleteProduct(p.id);
                    toast("Mahsulot o'chirildi", { description: p.name });
                  }}
                  className="press grid size-9 place-items-center rounded-lg bg-destructive/10 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === "orders" && (
        <section className="space-y-2">
          {orders.length === 0 ? (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-soft">
              Buyurtmalar yo'q.
            </p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="space-y-2 rounded-2xl bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">#{o.id}</span>
                  <span className="text-sm font-bold text-primary">{formatPrice(o.total)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("uz-UZ")} · {o.name ?? "—"} · {o.phone}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {o.delivery === "courier" ? `Kuryer: ${o.address}` : "Olib ketish"}
                </p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {o.items.map((it) => (
                    <li key={`${it.productId}-${it.size ?? ""}`}>
                      {getProduct(it.productId)?.name ?? it.productId}
                      {it.size ? ` (${it.size})` : ""} × {it.qty}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {statusList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        haptic("light");
                        setOrderStatus(o.id, s);
                      }}
                      className={cn(
                        "press rounded-full px-2.5 py-1 text-[10px] font-bold",
                        o.status === s ? "bg-primary text-primary-foreground" : "bg-secondary",
                      )}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === "settings" && (
        <section className="space-y-2 rounded-2xl bg-card p-4 shadow-soft">
          <Field label="Do'kon nomi">
            <input
              className={inputCls}
              value={conf.shopName}
              onChange={(e) => setConf({ ...conf, shopName: e.target.value })}
            />
          </Field>
          <Field label="Admin username (@siz)">
            <input
              className={inputCls}
              value={conf.adminUsername}
              onChange={(e) => setConf({ ...conf, adminUsername: e.target.value })}
            />
          </Field>
          <Field label="Admin Telegram ID">
            <input
              className={inputCls}
              value={conf.adminId}
              onChange={(e) => setConf({ ...conf, adminId: e.target.value })}
            />
          </Field>
          <Field label="Telefon">
            <input
              className={inputCls}
              value={conf.phone}
              onChange={(e) => setConf({ ...conf, phone: e.target.value })}
            />
          </Field>
          <Field label="Kanal (@siz)">
            <input
              className={inputCls}
              value={conf.channel}
              onChange={(e) => setConf({ ...conf, channel: e.target.value })}
            />
          </Field>
          <Field label="Yetkazib berish narxi">
            <input
              className={inputCls}
              inputMode="numeric"
              value={String(conf.deliveryFee)}
              onChange={(e) => setConf({ ...conf, deliveryFee: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Admin PIN">
            <input
              className={inputCls}
              value={conf.adminPin}
              onChange={(e) => setConf({ ...conf, adminPin: e.target.value })}
            />
          </Field>
          <button
            type="button"
            onClick={() => {
              haptic("success");
              updateSettings(conf);
              toast.success("Sozlamalar saqlandi");
            }}
            className="press mt-1 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            Saqlash
          </button>
        </section>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
