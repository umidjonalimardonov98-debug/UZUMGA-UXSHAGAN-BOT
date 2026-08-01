import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedProducts, type Product } from "@/data/products";

export type CartItem = {
  productId: string;
  size?: string;
  qty: number;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  total: number;
  delivery: string;
  address: string;
  phone: string;
  name?: string;
  status: OrderStatus;
};

export type Lang = "uz" | "ru";

export type Settings = {
  shopName: string;
  adminUsername: string;
  adminId: string;
  phone: string;
  channel: string;
  deliveryFee: number;
  adminPin: string;
};

type ShopState = {
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  products: Product[];
  lang: Lang;
  settings: Settings;
};

const STORAGE_KEY = "baraka-shop-state-v2";

const defaultSettings: Settings = {
  shopName: "Baraka Moda",
  adminUsername: "baraka_admin",
  adminId: "0",
  phone: "+998953909477",
  channel: "baraka_moda",
  deliveryFee: 25000,
  adminPin: "Umid2026",
};

const empty: ShopState = {
  cart: [],
  favorites: [],
  orders: [],
  products: seedProducts,
  lang: "uz",
  settings: defaultSettings,
};

type ShopContextValue = ShopState & {
  addToCart: (productId: string, size?: string, qty?: number) => void;
  setQty: (productId: string, size: string | undefined, qty: number) => void;
  removeFromCart: (productId: string, size?: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  placeOrder: (data: {
    delivery: string;
    address: string;
    phone: string;
    name?: string;
    total: number;
  }) => Order;
  cancelOrder: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  setLang: (l: Lang) => void;
  cartCount: number;
  cartTotal: number;
  getProduct: (id: string) => Product | undefined;
  adminLink: string;
  hydrated: boolean;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const sameLine = (a: CartItem, productId: string, size?: string) =>
  a.productId === productId && (a.size ?? "") === (size ?? "");

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ShopState>;
        const mergedSettings = { ...defaultSettings, ...(parsed.settings ?? {}) };
        if (!mergedSettings.adminPin || mergedSettings.adminPin === "1234") {
          mergedSettings.adminPin = defaultSettings.adminPin;
        }
        setState({
          ...empty,
          ...parsed,
          products: parsed.products?.length ? parsed.products : seedProducts,
          settings: mergedSettings,
        });

      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, hydrated]);

  const value = useMemo<ShopContextValue>(() => {
    const getProduct = (id: string) => state.products.find((p) => p.id === id);

    const cartTotal = state.cart.reduce((sum, item) => {
      const p = getProduct(item.productId);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);

    return {
      ...state,
      hydrated,
      getProduct,
      adminLink: `https://t.me/${state.settings.adminUsername.replace(/^@/, "")}`,
      cartCount: state.cart.reduce((n, i) => n + i.qty, 0),
      cartTotal,
      addToCart: (productId, size, qty = 1) =>
        setState((s) => {
          const exists = s.cart.find((i) => sameLine(i, productId, size));
          return {
            ...s,
            cart: exists
              ? s.cart.map((i) => (sameLine(i, productId, size) ? { ...i, qty: i.qty + qty } : i))
              : [...s.cart, { productId, size, qty }],
          };
        }),
      setQty: (productId, size, qty) =>
        setState((s) => ({
          ...s,
          cart:
            qty <= 0
              ? s.cart.filter((i) => !sameLine(i, productId, size))
              : s.cart.map((i) => (sameLine(i, productId, size) ? { ...i, qty } : i)),
        })),
      removeFromCart: (productId, size) =>
        setState((s) => ({ ...s, cart: s.cart.filter((i) => !sameLine(i, productId, size)) })),
      clearCart: () => setState((s) => ({ ...s, cart: [] })),
      toggleFavorite: (productId) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(productId)
            ? s.favorites.filter((f) => f !== productId)
            : [...s.favorites, productId],
        })),
      placeOrder: ({ delivery, address, phone, name, total }) => {
        const order: Order = {
          id: `BM-${Date.now().toString().slice(-6)}`,
          createdAt: Date.now(),
          items: state.cart,
          total,
          delivery,
          address,
          phone,
          name,
          status: "pending",
        };
        setState((s) => ({ ...s, orders: [order, ...s.orders], cart: [] }));
        return order;
      },
      cancelOrder: (id) =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)),
        })),
      setOrderStatus: (id, status) =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      saveProduct: (p) =>
        setState((s) => ({
          ...s,
          products: s.products.some((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [p, ...s.products],
        })),
      deleteProduct: (id) =>
        setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) })),
      updateSettings: (patch) =>
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      setLang: (lang) => setState((s) => ({ ...s, lang })),
    };
  }, [state, hydrated]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
