import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5">
      <Logo />
      <h1 className="mt-10 font-serif text-6xl tracking-tight">
        This page is <em>offline</em>.
      </h1>
      <p className="mt-4 text-lg text-muted">
        Unlike chargers, we can tell you for sure: there is nothing at this address.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/map" className="rounded-full bg-brand px-6 py-3 font-medium text-white">
          Open the map
        </Link>
        <Link href="/" className="rounded-full border border-ink/20 px-6 py-3 font-medium">
          Home
        </Link>
      </div>
    </main>
  );
}
