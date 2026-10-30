import { timeAgo } from "@/lib/format";
import type { Reliability } from "@/types/station";

export type Lang = "en" | "hi";
export const LANGS: Lang[] = ["en", "hi"];
export const LANG_NAMES: Record<Lang, string> = { en: "English", hi: "हिन्दी" };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value);
}

/** Map-screen strings. Add a language by adding a column; keys are checked by the compiler. */
const en = {
  reportHeading: "Was it working when you got here?",
  working: "Working",
  workingHint: "I charged here",
  broken: "Broken",
  brokenHint: "It would not charge",
  busy: "Busy",
  busyHint: "All bays in use",
  sending: "Sending…",
  thanks: "Thanks, your report is in. You can report this charger again in {n} minutes.",
  memoryNotice:
    "Reports are not persisted on this server: they are kept in memory and lost on restart. Set the Supabase variables to store them.",
  reportsUnavailable:
    "Driver reports could not be loaded just now, so statuses show operator data only.",
  searchLabel: "Search for a city or address",
  searchPlaceholder: "Search an Indian city or address",
  search: "Search",
  searching: "Searching",
  jumpToCity: "Jump to a city",
  back: "Back to list",
  directions: "Get directions",
  sharePage: "Share page",
  whatsapp: "Share on WhatsApp",
  qr: "QR sticker",
  chargers: "Chargers",
  chargingPoints: "Charging points",
  price: "Price",
  unknown: "Unknown",
  recentReports: "Recent driver reports",
  noReports: "No driver reports in the last 72 hours. Be the first.",
  why: "Why",
  justNow: "just now",
  whatsappText: "{name}: {status}. Check it on EVIQ:",
} as const;

export type Key = keyof typeof en;

const hi: Record<Key, string> = {
  reportHeading: "यहाँ पहुँचने पर क्या यह चल रहा था?",
  working: "चल रहा है",
  workingHint: "मैंने यहाँ चार्ज किया",
  broken: "खराब है",
  brokenHint: "चार्ज नहीं हुआ",
  busy: "व्यस्त है",
  busyHint: "सभी स्लॉट भरे हैं",
  sending: "भेज रहे हैं…",
  thanks: "धन्यवाद, आपकी रिपोर्ट मिल गई। आप इस चार्जर की दोबारा रिपोर्ट {n} मिनट बाद कर सकते हैं।",
  memoryNotice:
    "इस सर्वर पर रिपोर्ट सेव नहीं होतीं: वे मेमोरी में रहती हैं और रीस्टार्ट पर मिट जाती हैं।",
  reportsUnavailable:
    "ड्राइवर रिपोर्ट अभी लोड नहीं हो सकीं, इसलिए स्टेटस सिर्फ़ ऑपरेटर डेटा पर आधारित है।",
  searchLabel: "शहर या पता खोजें",
  searchPlaceholder: "भारत का कोई शहर या पता खोजें",
  search: "खोजें",
  searching: "खोज रहे हैं",
  jumpToCity: "शहर चुनें",
  back: "सूची पर वापस",
  directions: "रास्ता देखें",
  sharePage: "पेज शेयर करें",
  whatsapp: "WhatsApp पर शेयर करें",
  qr: "QR स्टिकर",
  chargers: "चार्जर",
  chargingPoints: "चार्जिंग पॉइंट",
  price: "कीमत",
  unknown: "पता नहीं",
  recentReports: "ड्राइवरों की हालिया रिपोर्ट",
  noReports: "पिछले 72 घंटों में कोई ड्राइवर रिपोर्ट नहीं। पहली रिपोर्ट आप करें।",
  why: "कारण",
  justNow: "अभी-अभी",
  whatsappText: "{name}: {status}। EVIQ पर देखें:",
};

const DICTIONARIES: Record<Lang, Record<Key, string>> = { en, hi };

export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  return DICTIONARIES[lang][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(vars[name] ?? "")
  );
}

const STATUS_LABELS_HI: Record<Reliability, string> = {
  verified: "चलता हुआ (सत्यापित)",
  "reported-broken": "खराब बताया गया",
  "operator-offline": "ऑपरेटर के अनुसार बंद",
  unverified: "असत्यापित",
};

export function statusLabelIn(lang: Lang, status: Reliability, english: string): string {
  return lang === "hi" ? STATUS_LABELS_HI[status] : english;
}

export function timeAgoIn(lang: Lang, iso: string | null, now: number = Date.now()): string {
  if (lang === "en" || !iso) return timeAgo(iso, now);
  const diff = Math.max(0, now - Date.parse(iso));
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "अभी-अभी";
  if (min < 60) return `${min} मिनट पहले`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr} घंटे पहले`;
  const days = Math.floor(hr / 24);
  if (days < 60) return `${days} दिन पहले`;
  return `${Math.floor(days / 30)} महीने पहले`;
}
