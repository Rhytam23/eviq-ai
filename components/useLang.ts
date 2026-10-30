import { useCallback, useSyncExternalStore } from "react";
import { isLang, type Lang } from "@/lib/i18n";

const KEY = "eviq:lang";
const EVENT = "eviq:lang-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function read(): Lang {
  try {
    const stored = localStorage.getItem(KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* storage can be blocked; fall back to English */
  }
  return "en";
}

/** Saved language for the map screens. English on the server render, so the first paint always matches. */
export function useLang(): [Lang, (lang: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => "en" as Lang);
  const set = useCallback((value: Lang) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [lang, set];
}
