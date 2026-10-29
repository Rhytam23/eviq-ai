import type { Metadata } from "next";
import QRCode from "qrcode";
import Logo from "@/components/Logo";
import PrintButton from "@/components/PrintButton";
import { recordEvent } from "@/lib/metrics";
import { SITE_URL } from "@/lib/site";
import { lookupStation } from "@/lib/stationView";
import { isStationId } from "@/lib/validation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "QR sticker", robots: { index: false, follow: false } };

export default async function QrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  let id = "";
  try {
    id = decodeURIComponent(raw);
  } catch {
    notFound();
  }
  if (!isStationId(id)) notFound();

  recordEvent("qr_view");
  const url = `${SITE_URL}/s/${encodeURIComponent(id)}`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    width: 320,
  });
  // The name is a convenience: the sticker is still valid when the registry cannot be reached.
  const lookup = await lookupStation(raw);
  const name = lookup.found ? lookup.station.name : null;

  return (
    <main className="mx-auto max-w-md px-5 py-8 print:max-w-none print:p-0">
      <div className="print:hidden">
        <Logo />
        <p className="mt-6 text-sm text-muted">
          Print this and stick it at the charger (with the site owner&apos;s permission if it is on
          private property). Scanning it opens this charger&apos;s page with one-tap report buttons.
        </p>
      </div>
      <section
        aria-label="Sticker preview"
        className="mt-6 rounded-3xl border-2 border-ink bg-white p-8 text-center print:mt-0 print:rounded-none print:border-4"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">EVIQ</p>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-tight">Working or broken?</h1>
        <p className="mt-3 text-lg">Scan. Tap once. Tell the next driver.</p>
        <div
          role="img"
          aria-label={`QR code linking to ${url}`}
          className="mx-auto mt-6 w-64 print:w-80"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {name && <p className="mt-4 text-lg font-medium">{name}</p>}
        <p className="mt-1 break-all text-xs text-muted">{url}</p>
      </section>
      <div className="mt-6 print:hidden">
        <PrintButton />
      </div>
    </main>
  );
}
