"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5">
      <h1 className="font-serif text-5xl tracking-tight">Something broke on our side.</h1>
      <p className="mt-4 text-lg text-muted">
        The error was logged. Try again, or head back to the map.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full bg-brand px-6 font-medium text-white"
        >
          Try again
        </button>
        <Link
          href="/map"
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-6 font-medium"
        >
          Open the map
        </Link>
      </div>
    </main>
  );
}
