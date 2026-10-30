import type { Lang } from "@/lib/i18n";

export interface LandingCopy {
  htmlLang: string;
  nav: [string, string][];
  openMap: string;
  switchLang: { href: string; label: string; lang: string };
  badge: string;
  heroBefore: string;
  heroWord: string;
  heroAfter: string;
  heroText: string;
  ctaMap: string;
  ctaTalk: string;
  jump: string;
  noAccount: string;
  marquee: string[];
  gapTitle: [string, string, string];
  gap: { title: string; body: string }[];
  howTitle: string;
  howIntro: string;
  steps: { title: string; body: string }[];
  indiaTitle: [string, string, string];
  indiaIntro: string;
  indiaMapNote: string;
  openCity: string;
  englishNote: string | null;
  closing: string;
  demo: {
    title: string;
    registryLabel: string;
    registryStatus: string;
    eviqLabel: string;
    tapHeading: string;
    working: string;
    broken: string;
    busy: string;
    reset: string;
    note: string;
    example: string;
    ago: { h: string; d: string };
    justNow: string;
    statusText: Record<"verified" | "reported-broken" | "operator-offline" | "unverified", string>;
  };
  mapQuery: string;
}

const en: LandingCopy = {
  htmlLang: "en",
  nav: [
    ["/#how-it-works", "How it works"],
    ["/how-it-works", "Status rules"],
    ["/#data-and-api", "Data and API"],
    ["/developers", "Developers"],
    ["/#faq", "FAQ"],
  ],
  openMap: "Open map",
  switchLang: { href: "/hi", label: "हिन्दी", lang: "hi" },
  badge: "Launching in India first",
  heroBefore: "Know the charger ",
  heroWord: "works",
  heroAfter: " before you drive there.",
  heroText:
    "Registries tell you a charger exists. They cannot tell you it works. EVIQ adds what drivers see on the ground, one tap at a time, and turns it into a status you can check in your city.",
  ctaMap: "Open the live map",
  ctaTalk: "Talk to the founders",
  jump: "Jump to a city:",
  noAccount: "No account. We do not save your location in our database.",
  marquee: [
    "One tap, no account",
    "Reports age out",
    "Rules in the open",
    "Driver-verified",
    "Launching in India first",
    "Registry data plus ground truth",
  ],
  gapTitle: ["A charger on a map is a ", "promise", ". Nobody checks it."],
  gap: [
    {
      title: "A registry knows where, not whether",
      body: "Open Charge Map and OpenStreetMap record that a charger exists and who runs it. A status field can exist, but it depends on someone updating it, so it is often blank or stale.",
    },
    {
      title: "Drivers find out on arrival",
      body: "The first person to learn a charger is dead is whoever drives to it. That knowledge is never written down for the next driver.",
    },
    {
      title: "The people who know are right there",
      body: "Every driver at a charger can answer one question in one tap: did it work? Nobody collects those answers, so everyone starts from zero.",
    },
  ],
  howTitle: "Registry data plus what drivers actually see.",
  howIntro:
    "EVIQ is not another charger directory. It is a reliability layer on top of the open ones.",
  steps: [
    {
      title: "Read the registry",
      body: "We pull chargers, connectors, power and operator status from Open Charge Map, or OpenStreetMap anywhere it has no key or no coverage.",
    },
    {
      title: "Ask the drivers",
      body: "At a charger, one tap: working, broken or busy. No account, no form. Reports age out so old news cannot mislead.",
    },
    {
      title: "Compute one status, show the work",
      body: "Fresh driver reports and operator data become a single label with the time it was confirmed and the rule behind it.",
    },
  ],
  indiaTitle: ["Starting in India, one city at a ", "time", "."],
  indiaIntro:
    "Driver reports only help when there are enough of them in one place. So we are launching in India and going deep in a few cities before we open anywhere else. Pick a city to open the map there.",
  indiaMapNote:
    "Illustration: pin positions are real cities, but the colours cycle through example statuses. They are not live data.",
  openCity: "Open map",
  englishNote: null,
  closing: "See what is working near you, right now.",
  demo: {
    title: "Try it yourself",
    registryLabel: "What a registry shows",
    registryStatus: "Operational",
    eviqLabel: "What EVIQ shows",
    tapHeading: "You are at this charger. What do you see?",
    working: "Working",
    broken: "Broken",
    busy: "Busy",
    reset: "Reset the example",
    note: "Invented example charger, not a real station. Nothing you tap is saved. The status uses the same rule as the live map.",
    example: "Example charger, 2 × CCS 150 kW",
    ago: { h: "{n} h ago", d: "{n} days ago" },
    justNow: "just now",
    statusText: {
      verified: "Verified working",
      "reported-broken": "Reported broken",
      "operator-offline": "Operator says offline",
      unverified: "Unverified",
    },
  },
  mapQuery: "",
};

