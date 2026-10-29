import { useCallback, useSyncExternalStore } from "react";
import { prefersMiles } from "@/lib/format";

const KEY = "eviq:miles";
const EVENT = "eviq:miles-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function read(): boolean {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored !== null) return stored === "1";
  } catch {
    /* storage can be blocked; fall back to the locale */
  }
  return prefersMiles(navigator.language);
}

/** Distance unit preference: saved choice, else the browser locale. Km on the server render. */
export function useMiles(): [boolean, (miles: boolean) => void] {
  const miles = useSyncExternalStore(subscribe, read, () => false);
  const set = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [miles, set];
}
