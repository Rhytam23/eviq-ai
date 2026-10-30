import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "EVIQ: गाड़ी निकालने से पहले जानें कि चार्जर चलता है या नहीं",
  description:
    "EVIQ ड्राइवरों की एक-टैप रिपोर्ट से दिखाता है कि EV चार्जर चल रहा है या खराब। सबसे पहले भारत में।",
  alternates: { canonical: "/hi", languages: { "en-IN": "/", "hi-IN": "/hi" } },
};

export default function HindiPage() {
  return <LandingPage lang="hi" />;
}