const hi: LandingCopy = {
  htmlLang: "hi",
  nav: [
    ["/hi#how-it-works", "कैसे काम करता है"],
    ["/how-it-works", "स्टेटस के नियम"],
    ["/developers", "डेवलपर्स"],
    ["/hi#faq", "सवाल-जवाब"],
  ],
  openMap: "मैप खोलें",
  switchLang: { href: "/", label: "English", lang: "en" },
  badge: "सबसे पहले भारत में",
  heroBefore: "गाड़ी निकालने से पहले जानें कि चार्जर ",
  heroWord: "चलता है",
  heroAfter: " या नहीं।",
  heroText:
    "रजिस्ट्री बताती हैं कि चार्जर कहाँ है, पर यह नहीं कि वह चल रहा है या नहीं। EVIQ में ड्राइवर एक टैप में बताते हैं कि चार्जर चल रहा है या खराब, और हम उसे आपके शहर के लिए एक साफ़ स्टेटस में बदल देते हैं।",
  ctaMap: "लाइव मैप खोलें",
  ctaTalk: "संस्थापकों से बात करें",
  jump: "शहर चुनें:",
  noAccount: "कोई अकाउंट नहीं। हम आपकी लोकेशन अपने डेटाबेस में सेव नहीं करते।",
  marquee: [
    "एक टैप, कोई अकाउंट नहीं",
    "पुरानी रिपोर्ट अपने-आप हट जाती हैं",
    "नियम सबके सामने",
    "ड्राइवरों से सत्यापित",
    "सबसे पहले भारत में",
  ],
  gapTitle: ["मैप पर चार्जर एक ", "वादा", " है। उसे कोई जाँचता नहीं।"],
  gap: [
    {
      title: "रजिस्ट्री जगह बताती है, हालत नहीं",
      body: "Open Charge Map और OpenStreetMap में दर्ज होता है कि चार्जर कहाँ है और कौन चलाता है। स्टेटस की जानकारी कोई अपडेट करे तभी बदलती है, इसलिए वह अक्सर खाली या पुरानी होती है।",
    },
    {
      title: "ड्राइवर को पहुँचकर पता चलता है",
      body: "चार्जर खराब है, यह सबसे पहले वही जानता है जो वहाँ गाड़ी लेकर पहुँचता है। यह जानकारी अगले ड्राइवर तक कभी नहीं पहुँचती।",
    },
    {
      title: "जानने वाले वहीं मौजूद हैं",
      body: "चार्जर पर खड़ा हर ड्राइवर एक टैप में बता सकता है कि चला या नहीं। ये जवाब कोई जमा नहीं करता, इसलिए हर कोई शून्य से शुरू करता है।",
    },
  ],
  howTitle: "रजिस्ट्री का डेटा और ड्राइवरों की आँखों देखी।",
  howIntro:
    "EVIQ कोई और चार्जर डायरेक्टरी नहीं है। यह खुली डायरेक्टरियों के ऊपर भरोसे की एक परत है।",
  steps: [
    {
      title: "रजिस्ट्री पढ़ते हैं",
      body: "हम Open Charge Map से, या जहाँ वह उपलब्ध न हो वहाँ OpenStreetMap से, चार्जर, कनेक्टर, पावर और ऑपरेटर का स्टेटस लेते हैं।",
    },
    {
      title: "ड्राइवरों से पूछते हैं",
      body: "चार्जर पर एक टैप: चल रहा है, खराब है या व्यस्त है। न अकाउंट, न फ़ॉर्म। रिपोर्ट समय के साथ हट जाती हैं ताकि पुरानी खबर भ्रम न फैलाए।",
    },
    {
      title: "एक स्टेटस, और उसका कारण भी",
      body: "ताज़ा ड्राइवर रिपोर्ट और ऑपरेटर का डेटा मिलकर एक लेबल बनते हैं, साथ में पुष्टि का समय और उसके पीछे का नियम भी दिखता है।",
    },
  ],
  indiaTitle: ["भारत से शुरुआत, एक-एक ", "शहर", " करके।"],
  indiaIntro:
    "ड्राइवर रिपोर्ट तभी काम आती हैं जब एक जगह पर काफ़ी हों। इसलिए हम भारत से शुरू कर रहे हैं और कहीं और खोलने से पहले कुछ शहरों में गहराई से काम करेंगे। मैप खोलने के लिए शहर चुनें।",
  indiaMapNote:
    "चित्र: पिन असली शहरों की जगह पर हैं, पर रंग उदाहरण वाले स्टेटस के बीच घूमते हैं। यह लाइव डेटा नहीं है।",
  openCity: "मैप खोलें",
  englishNote:
    "नीचे के तकनीकी हिस्से (नियम, डेटा और API, प्रगति, सवाल-जवाब) फ़िलहाल अंग्रेज़ी में हैं। मैप हिन्दी में खुलता है।",
  closing: "अभी देखें कि आपके पास क्या चल रहा है।",
  demo: {
    title: "खुद आज़माएँ",
    registryLabel: "रजिस्ट्री क्या दिखाती है",
    registryStatus: "चालू",
    eviqLabel: "EVIQ क्या दिखाता है",
    tapHeading: "आप इस चार्जर पर हैं। आपको क्या दिख रहा है?",
    working: "चल रहा है",
    broken: "खराब है",
    busy: "व्यस्त है",
    reset: "उदाहरण दोबारा शुरू करें",
    note: "यह एक काल्पनिक उदाहरण चार्जर है, असली स्टेशन नहीं। आप जो टैप करते हैं वह सेव नहीं होता। स्टेटस उसी नियम से बनता है जो लाइव मैप में चलता है।",
    example: "उदाहरण चार्जर, 2 × CCS 150 kW",
    ago: { h: "{n} घंटे पहले", d: "{n} दिन पहले" },
    justNow: "अभी-अभी",
    statusText: {
      verified: "चलता हुआ (सत्यापित)",
      "reported-broken": "खराब बताया गया",
      "operator-offline": "ऑपरेटर के अनुसार बंद",
      unverified: "असत्यापित",
    },
  },
  mapQuery: "lang=hi",
};

export const LANDING_COPY: Record<Lang, LandingCopy> = { en, hi };
