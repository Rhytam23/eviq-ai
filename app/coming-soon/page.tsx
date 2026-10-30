import type { Metadata } from "next";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "EVIQ is launching in India first. Your region is coming soon.",
  robots: { index: false },
};

export default function ComingSoon() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5">
      <Logo />
      <h1 className="mt-10 font-serif text-6xl tracking-tight">
        Coming <em>soon</em> to your region.
      </h1>
      <p className="mt-4 text-lg text-muted">
        EVIQ is launching in India first, so we can get driver-verified charger status right in one
        country before we open elsewhere. We will open more regions later.
      </p>
    </main>
  );
}
