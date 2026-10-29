import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What EVIQ stores when you use the map or send a charger report.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Logo />
      <h1 className="mt-10 font-serif text-5xl tracking-tight">Privacy</h1>
      <div className="mt-8 space-y-6 leading-relaxed text-muted [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink">
        <p>There are no accounts. This is what happens to your data when you use EVIQ.</p>
        <section>
          <h2>Your location</h2>
          <p>
            Your browser asks permission before sharing your location. Coordinates are sent to our
            server to find nearby chargers, which in turn asks Open Charge Map or OpenStreetMap for
            stations around a point rounded to about 100 metres. We do not save your location in our
            database. Our hosting provider may keep ordinary request logs.
          </p>
        </section>
        <section>
          <h2>Reports</h2>
          <p>
            When you tap working, broken or busy, we store the charger, your answer, the time and a
            one-way hash made from your network address and browser. The hash lets us enforce one
            report per charger every ten minutes. We cannot turn it back into your address. Reports
            older than 72 hours no longer affect any status.
          </p>
        </section>
        <section>
          <h2>City search</h2>
          <p>
            Searches are sent to Nominatim (OpenStreetMap) through our server, only when you submit
            them.
          </p>
        </section>
        <section>
          <h2>Cookies and tracking</h2>
          <p>
            We set no cookies and run no analytics. Your distance unit choice is kept in your
            browser&apos;s local storage.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            Questions or deletion requests:{" "}
            <a className="underline" href="mailto:founders@eviq.ai">
              founders@eviq.ai
            </a>
            .
          </p>
        </section>
        <Link href="/" className="inline-block text-brand underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
