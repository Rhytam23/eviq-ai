import Logo from "@/components/Logo";

export const metadata = { title: "Offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5">
      <Logo />
      <h1 className="mt-8 font-serif text-5xl tracking-tight">You are offline.</h1>
      <p className="mt-4 text-lg text-muted">
        Charger status changes by the hour, so EVIQ never shows saved data as if it were current.
        Reconnect and reload to see what is working near you.
      </p>
    </main>
  );
}
