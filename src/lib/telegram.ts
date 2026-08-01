import { useEffect, useState } from "react";

export type TgUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

type TgWebApp = {
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: { user?: TgUser };
  colorScheme?: string;
  HapticFeedback?: {
    impactOccurred: (s: string) => void;
    notificationOccurred: (s: string) => void;
    selectionChanged: () => void;
  };
};

function getWebApp(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
}

export function haptic(kind: "light" | "medium" | "success" | "warning" = "light") {
  const h = getWebApp()?.HapticFeedback;
  if (!h) return;
  if (kind === "success" || kind === "warning") h.notificationOccurred(kind);
  else h.impactOccurred(kind);
}

export function useTelegramUser() {
  const [user, setUser] = useState<TgUser | null>(null);

  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    try {
      wa.ready();
      wa.expand();
    } catch {
      /* noop */
    }
    setUser(wa.initDataUnsafe?.user ?? null);
  }, []);

  return user;
}
